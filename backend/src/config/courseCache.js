const db = require("../db");
const { courses } = require("../db/schema");

let store = [];

async function load() {
  store = await db.select().from(courses);
  console.log(`✓ Course cache loaded: ${store.length} courses`);
}

function _filter(filters = {}) {
  return store.filter((c) => {
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      if (!c.code.toLowerCase().includes(kw) && !c.title.toLowerCase().includes(kw)) return false;
    }
    if (filters.program && c.program !== filters.program) return false;
    if (filters.semester && c.semester !== null && c.semester !== parseInt(filters.semester)) return false;
    if (filters.minDifficulty && c.difficulty < parseInt(filters.minDifficulty)) return false;
    if (filters.maxDifficulty && c.difficulty > parseInt(filters.maxDifficulty)) return false;
    if (filters.credits && c.credits !== parseInt(filters.credits)) return false;
    return true;
  });
}

function getAll() {
  return store;
}

function getById(id) {
  return store.find((c) => c.id === id) || null;
}

function getByCode(code) {
  return store.find((c) => c.code === code) || null;
}

function getByProgram(program) {
  return store.filter((c) => c.program === program);
}

function getBySemester(semester) {
  return store.filter((c) => c.semester === parseInt(semester));
}

function search(filters = {}, pagination = {}) {
  const filtered = _filter(filters);
  if (!pagination.page && !pagination.pageSize) return filtered;
  const { page = 1, pageSize = 12 } = pagination;
  const start = (page - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}

function count(filters = {}) {
  return _filter(filters).length;
}

module.exports = { load, getAll, getById, getByCode, getByProgram, getBySemester, search, count };
