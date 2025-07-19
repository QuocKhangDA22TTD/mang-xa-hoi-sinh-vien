const db = require('../config/db');

exports.saveMessageToDB = async ({ conversation_id, sender_id, text }) => {
  const [result] = await db.execute(
    'INSERT INTO messages (conversation_id, sender_id, text) VALUES (?, ?, ?)',
    [conversation_id, sender_id, text]
  );
  return {
    id: result.insertId,
    conversation_id,
    sender_id,
    text,
    sent_at: new Date(),
  };
};
