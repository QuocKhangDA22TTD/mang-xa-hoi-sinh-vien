const db = require('../config/db');

exports.getProfileByUserId = async (user_id) => {
  const [rows] = await db.query('SELECT * FROM profile WHERE user_id = ?', [
    user_id,
  ]);
  return rows[0];
};

exports.createProfile = async (user_id, full_name, bio, avatar_url) => {
  await db.query(
    'INSERT INTO profile (user_id, full_name, bio, avatar_url) VALUES (?, ?, ?, ?)',
    [user_id, full_name, bio, avatar_url]
  );
};

exports.updateProfile = async (user_id, full_name, bio, avatar_url) => {
  await db.query(
    'UPDATE profile SET full_name = ?, bio = ?, avatar_url = ? WHERE user_id = ?',
    [full_name, bio, avatar_url, user_id]
  );
};
