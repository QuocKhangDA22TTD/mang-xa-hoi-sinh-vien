const db = require('../config/db');

exports.getProfileByUserId = async (user_id) => {
  const [rows] = await db.query('SELECT * FROM profile WHERE user_id = ?', [
    user_id,
  ]);
  return rows[0];
};

exports.createProfile = async (
  user_id,
  full_name,
  bio,
  avatar_url,
  nickname,
  birthday,
  address,
  banner_url = null
) => {
  await db.query(
    'INSERT INTO profile (user_id, full_name, bio, avatar_url, nickname, birthday, address, banner_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      user_id,
      full_name,
      bio,
      avatar_url,
      nickname,
      birthday,
      address,
      banner_url,
    ]
  );
};

exports.updateProfile = async (
  user_id,
  full_name,
  bio,
  avatar_url,
  nickname,
  birthday,
  address,
  banner_url = null
) => {
  await db.query(
    'UPDATE profile SET full_name = ?, bio = ?, avatar_url = ?, nickname = ?, birthday = ?, address = ?, banner_url = ? WHERE user_id = ?',
    [
      full_name,
      bio,
      avatar_url,
      nickname,
      birthday,
      address,
      banner_url,
      user_id,
    ]
  );
};
