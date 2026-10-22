const { drizzle } = require("drizzle-orm/neon-http");
const { neon } = require("@neondatabase/serverless");
const { env } = require("../config/env");

const sql = neon(env.DATABASE_URL);
const db = drizzle(sql);

module.exports = db;
module.exports.sql = sql;
