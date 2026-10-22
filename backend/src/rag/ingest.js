/**
 * Ingestion pipeline: load → chunk → embed → upsert.
 * Idempotent: each source is checksummed; unchanged sources are skipped and
 * changed ones are replaced atomically (delete + insert in one batch transaction).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { eq } = require("drizzle-orm");
const db = require("../db");
const { ragDocuments, ragChunks } = require("../db/schema");
const { chunkSyllabus, chunkCatalog } = require("./chunker");
const { embedPassages } = require("./models");
const { env } = require("../config/env");

const DATA_DIR = path.resolve(__dirname, "../../data");
const SYLLABI_DIR = path.join(DATA_DIR, "syllabi");
const INSERT_BATCH = 50;
// Bump when chunking/embedding logic changes so every source is re-indexed.
const PIPELINE_VERSION = "1";

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

function loadCatalog() {
  return ["monsoon", "spring"].flatMap((season) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${season}.json`), "utf8")));
}

/** Discover every source as { sourceId, sourceType, title, season, program, raw, chunk() }. */
function discoverSources() {
  const catalogCourses = loadCatalog();
  const catalog = new Map(catalogCourses.map((c) => [c.code, c]));

  const syllabi = fs
    .readdirSync(SYLLABI_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((file) => {
      const raw = fs.readFileSync(path.join(SYLLABI_DIR, file), "utf8");
      const [season, program] = path.basename(file, ".md").split("-");
      const title = (/^#\s+(.+)$/m.exec(raw)?.[1] || file).trim();
      const meta = { season, program: program.toUpperCase() };
      return {
        sourceId: `syllabus/${file}`,
        sourceType: "syllabus",
        title,
        ...meta,
        raw,
        chunk: () => chunkSyllabus(raw, { ...meta, catalog }),
      };
    });

  const catalogRaw = JSON.stringify(catalogCourses);
  return [
    ...syllabi,
    {
      sourceId: "catalog/courses.json",
      sourceType: "catalog",
      title: "Course catalog",
      season: null,
      program: null,
      raw: catalogRaw,
      chunk: () => chunkCatalog(catalogCourses),
    },
  ];
}

async function ingestSource(source, { force = false, log = console.log } = {}) {
  const checksum = sha256(`${PIPELINE_VERSION}:${env.EMBEDDING_MODEL}:${source.raw}`);
  const [existing] = await db.select().from(ragDocuments).where(eq(ragDocuments.sourceId, source.sourceId));
  if (existing && existing.checksum === checksum && !force) {
    log(`  = ${source.sourceId} unchanged (${existing.chunkCount} chunks)`);
    return { sourceId: source.sourceId, status: "unchanged", chunks: existing.chunkCount };
  }

  const chunks = source.chunk();
  const t0 = Date.now();
  const vectors = await embedPassages(chunks.map((c) => c.embedText));
  log(`  ~ ${source.sourceId}: embedded ${chunks.length} chunks in ${Date.now() - t0} ms`);

  const docValues = {
    sourceId: source.sourceId,
    sourceType: source.sourceType,
    title: source.title,
    season: source.season,
    program: source.program,
    checksum,
    chunkCount: chunks.length,
    metadata: { pipelineVersion: PIPELINE_VERSION, embeddingModel: env.EMBEDDING_MODEL },
    updatedAt: new Date(),
  };

  // Checksum stays 'pending' until the chunk batch commits, so a crashed run is retried.
  const pending = { ...docValues, checksum: "pending" };
  const [doc] = await db
    .insert(ragDocuments)
    .values(pending)
    .onConflictDoUpdate({ target: ragDocuments.sourceId, set: pending })
    .returning({ id: ragDocuments.id });

  const rows = chunks.map((c, i) => ({
    documentId: doc.id,
    chunkIndex: c.chunkIndex,
    courseCode: c.courseCode,
    courseTitle: c.courseTitle,
    section: c.section,
    headingPath: c.headingPath,
    season: c.season,
    program: c.program,
    content: c.content,
    tokenCount: c.tokenCount,
    metadata: c.metadata,
    embedding: vectors[i],
  }));

  // neon-http batch = single transaction: old chunks vanish only if all new ones land.
  const statements = [db.delete(ragChunks).where(eq(ragChunks.documentId, doc.id))];
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    statements.push(db.insert(ragChunks).values(rows.slice(i, i + INSERT_BATCH)));
  }
  statements.push(db.update(ragDocuments).set({ checksum }).where(eq(ragDocuments.id, doc.id)));
  await db.batch(statements);

  log(`  + ${source.sourceId}: stored ${rows.length} chunks`);
  return { sourceId: source.sourceId, status: existing ? "updated" : "created", chunks: rows.length };
}

/** Remove documents whose source file no longer exists. */
async function pruneOrphans(activeIds, { log = console.log } = {}) {
  const docs = await db.select({ id: ragDocuments.id, sourceId: ragDocuments.sourceId }).from(ragDocuments);
  const orphans = docs.filter((d) => !activeIds.has(d.sourceId));
  for (const d of orphans) {
    await db.delete(ragDocuments).where(eq(ragDocuments.id, d.id)); // chunks cascade
    log(`  - ${d.sourceId}: removed (source deleted)`);
  }
  return orphans.length;
}

async function ingestAll({ force = false, log = console.log } = {}) {
  const sources = discoverSources();
  const results = [];
  for (const source of sources) results.push(await ingestSource(source, { force, log }));
  const pruned = await pruneOrphans(new Set(sources.map((s) => s.sourceId)), { log });
  return { results, pruned };
}

module.exports = { ingestAll, discoverSources };
