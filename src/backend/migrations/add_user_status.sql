-- Add user status columns to users table

USE MXHSV;

-- Check current structure
SHOW COLUMNS FROM users;

-- Add is_online column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- Add last_active column if it doesn't exist  
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing users to have last_active as their created_at
UPDATE users 
SET last_active = created_at 
WHERE last_active IS NULL;

-- Verify the changes
SHOW COLUMNS FROM users;

-- Show sample data
SELECT id, email, is_online, last_active, created_at FROM users LIMIT 5;
