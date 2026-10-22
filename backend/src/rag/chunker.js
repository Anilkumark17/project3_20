/**
 * Structure-aware chunking for the syllabus markdown and the JSON catalog.
 *
 * Markdown strategy:
 *  1. Parse into heading-delimited sections, tracking the heading path.
 *  2. A heading whose body contains a "Course Code" row opens a course scope;
 *     every deeper heading until the next sibling belongs to that course.
 *  3. Within a course, the metadata table + summary form an "Overview" chunk;
 *     each subsection (Learning Outcomes, Assessment, ...) becomes its own chunk.
 *  4. Oversized sections are split on paragraph / line / sentence boundaries
 *     with overlap; table rows are never split.
 *  5. Each chunk carries a contextual header (course, code, season, section)
 *     that is embedded with the text so a chunk is meaningful on its own.
 */

const TARGET_CHARS = 1200; // ~300 tokens
const MAX_CHARS = 1600;
const OVERLAP_CHARS = 200;
const MIN_CHARS = 40;

const COURSE_CODE_RE = /\b([A-Z]{2,4}\d{0,2}\.\d{3})\b/;
const COURSE_CODE_ROW_RE = /\*\*Course Code\*\*\s*\|\s*`?([A-Z]{2,4}\d{0,2}\.\d{3})`?/;
const SKIP_SECTION_RE = /table of contents|quick reference|category legend/i;

const estimateTokens = (text) => Math.ceil(text.length / 4);

function cleanHeading(raw) {
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "") // emoji
    .replace(/^\d+\.\s+/, "") // "01. Title"
    .replace(/\s+/g, " ")
    .trim();
}

