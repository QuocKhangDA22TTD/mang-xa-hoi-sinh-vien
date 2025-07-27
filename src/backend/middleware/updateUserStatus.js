const db = require('../config/db');

// Middleware to update user online status
const updateUserStatus = async (req, res, next) => {
  if (req.user && req.user.id) {
    try {
      // Update user's last_active and set online status
      await db.execute(
        `UPDATE users 
         SET last_active = CURRENT_TIMESTAMP, is_online = TRUE 
         WHERE id = ?`,
        [req.user.id]
      );
      console.log(`🟢 Updated user ${req.user.id} status to online`);
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      // Don't block the request if status update fails
    }
  }
  next();
};

// Function to set user offline
const setUserOffline = async (userId) => {
  try {
    await db.execute(
      `UPDATE users 
       SET is_online = FALSE, last_active = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [userId]
    );
    console.log(`🔴 Set user ${userId} offline`);
  } catch (error) {
    console.error('❌ Error setting user offline:', error);
  }
};

// Function to get online friends
const getOnlineFriends = async (userId) => {
  try {
    const [friends] = await db.execute(
      `SELECT DISTINCT
              CASE
                WHEN fr.sender_id = ? THEN u2.id
                ELSE u1.id
              END as friend_id,
              CASE
                WHEN fr.sender_id = ? THEN u2.is_online
                ELSE u1.is_online
              END as is_online,
              CASE
                WHEN fr.sender_id = ? THEN u2.last_active
                ELSE u1.last_active
              END as last_active
       FROM friend_requests fr
       JOIN users u1 ON fr.sender_id = u1.id
       JOIN users u2 ON fr.receiver_id = u2.id
       WHERE (fr.sender_id = ? OR fr.receiver_id = ?)
       AND fr.status = 'accepted'
       AND (
         (fr.sender_id = ? AND u2.is_online = TRUE) OR
         (fr.receiver_id = ? AND u1.is_online = TRUE)
       )`,
      [userId, userId, userId, userId, userId, userId, userId]
    );
    return friends;
  } catch (error) {
    console.error('❌ Error getting online friends:', error);
    return [];
  }
};

module.exports = {
  updateUserStatus,
  setUserOffline,
  getOnlineFriends
};
