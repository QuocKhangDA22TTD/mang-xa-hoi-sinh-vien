const db = require('../config/db');

exports.createPost = async (userId, title, content) => {
  const [result] = await db.execute(
    'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
    [userId, title, content]
  );

  return result;
};

exports.getAllPosts = async () => {
  const [rows] = await db.execute('SELECT * FROM posts');
  return rows;
};

exports.getPostById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM posts WHERE id = ?', [id]);
  return rows[0];
};
