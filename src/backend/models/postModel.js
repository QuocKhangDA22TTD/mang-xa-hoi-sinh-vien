const db = require('../config/db');

exports.createPost = async (userId, title, content) => {
  const [result] = await db.execute(
    'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
    [userId, title, content]
  );

  return result;
};

exports.getAllPosts = async () => {
  const [rows] = await db.execute(`
    SELECT 
      posts.id,
      posts.title,
      posts.content,
      posts.created_at,
      profile.full_name,
      profile.avatar_url
    FROM posts
    JOIN profile ON posts.user_id = profile.user_id
    ORDER BY posts.created_at DESC
  `);
  return rows;
};

exports.getPostById = async (id) => {
  const [rows] = await db.execute(
    `
    SELECT 
      posts.id,
      posts.title,
      posts.content,
      posts.created_at,
      profile.full_name,
      profile.avatar_url
    FROM posts
    JOIN profile ON posts.user_id = profile.user_id
    WHERE posts.id = ?
  `,
    [id]
  );
  return rows[0];
};
