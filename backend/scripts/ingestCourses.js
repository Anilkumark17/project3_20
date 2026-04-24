/**
 * scripts/ingestCourses.js
 *
 * Standalone seed script – converts monsoon.json and spring.json to
 * rich text documents and uploads them to PageIndex.
 *
 * Usage:
 *   npm run ingest:courses
 *   node scripts/ingestCourses.js
 *   node scripts/ingestCourses.js monsoon   ← only one season
 *   node scripts/ingestCourses.js spring
 */

require("dotenv").config();
const path = require("path");
const { PageIndexClient, PageIndexError } = require("@pageindex/sdk");
const { coursesToPDF } = require("../src/services/rag/coursesToPDF");

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadJSON(season) {
  const filePath = path.join(__dirname, "..", "src", "utils", `${season}.json`);
  const data = require(filePath);
  console.log(`✓ Loaded ${data.length} courses from ${season}.json`);
  return data;
}

async function uploadSeason(client, season, courses) {
  console.log(`\n${"─".repeat(52)}`);
  console.log(`  📤  Uploading ${season.toUpperCase()} (${courses.length} courses)`);
  console.log("─".repeat(52));

  const text = coursesToDocument(courses, season);
  const buffer = Buffer.from(text, "utf-8");
  const fileName = `${season}_courses.txt`;

  console.log(`  Document size: ${(buffer.length / 1024).toFixed(1)} KB`);

  const { doc_id } = await client.api.submitDocument(buffer, fileName);
  console.log(`  ✅  Uploaded – doc_id: ${doc_id}`);
  return doc_id;
}

async function pollStatus(client, docId, season, maxAttempts = 20) {
  console.log(`\n  ⏳  Polling status for ${season} (doc_id: ${docId})…`);

  for (let i = 0; i < maxAttempts; i++) {
    const tree = await client.api.getTree(docId);
    const status = tree.status;
    process.stdout.write(`  [${i + 1}/${maxAttempts}] status: ${status}\r`);

    if (status === "completed") {
      console.log(`\n  ✅  ${season} processing COMPLETED`);
      return true;
    }
    if (status === "failed") {
      console.error(`\n  ❌  ${season} processing FAILED`);
      return false;
    }

    // Wait 8 seconds between polls
    await new Promise((r) => setTimeout(r, 8000));
  }

  console.warn(`\n  ⚠️   ${season} still processing after ${maxAttempts} attempts.`);
  console.warn(`  You can check status later via GET /api/rag/status/${season}`);
  return false;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🚀  PageIndex Course Ingestion Script");
  console.log("══════════════════════════════════════\n");

  if (!process.env.PAGEINDEX_API_KEY) {
    console.error("❌  PAGEINDEX_API_KEY is not set. Add it to your .env file.");
    process.exit(1);
  }

  const client = new PageIndexClient({ apiKey: process.env.PAGEINDEX_API_KEY });

  // Determine which seasons to process from CLI arg
  const arg = process.argv[2]; // e.g. "monsoon" | "spring" | undefined
  const seasons =
    arg === "monsoon" ? ["monsoon"]
    : arg === "spring"  ? ["spring"]
    : ["monsoon", "spring"];

  console.log(`Seasons to ingest: ${seasons.join(", ")}`);

  const results = {};

  for (const season of seasons) {
    try {
      const courses = loadJSON(season);
      const docId = await uploadSeason(client, season, courses);
      results[season] = docId;

      // Optionally poll until done (set SKIP_POLL=1 to skip)
      if (!process.env.SKIP_POLL) {
        await pollStatus(client, docId, season);
      }
    } catch (err) {
      if (err instanceof PageIndexError) {
        console.error(`\n❌  PageIndex error for ${season}: [${err.code}] ${err.message}`);
      } else {
        console.error(`\n❌  Error for ${season}:`, err.message);
      }
    }
  }

  // ── Print doc_ids for .env ─────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════");
  console.log("📋  INGESTION SUMMARY");
  console.log("══════════════════════════════════════");

  for (const [season, docId] of Object.entries(results)) {
    console.log(`  ${season}: ${docId}`);
  }

  console.log("\n💡  Add these to your .env so the server loads them on startup:");
  for (const [season, docId] of Object.entries(results)) {
    console.log(`  PAGEINDEX_${season.toUpperCase()}_DOC_ID=${docId}`);
  }

  console.log(
    "\n✅  Done! The RAG Q&A endpoints are now ready:\n" +
      "   POST /api/rag/ask   { season, question }\n" +
      "   POST /api/rag/ask/stream   { season, question }\n"
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
