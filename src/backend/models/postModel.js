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
      posts.user_id,
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

exports.getPostsByUserId = async (user_id) => {
  const [rows] = await db.execute(
    `
    SELECT 
      posts.id,
      posts.user_id,
      posts.title,
      posts.content,
      posts.created_at,
      profile.full_name,
      profile.avatar_url
    FROM posts
    JOIN profile ON posts.user_id = profile.user_id
    WHERE posts.user_id = ?
  `,
    [user_id]
  );
  return rows;
};
