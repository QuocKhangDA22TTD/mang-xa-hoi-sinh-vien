-- Script để tạo user mới trong Railway MySQL
-- Chạy script này trong Railway MySQL console nếu user 'root' không hoạt động

-- Tạo user mới với quyền đầy đủ
CREATE USER IF NOT EXISTS 'mxhsv_user'@'%' IDENTIFIED BY 'mxhsv_password_123';

-- Cấp quyền cho user mới
GRANT ALL PRIVILEGES ON railway.* TO 'mxhsv_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.* TO 'mxhsv_user'@'%';

-- Refresh privileges
FLUSH PRIVILEGES;

-- Kiểm tra user đã tạo
SELECT User, Host FROM mysql.user WHERE User = 'mxhsv_user';

-- Kiểm tra quyền
SHOW GRANTS FOR 'mxhsv_user'@'%';
