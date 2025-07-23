-- Add message_type and attachment_url columns to messages table

USE MXHSV;

-- Check current structure
SHOW COLUMNS FROM messages;

-- Add message_type column if it doesn't exist
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS message_type ENUM('text', 'image', 'file') DEFAULT 'text';

-- Add attachment_url column if it doesn't exist  
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Verify the changes
SHOW COLUMNS FROM messages;

-- Show sample data
SELECT * FROM messages LIMIT 5;
