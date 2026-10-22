/**
 * Hybrid retrieval over pgvector + Postgres full-text search.
 *
 *   dense  : HNSW cosine search on bge embeddings      (semantic match)
 *   sparse : weighted tsvector + ts_rank_cd            (exact terms, names, jargon)
 *   entity : chunks of courses named in the query       (precision for "tell me about X")
 *
 * The three ranked lists are fused with Reciprocal Rank Fusion in one SQL round
 * trip, then the top candidates are re-scored with a cross-encoder.
 */
const { sql } = require("../db");
const { env } = require("../config/env");
const { embedQuery, rerankScores } = require("./models");

const RRF_K = 60;
const CANDIDATES_PER_LEG = 30;
const RERANK_POOL = 16;
const MAX_PINNED_COURSES = 3;

/** Pure RRF, exported for tests and for fusing result lists outside SQL. */
function reciprocalRankFusion(lists, k = RRF_K) {
  const scores = new Map();
  for (const list of lists) {
    list.forEach((id, rank) => scores.set(id, (scores.get(id) || 0) + 1 / (k + rank + 1)));
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id, score]) => ({ id, score }));
}

async function hybridSearch({ queryVector, lexicalQuery, courseCodes = [], season = null, limit = 24 }) {
  const vectorLiteral = `[${queryVector.join(",")}]`;
  return sql.query(
    `
    WITH dense AS (
      SELECT id, row_number() OVER (ORDER BY dist) AS rank, 1 - dist AS similarity
      FROM (
        SELECT id, embedding <=> $1::vector AS dist
        FROM rag_chunks
        WHERE ($4::text IS NULL OR season = $4 OR season IS NULL)
        ORDER BY embedding <=> $1::vector
        LIMIT $5
      ) d
    ),
    sparse AS (
      SELECT id, row_number() OVER (ORDER BY score DESC) AS rank
      FROM (
        SELECT id, ts_rank_cd(tsv, q, 32) AS score
        FROM rag_chunks, to_tsquery('english', $2) q
        WHERE $2 <> '' AND tsv @@ q
          AND ($4::text IS NULL OR season = $4 OR season IS NULL)
        ORDER BY score DESC
        LIMIT $5
      ) s
    ),
    entity AS (
      SELECT id, row_number() OVER (ORDER BY chunk_index) AS rank
      FROM rag_chunks
      WHERE course_code = ANY($3::text[])
        AND ($4::text IS NULL OR season = $4 OR season IS NULL)
      LIMIT $5
    ),
    fused AS (
      SELECT id, sum(rrf) AS rrf, max(similarity) AS similarity,
             bool_or(leg = 'dense') AS in_dense, bool_or(leg = 'sparse') AS in_sparse, bool_or(leg = 'entity') AS in_entity
      FROM (
        SELECT id, 1.0 / ($6 + rank) AS rrf, similarity, 'dense' AS leg FROM dense
        UNION ALL SELECT id, 1.0 / ($6 + rank), NULL, 'sparse' FROM sparse
        UNION ALL SELECT id, 1.0 / ($6 + rank), NULL, 'entity' FROM entity
      ) legs
      GROUP BY id
    )
    SELECT c.id, c.course_code, c.course_title, c.section, c.heading_path, c.season, c.program,
           c.content, c.metadata, f.rrf, f.similarity, f.in_dense, f.in_sparse, f.in_entity
    FROM fused f JOIN rag_chunks c ON c.id = f.id
    ORDER BY f.rrf DESC
    LIMIT $7
    `,
    [vectorLiteral, lexicalQuery, courseCodes, season, CANDIDATES_PER_LEG, RRF_K, limit]
  );
}

/**
 * Fact chunks (catalog entry + syllabus overview) for courses the question names.
 * Comparisons like "is X harder than Y" need these even when they rank low.
 */
async function pinnedFacts(courseCodes) {
  if (!courseCodes.length) return [];
  return sql.query(
    `SELECT DISTINCT ON (course_code, section)
            id, course_code, course_title, section, heading_path, season, program, content, metadata,
            0::float AS rrf, NULL::float AS similarity, false AS in_dense, false AS in_sparse, true AS in_entity
     FROM rag_chunks
     WHERE course_code = ANY($1::text[]) AND section IN ('Catalog entry', 'Overview')
     ORDER BY course_code, section, id`,
    [courseCodes.slice(0, MAX_PINNED_COURSES)]
  );
}

const passageText = (c) =>
  `${c.course_title ? `${c.course_title} (${c.course_code}) — ` : ""}${c.section || ""}\n${c.content}`;

/** Same course + section from different program syllabi is the same text; keep the best. */
function dedupe(chunks) {
  const seen = new Set();
  return chunks.filter((c) => {
    // Formatting differs slightly between program files, so key on structure, not text.
    const key = c.course_code ? `${c.course_code}|${c.section}|${c.metadata?.part ?? 0}` : `id:${c.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * @returns {{ chunks: object[], timings: object }} chunks sorted by final relevance.
 */
async function retrieve(analysis, { topK = 6, rerank = env.RAG_RERANK } = {}) {
  const timings = {};
  let t = Date.now();
  const queryVector = await embedQuery(analysis.searchQuery);
  timings.embedMs = Date.now() - t;

  t = Date.now();
  let [candidates, pinned] = await Promise.all([
    hybridSearch({ ...analysis, queryVector }),
    pinnedFacts(analysis.courseCodes || []),
  ]);
  // A season filter that empties the result set is worse than no filter.
  if (!candidates.length && analysis.season) candidates = await hybridSearch({ ...analysis, season: null, queryVector });
  timings.searchMs = Date.now() - t;

  candidates = dedupe(candidates);

  if (rerank && candidates.length > 1) {
    t = Date.now();
    const pool = candidates.slice(0, RERANK_POOL);
    const scores = await rerankScores(analysis.searchQuery, pool.map(passageText));
    candidates = pool
      .map((c, i) => ({ ...c, rerankScore: scores[i] }))
      .sort((a, b) => b.rerankScore - a.rerankScore);
    timings.rerankMs = Date.now() - t;
  }

  const top = candidates.slice(0, topK);
  const pinnedExtra = dedupe([...top, ...pinned]).slice(top.length).map((c) => ({ ...c, pinned: true }));
  return { chunks: [...top, ...pinnedExtra], timings };
}

module.exports = { retrieve, hybridSearch, reciprocalRankFusion, dedupe };
