process.env.DATABASE_URL ||= "postgresql://test:test@localhost/test";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { chunkSyllabus, chunkCatalog, parseSections, splitText, MAX_CHARS } = require("../src/rag/chunker");
const { reciprocalRankFusion, dedupe } = require("../src/rag/retriever");
const { buildLexicalQuery, extractSeason } = require("../src/rag/queryAnalyzer");
const { buildContext } = require("../src/rag/prompts");
const { usedCitations } = require("../src/rag/pipeline");

const DATA = path.join(__dirname, "..", "data");
const catalogCourses = [...require(path.join(DATA, "monsoon.json")), ...require(path.join(DATA, "spring.json"))];
const catalog = new Map(catalogCourses.map((c) => [c.code, c]));

test("parseSections tracks heading paths and strips emoji/numbering", () => {
  const sections = parseSections("# Doc\n\n## 01. Course A\nbody\n### 📋 Course Summary\ntext");
  const summary = sections.find((s) => s.heading === "Course Summary");
  assert.deepEqual(summary.path, ["Doc", "Course A", "Course Summary"]);
  assert.equal(sections.find((s) => s.heading === "Course A").body, "body");
});

test("chunkSyllabus scopes sections to the course that owns them", () => {
  const md = [
    "# Catalogue",
    "## Compilers",
    "| Field | Value |",
    "|---|---|",
    "| **Course Code** | `CS1.403` |",
    "| **Instructor** | Jane Doe |",
    "### Summary",
    "Lexing, parsing, type checking and code generation for real languages.",
    "## Other Topic",
    "General text that is long enough to be indexed as its own chunk of content.",
  ].join("\n");
  const chunks = chunkSyllabus(md, { season: "spring", program: "CSE", catalog });
  const overview = chunks.find((c) => c.section === "Overview");
  assert.equal(overview.courseCode, "CS1.403");
  assert.match(overview.content, /Instructor: Jane Doe/);
  assert.equal(chunks.find((c) => c.section === "Summary").courseCode, "CS1.403");
  assert.equal(chunks.find((c) => c.section === "Other Topic").courseCode, null);
  assert.match(overview.embedText, /^Course: Compilers \(CS1\.403\) \| Season: spring/);
});

test("every catalog course is covered by the real syllabi and no chunk exceeds the size cap", () => {
  const dir = path.join(DATA, "syllabi");
  const covered = new Set();
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const [season, program] = file.replace(".md", "").split("-");
    const chunks = chunkSyllabus(fs.readFileSync(path.join(dir, file), "utf8"), { season, program, catalog });
    for (const c of chunks) {
      if (c.courseCode) covered.add(c.courseCode);
      assert.ok(c.content.length <= MAX_CHARS + 200, `${file} chunk ${c.chunkIndex} is ${c.content.length} chars`);
    }
  }
  const missing = catalogCourses.filter((c) => !covered.has(c.code)).map((c) => c.code);
  assert.deepEqual(missing, []);
});

test("splitText respects the size cap and overlaps neighbouring chunks", () => {
  const text = Array.from({ length: 60 }, (_, i) => `Sentence number ${i} talks about distributed consensus.`).join(" ");
  const parts = splitText(text);
  assert.ok(parts.length > 1);
  parts.forEach((p) => assert.ok(p.length <= MAX_CHARS));
  assert.ok(parts[1].includes(parts[0].slice(-40).split(" ").slice(-2).join(" ")));
});

test("chunkCatalog emits one fact chunk per course", () => {
  const chunks = chunkCatalog(catalogCourses);
  assert.equal(chunks.length, catalogCourses.length);
  assert.match(chunks[0].content, /Credits: \d/);
});

test("reciprocalRankFusion rewards documents ranked well by several lists", () => {
  const fused = reciprocalRankFusion([["a", "b", "c"], ["b", "c", "d"]]);
  assert.equal(fused[0].id, "b");
  assert.ok(fused.find((f) => f.id === "d").score < fused.find((f) => f.id === "c").score);
});

test("dedupe collapses identical course sections from different program syllabi", () => {
  const c = { course_code: "CS1.403", section: "Assessment" };
  const out = dedupe([
    { ...c, id: 1, content: "| Quizzes | yes | 15% |" },
    { ...c, id: 2, content: "| Quizzes   | yes | 15% |" },
    { ...c, id: 4, section: "Summary", content: "part 2", metadata: { part: 2 } },
    { id: 3, course_code: null, content: "x" },
  ]);
  assert.deepEqual(out.map((o) => o.id), [1, 4, 3]);
});

test("lexical query is sanitised and OR-joined", () => {
  assert.equal(buildLexicalQuery("Which courses teach Raft & Paxos?!"), "raft | paxos");
  assert.equal(buildLexicalQuery("'; DROP TABLE x; --"), "drop | table");
});

test("season extraction", () => {
  assert.equal(extractSeason("spring electives for ML"), "spring");
  assert.equal(extractSeason("monsoon semester"), "monsoon");
  assert.equal(extractSeason("spring vs monsoon"), null);
});

test("context is numbered and citations are filtered to the ones the answer used", () => {
  const chunks = [1, 2, 3].map((id) => ({ id, course_code: `CS1.40${id}`, course_title: `C${id}`, section: "Summary", season: "spring", content: `content ${id}`, rrf: 0.1 }));
  const { contextText, citations } = buildContext(chunks);
  assert.match(contextText, /^\[1\] C1 \(CS1\.401\)/);
  assert.deepEqual(usedCitations("Take C1 [1] and C3 [3].", citations).map((c) => c.n), [1, 3]);
});
