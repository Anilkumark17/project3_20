const { drizzle } = require("drizzle-orm/neon-http");
const { neon } = require("@neondatabase/serverless");

require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

module.exports = db;