function normaliseText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Split markdown into sections: { level, heading, path[], body }. */
function parseSections(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  const stack = [];
  let current = { level: 0, heading: "", path: [], lines: [] };

  for (const line of lines) {
    const m = /^(#{1,6})\s+(.*)$/.exec(line);
    // Very long "headings" are body text that was mis-formatted during PDF conversion.
    if (m && m[2].length <= 120) {
      sections.push(current);
      const level = m[1].length;
      const heading = cleanHeading(m[2]);
      while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
      stack.push({ level, heading });
      current = { level, heading, path: stack.map((s) => s.heading), lines: [] };
    } else {
      current.lines.push(m ? m[2] : line);
    }
  }
  sections.push(current);

  return sections.map((s) => ({ level: s.level, heading: s.heading, path: s.path, body: normaliseText(s.lines.join("\n")) }));
}

/** Parse "| **Field** | value |" rows into a plain object. */
function parseFieldTable(body) {
  const fields = {};
  for (const row of body.matchAll(/^\|\s*\*\*([^*]+)\*\*\s*\|\s*(.*?)\s*\|\s*$/gm)) {
    const value = row[2].replace(/`/g, "").trim();
    if (value && value !== "—" && value !== "-") fields[row[1].trim()] = value;
  }
  return fields;
}

/** Recursively split text on the coarsest boundary that keeps pieces under MAX_CHARS. */
function splitText(text, separators = ["\n\n", "\n", ". ", " "]) {
  if (text.length <= MAX_CHARS) return [text];
  const [sep, ...rest] = separators;
  if (sep === undefined) {
    const out = [];
    for (let i = 0; i < text.length; i += MAX_CHARS - OVERLAP_CHARS) out.push(text.slice(i, i + MAX_CHARS));
    return out;
  }

  const parts = text.split(sep).flatMap((p) => (p.length > MAX_CHARS ? splitText(p, rest) : [p]));
  const chunks = [];
  let buf = "";
  for (const part of parts) {
    const candidate = buf ? buf + sep + part : part;
    if (candidate.length > TARGET_CHARS && buf) {
      chunks.push(buf);
      // Carry the tail of the previous chunk forward so ideas spanning a boundary survive.
      const tail = buf.slice(-OVERLAP_CHARS);
      const cut = tail.indexOf(sep === " " ? " " : sep.trim() || " ");
      buf = (cut >= 0 ? tail.slice(cut + 1) : tail) + sep + part;
    } else {
      buf = candidate;
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

/** Table-aware split: markdown tables are kept as atomic blocks. */
function splitSection(body) {
  if (body.length <= MAX_CHARS) return [body];
  const blocks = body.split(/\n\n+/);
  const chunks = [];
  let buf = "";
  for (const block of blocks) {
    const isTable = block.trimStart().startsWith("|");
    const pieces = block.length > MAX_CHARS && !isTable ? splitText(block) : [block];
    for (const piece of pieces) {
      if (buf && buf.length + piece.length + 2 > TARGET_CHARS) {
        chunks.push(buf);
        buf = piece;
      } else {
        buf = buf ? `${buf}\n\n${piece}` : piece;
      }
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

function contextHeader({ courseTitle, courseCode, season, program, section }) {
  const parts = [];
  if (courseTitle) parts.push(`Course: ${courseTitle}${courseCode ? ` (${courseCode})` : ""}`);
  if (season) parts.push(`Season: ${season}`);
  if (program) parts.push(`Program syllabus: ${program}`);
  if (section) parts.push(`Section: ${section}`);
  return parts.join(" | ");
}

function makeChunk(base, content, extra = {}) {
  const chunk = { ...base, ...extra, content };
  chunk.embedText = `${contextHeader(chunk)}\n\n${content}`;
  chunk.tokenCount = estimateTokens(chunk.embedText);
  return chunk;
}

/**
 * @param {string} markdown
 * @param {{season: string, program: string, catalog?: Map<string, object>}} meta
 */
function chunkSyllabus(markdown, { season, program, catalog = new Map() }) {
  const sections = parseSections(markdown);
  const chunks = [];
  let course = null; // { level, title, code, fields }

  for (const s of sections) {
    if (course && s.level > 0 && s.level <= course.level) course = null;

    const codeMatch = COURSE_CODE_ROW_RE.exec(s.body);
    if (codeMatch && s.level > 0) {
      const code = codeMatch[1];
      const fields = parseFieldTable(s.body);
      const catalogEntry = catalog.get(code);
      course = { level: s.level, title: catalogEntry?.title || s.heading, code, fields };

      const facts = [
        `Course code: ${code}`,
        fields.Credits && `Credits: ${fields.Credits}`,
        fields.Instructor && `Instructor: ${fields.Instructor}`,
        fields.Department && `Department: ${fields.Department}`,
        fields.Program && `Program: ${fields.Program}`,
        fields.Semester && `Offered: ${fields.Semester}`,
        catalogEntry?.difficulty && `Difficulty: ${catalogEntry.difficulty}/5`,
      ].filter(Boolean);
      const prose = s.body.replace(/^\|.*\|$/gm, "").trim();
      const content = normaliseText(`${course.title}\n${facts.join("\n")}${prose ? `\n\n${prose}` : ""}`);
      chunks.push(
        makeChunk(
          { season, program, courseCode: code, courseTitle: course.title, headingPath: s.path.join(" > ") },
          content,
          { section: "Overview", metadata: { kind: "course_overview", fields } }
        )
      );
      continue;
    }

    if (!s.body || s.body.length < MIN_CHARS) continue;
    if (s.path.some((h) => SKIP_SECTION_RE.test(h))) continue;

    const base = {
      season,
      program,
      courseCode: course?.code ?? null,
      courseTitle: course?.title ?? null,
      section: s.heading || "Introduction",
      headingPath: s.path.join(" > "),
      metadata: { kind: course ? "course_section" : "general" },
    };
    // Code mentioned in a general section (e.g. a quick reference) links it to that course.
    if (!course) {
      const m = COURSE_CODE_RE.exec(s.body);
      if (m && catalog.has(m[1]) && s.body.length < MAX_CHARS) {
        base.courseCode = m[1];
        base.courseTitle = catalog.get(m[1]).title;
      }
    }

    const pieces = splitSection(s.body);
    pieces.forEach((piece, i) =>
      chunks.push(makeChunk(base, piece, pieces.length > 1 ? { metadata: { ...base.metadata, part: i + 1, parts: pieces.length } } : {}))
    );
  }

  return chunks.map((c, i) => ({ ...c, chunkIndex: i }));
}

const SEASON_BY_SEMESTER = { 1: "monsoon", 2: "spring" };

/** One structured "fact sheet" chunk per catalog course. */
function chunkCatalog(courses) {
  return courses.map((c, i) => {
    const season = SEASON_BY_SEMESTER[c.semester] || null;
    const content = [
      `${c.title} (${c.code})`,
      `Program: ${c.program} | Credits: ${c.credits} | Difficulty: ${c.difficulty}/5 | Offered in: ${season ?? "unknown"} semester`,
      "",
      c.description || "",
    ].join("\n").trim();
    return {
      ...makeChunk(
        { season, program: c.program, courseCode: c.code, courseTitle: c.title, section: "Catalog entry", headingPath: "Course catalog" },
        content,
        { metadata: { kind: "catalog", credits: c.credits, difficulty: c.difficulty } }
      ),
      chunkIndex: i,
    };
  });
}

module.exports = { chunkSyllabus, chunkCatalog, parseSections, splitText, splitSection, estimateTokens, COURSE_CODE_RE, TARGET_CHARS, MAX_CHARS };
