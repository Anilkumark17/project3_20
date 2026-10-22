# RAG Pipeline

Grounded Q&A over the Monsoon/Spring syllabi. Stack: Neon Postgres + **pgvector**, local ONNX models (transformers.js), **Groq** for generation. No external vector DB, no embedding API.

## Flow

```
INGEST (npm run rag:ingest)
 data/syllabi/*.md + data/{monsoon,spring}.json
   -> structure-aware chunker -> bge-small embeddings (384-d) -> rag_documents / rag_chunks

QUERY (POST /api/rag/ask/stream)
 question
   -> 1 condense follow-up (Groq fast model, only if history)
   -> 2 analyse: season filter, course-code/title linking, tsquery
   -> 3 hybrid retrieve (one SQL): dense HNSW + FTS ts_rank_cd + entity, fused by RRF
   -> 4 rerank top 16 with cross-encoder (ms-marco-MiniLM)
   -> 5 pin catalog/overview facts for courses named in the question
   -> 6 build numbered context [1..n] under a char budget
   -> 7 Groq stream with student profile + history; answer cites [n]
   -> 8 persist exchange + citations, log timings to rag_query_logs
```

## Chunking (`src/rag/chunker.js`)
- Markdown parsed into heading sections with a heading path; a heading whose table has a `Course Code` row opens a course scope.
- Per course: **Overview** chunk (code, credits, instructor, difficulty, summary) + one chunk per subsection (Learning Outcomes, Assessment...).
- Oversized sections split on paragraph/line/sentence, ~1200 chars, 200 overlap; tables kept atomic.
- Every chunk embeds with a contextual header: `Course | Season | Program | Section`.
- JSON catalog adds one fact chunk per course. Result: ~930 chunks, all 119 catalog courses covered (unit-tested).

## Retrieval (`src/rag/retriever.js`)
- Dense: `embedding <=> query` (cosine, HNSW). bge query prefix applied to queries only.
- Sparse: weighted `tsvector` (title A, section B, body C), OR-joined query.
- Entity: all chunks of courses mentioned by code/title.
- Fusion: Reciprocal Rank Fusion (k=60). Season filter falls back to none if it empties results.
- Dedup: same course+section across program files collapses.

## Generation (`src/rag/prompts.js`, `pipeline.js`)
- System prompt: answer only from numbered sources, cite `[n]`, refuse when sources lack the answer, personalise with profile (program, goal, completed).
- Only citations the answer actually used are returned/stored.
- Status `no_context` when nothing relevant survives the rerank threshold.

## Schema (`src/db/schema.js`)
`rag_documents` (source, checksum), `rag_chunks` (vector(384) + HNSW, generated tsvector + GIN, course/season metadata), `conversations`, `messages` (citations jsonb), `rag_query_logs` (timings, tokens, status).

## Operations
| Command | Purpose |
|---|---|
| `npm run db:setup` | enable pgvector + push schema |
| `npm run seed` | load courses table |
| `npm run rag:ingest [-- --force]` | incremental index (checksum per source, atomic replace) |
| `npm run rag:eval` | Hit@k/MRR: dense vs hybrid vs hybrid+rerank on `eval/golden.json` |
| `npm test` | chunker, RRF, dedupe, citation tests |
| `GET /api/rag/stats` (admin) | index size, p50/p95 latency, error rate |
| `GET /api/rag/search?q=` (admin) | retrieval-only debug |

Changing the embedding model: update `EMBEDDING_MODEL` and `EMBEDDING_DIM` in the schema, `db:push`, `rag:ingest --force`.

## Measured (24-question golden set, PGlite+pgvector, real models)
| Config | Hit@1 | Hit@3 | MRR |
|---|---|---|---|
| dense only | 79% | 96% | 0.868 |
| hybrid RRF | 71% | 83% | 0.800 |
| hybrid + rerank | **92%** | 96% | **0.938** |

Latency (local CPU): embed ~0.1 s, search ~0.2 s, rerank ~2 s, first token ~0.5 s. Re-run `rag:eval` against Neon to confirm.

## Security
Clerk JWT on every route; `requireSelf` on `:clerkId`; conversations scoped by user; rate limit 20 q/min; zod-validated inputs; sanitised tsquery; course writes and diagnostics admin-only (`publicMetadata.role = "admin"`).
