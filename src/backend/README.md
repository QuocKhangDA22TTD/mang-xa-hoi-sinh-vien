# Backend API - MXHSV

## ✅ Đã cập nhật thông tin Railway

### Railway Environment Variables:

```
FRONTEND_URL="mang-xa-hoi-sinh-vien-production.up.railway.app"
DB_HOST="yamabiko.proxy.rlwy.net"
DB_PORT="50024"
DB_USER="root"
DB_PASSWORD="mypassword"
DB_NAME="railway"
```

### Bước 1: Test kết nối

```bash
node quick-test.js
```

### Bước 2: Kiểm tra bảng users

```bash
node check-users-table.js
```

### Bước 3: Test đăng ký

Nếu bảng users đã tồn tại, có thể test đăng ký ngay.

### Bước 4: Deploy

✅ **Environment variables đã được set trên Railway:**

- `FRONTEND_URL=mang-xa-hoi-sinh-vien-production.up.railway.app`
- `DB_HOST=yamabiko.proxy.rlwy.net`
- `DB_USER=root`
- `DB_PASSWORD=mypassword`
- `DB_NAME=railway`
- `DB_PORT=50024`
- `JWT_SECRET=xinchao` (cần thêm)
- `PORT=5000` (cần thêm)
- `NODE_ENV=production` (cần thêm)

### Scripts có sẵn:

- `npm run test-db` - Test kết nối local Docker
- `npm run test-railway` - Test kết nối Railway
- `npm run debug-railway` - Debug thông tin kết nối Railway
- `npm start` - Chạy server
- `npm run lint` - Check code style
- `npm run format` - Format code

### Khắc phục lỗi "Access denied":

1. Chạy `npm run debug-railway` để kiểm tra thông tin kết nối
2. Vào Railway dashboard → MySQL service → Variables tab
3. Copy chính xác các giá trị MYSQL\_\* vào file `.env.railway`
4. Nếu vẫn lỗi, chạy script `create-railway-user.sql` trong Railway MySQL console

### Files quan trọng:

- `.env` - Cấu hình local Docker
- `.env.railway` - Cấu hình Railway (cần cập nhật password)
- `railway-init.sql` - Script khởi tạo database Railway
- `config/db.js` - Cấu hình kết nối database
