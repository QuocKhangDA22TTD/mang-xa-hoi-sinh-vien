# 🚂 Railway Deployment Status

## ✅ Đã hoàn thành:

### 1. Database Configuration

- **Host**: `yamabiko.proxy.rlwy.net`
- **Port**: `50024`
- **User**: `root`
- **Password**: `mypassword`
- **Database**: `railway`

### 2. Environment Variables (Railway)

```
FRONTEND_URL="mang-xa-hoi-sinh-vien-production.up.railway.app"
DB_HOST="yamabiko.proxy.rlwy.net"
DB_PORT="50024"
DB_USER="root"
DB_PASSWORD="mypassword"
DB_NAME="railway"
```

### 3. Cần thêm vào Railway:

```
JWT_SECRET=xinchao
PORT=5000
NODE_ENV=production
```

### 4. Files đã cập nhật:

- ✅ `config/db.js` - Sửa typo `post` → `port`, thêm SSL config
- ✅ `.env.railway` - Đồng bộ với Railway server
- ✅ `index.js` - Cập nhật CORS với FRONTEND_URL
- ✅ `quick-test.js` - Script test kết nối
- ✅ `check-users-table.js` - Script kiểm tra bảng users

## 🎯 Bước tiếp theo:

### 1. ✅ Đã sửa CORS + API URL issue:

- Thêm backend URL vào allowedOrigins
- Cập nhật CORS config với preflight support
- Tạo API config file cho frontend với auto-detection
- Cập nhật tất cả pages sử dụng API_ENDPOINTS
- Thêm environment files cho frontend (.env, .env.production)
- Frontend tự động detect production/development environment

### 2. Thêm environment variables còn thiếu vào Railway:

- `JWT_SECRET=xinchao`
- `PORT=5000`
- `NODE_ENV=production`

### 3. ✅ Thêm CORS debugging:

- Thêm OPTIONS handler riêng
- Thêm debug logging cho tất cả requests
- Tạo test endpoint `/api/test`
- Thêm CORS test utility cho frontend

### 4. ❌ Phát hiện lỗi path-to-regexp

Backend bị crash do Express 5.x có vấn đề với route parsing.

**Giải pháp**:

- Downgrade Express từ 5.1.0 → 4.18.2
- Downgrade Multer từ 2.0.1 → 1.4.5-lts.1
- Tạo simple-server.js để test CORS trước
- Thay đổi start script: `"start": "node simple-server.js"`

### 5. 🚨 EMERGENCY: Backend đang crash (502 Bad Gateway)

**Vấn đề**: Railway backend không start được, trả về 502 error.

**Nguyên nhân**: Express 5.x path-to-regexp bug vẫn chưa được fix trên Railway.

**Giải pháp khẩn cấp**:

1. ✅ Tạo `minimal-server.js` - chỉ có Express 4.x + CORS
2. ✅ Thay đổi start script: `"start": "node minimal-server.js"`
3. 🚨 **DEPLOY NGAY** để fix 502 error

### 6. Deploy minimal server NGAY

**CRITICAL**: Phải deploy để fix crash trước khi test CORS!

### 5. Test CORS và đăng ký

- Kiểm tra console logs trong browser
- Test endpoint `/api/test` trước
- Sau đó test đăng ký user

## 🔧 Troubleshooting:

### Nếu vẫn lỗi "Access denied":

1. Kiểm tra password trong Railway Variables tab
2. Đảm bảo MySQL service đang chạy
3. Thử tạo user mới trong Railway MySQL console

### Nếu lỗi CORS:

1. Kiểm tra FRONTEND_URL trong Railway
2. Đảm bảo frontend URL đúng format (không có https:// prefix trong env var)

### Test scripts:

```bash
node quick-test.js          # Test kết nối
node check-users-table.js   # Kiểm tra bảng users
```
