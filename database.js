require("dotenv").config();
const { Pool } = require("pg");
//setting up the database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.initialize = () => {
  pool.connect();
};
exports.getMenu = async () => {
  const data = await pool.query(
    'SELECT * FROM "MENU_ITEMS" ORDER BY "ITEM_ID"'
  );
  const rows = data["rows"];
  return rows;
}

exports.getPosts = async () => {
  const data = await pool.query(
  'SELECT "POST_ID", "POST_TITLE", "POST_IMG" FROM "BLOG";'
  );
  const rows = data.rows;
  return rows;
}

exports.getPost = async (id) => {
  const data = await pool.query(
  'SELECT "POST_TITLE", "POST_IMG", "POST_BODY","POST_DATE" FROM "BLOG" WHERE "POST_ID" = $1', [id]
  );
  const rows = data.rows;
  return rows;
}

exports.pool = pool;
