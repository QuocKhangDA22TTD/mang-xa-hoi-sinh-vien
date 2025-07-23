# Hướng dẫn Deploy lên Railway

## Vấn đề hiện tại

Lỗi `ETIMEDOUT` xảy ra do không thể kết nối đến database MySQL trên Railway.

## Các bước khắc phục:

### 1. Tạo MySQL Database trên Railway

1. Đăng nhập vào Railway.app
2. Tạo một project mới hoặc sử dụng project hiện tại
3. Thêm MySQL service:
   - Click "New" → "Database" → "MySQL"
   - Railway sẽ tự động tạo database và cung cấp connection string

### 2. Lấy thông tin kết nối Database

Sau khi tạo MySQL service, Railway sẽ cung cấp:

- `MYSQL_HOST` (ví dụ: containers-us-west-xxx.railway.app)
- `MYSQL_PORT` (thường là 3306)
- `MYSQL_USER` (ví dụ: root)
- `MYSQL_PASSWORD` (password tự động tạo)
- `MYSQL_DATABASE` (tên database)

### 3. Cấu hình Environment Variables cho Backend

Trong Railway dashboard, vào backend service và thêm các biến môi trường:

```
DB_HOST=yamabiko.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=your-actual-password
DB_NAME=railway
DB_PORT=50024
JWT_SECRET=xinchao
PORT=5000
```

**Lưu ý**:

- Thay `your-actual-password` bằng password thực tế từ connection string của bạn
- Đảm bảo copy chính xác password (không có khoảng trắng thừa)
- Nếu vẫn lỗi "Access denied", kiểm tra lại user và password trong Railway dashboard

**Cách lấy thông tin chính xác từ Railway:**

1. Vào Railway dashboard → MySQL service
2. Tab "Variables" → copy các giá trị:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

### 4. Cập nhật Frontend URL

Trong `src/backend/index.js`, đảm bảo frontend URL được thêm vào CORS:

```javascript
const allowedOrigins = [
  "http://localhost:5173",
  "https://your-frontend-url.up.railway.app",
];
```

### 5. Deploy Database Schema

Tạo file `railway-init.sql` để khởi tạo database:

```sql
CREATE DATABASE IF NOT EXISTS railway;
USE railway;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title NVARCHAR(255),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 6. Test kết nối

#### Test kết nối local (Docker):

```bash
cd src/backend
npm run test-db
```

#### Test kết nối Railway:

1. Cập nhật password trong file `.env.railway`
2. Chạy test:

```bash
cd src/backend
npm run test-railway
```

#### Khởi tạo database schema trên Railway:

Sau khi test kết nối thành công, chạy SQL script để tạo tables:

```bash
# Kết nối đến Railway MySQL và chạy file railway-init.sql
# Hoặc copy nội dung file và paste vào Railway MySQL console
```

## Lưu ý quan trọng:

1. Railway MySQL có thể mất vài phút để khởi động
2. Đảm bảo tất cả environment variables được set đúng
3. Database name trên Railway thường là "railway" thay vì "MXHSV"
4. Kiểm tra logs của cả backend và database service trên Railway dashboard
