const db = require('../config/db');

class UserStatusService {
  constructor() {
    // Check for inactive users every 2 minutes
    this.inactiveCheckInterval = setInterval(() => {
      this.setInactiveUsersOffline();
    }, 2 * 60 * 1000);
  }

  async setInactiveUsersOffline() {
    try {
      // Set users offline if they haven't been active for more than 5 minutes
      const result = await db.execute(`
        UPDATE users 
        SET is_online = FALSE 
        WHERE is_online = TRUE 
        AND last_active < DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      `);

      if (result[0].affectedRows > 0) {
        console.log(`🔴 Set ${result[0].affectedRows} inactive users offline`);
      }
    } catch (error) {
      console.error('Error setting inactive users offline:', error);
    }
  }

  async updateUserActivity(userId) {
    try {
      await db.execute(`
        UPDATE users 
        SET last_active = CURRENT_TIMESTAMP, is_online = TRUE 
        WHERE id = ?
      `, [userId]);
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  }

  async setUserOffline(userId) {
    try {
      await db.execute(`
        UPDATE users 
        SET is_online = FALSE, last_active = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [userId]);
      console.log(`🔴 Set user ${userId} offline`);
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  }

  destroy() {
    if (this.inactiveCheckInterval) {
      clearInterval(this.inactiveCheckInterval);
    }
  }
}

module.exports = new UserStatusService();
