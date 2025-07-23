# 🚨 EMERGENCY DEPLOYMENT GUIDE

## Current Issue: 502 Bad Gateway
Backend is crashing on Railway due to Express 5.x path-to-regexp bug.

## IMMEDIATE SOLUTION:

### Option 1: Use Minimal Server (RECOMMENDED)
1. **Change start script in Railway**:
   - Go to Railway dashboard → Backend service → Settings
   - Change start command to: `node minimal-server.js`
   - OR set environment variable: `START_COMMAND=node minimal-server.js`

2. **Deploy immediately**
   - Push current code to Railway
   - Wait for deployment
   - Test endpoints

### Option 2: Replace package.json temporarily
1. **Backup current package.json**
2. **Replace with package-minimal.json**:
   ```bash
   cp package-minimal.json package.json
   ```
3. **Deploy to Railway**
4. **Restore original package.json later**

## Test Endpoints After Deploy:
- `https://daring-embrace-production.up.railway.app/health`
- `https://daring-embrace-production.up.railway.app/simple`
- `https://daring-embrace-production.up.railway.app/api/test`

## Expected Results:
- ✅ 200 OK responses (not 502)
- ✅ CORS headers present
- ✅ Frontend can connect

## Files Created:
- `minimal-server.js` - Ultra-simple Express server
- `package-minimal.json` - Minimal dependencies
- This guide

## After CORS Works:
1. Fix Express version issues in main server
2. Gradually add back features
3. Switch back to full server

## Railway Environment Variables Needed:
```
PORT=5000
NODE_ENV=production
```

## CRITICAL: Deploy NOW!
The minimal server will fix both the crash and CORS issues immediately.
