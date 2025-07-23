# Backend API - MXHSV

## Khắc phục lỗi ETIMEDOUT trên Railway

### Bước 1: Cập nhật password Railway
Chỉnh sửa file `.env.railway` và thay `YOUR_ACTUAL_PASSWORD_HERE` bằng password thực tế từ connection string.

### Bước 2: Test kết nối
```bash
npm run test-railway
```

### Bước 3: Khởi tạo database
Nếu test thành công, copy nội dung file `railway-init.sql` và chạy trong Railway MySQL console.

### Bước 4: Deploy
Trong Railway dashboard, set các environment variables:
- `DB_HOST=yamabiko.proxy.rlwy.net`
- `DB_USER=root`
- `DB_PASSWORD=your-actual-password`
- `DB_NAME=railway`
- `DB_PORT=50024`
- `JWT_SECRET=xinchao`
- `PORT=5000`

### Scripts có sẵn:
- `npm run test-db` - Test kết nối local Docker
- `npm run test-railway` - Test kết nối Railway
- `npm start` - Chạy server
- `npm run lint` - Check code style
- `npm run format` - Format code

### Files quan trọng:
- `.env` - Cấu hình local Docker
- `.env.railway` - Cấu hình Railway (cần cập nhật password)
- `railway-init.sql` - Script khởi tạo database Railway
- `config/db.js` - Cấu hình kết nối database
