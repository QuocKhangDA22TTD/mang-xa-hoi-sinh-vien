# Frontend - MXHSV

## 🔧 API Configuration

### Environment Variables:

- **Local**: `VITE_API_URL=http://localhost:5000`
- **Production**: `VITE_API_URL=https://daring-embrace-production.up.railway.app`

### Auto-detection:

Frontend tự động detect environment dựa trên hostname:

- `localhost` → `http://localhost:5000`
- Railway domain → `https://daring-embrace-production.up.railway.app`

## 🚀 Deployment

### Railway Environment Variables:

Không cần set VITE_API_URL trên Railway vì frontend tự detect.

### Build Commands:

- **Development**: `npm run dev`
- **Production**: `npm run build`

## 🔍 Debug

Kiểm tra console log để xem API URL được sử dụng:

```
🌐 API Configuration:
- hostname: mang-xa-hoi-sinh-vien-production.up.railway.app
- isProduction: true
- Final API_BASE_URL: https://daring-embrace-production.up.railway.app
```

## 📋 Files:

- `src/config/api.js` - API configuration
- `.env` - Local environment
- `.env.production` - Production environment
- `vite.config.js` - Vite configuration
