# Complete Production Deployment Guide for www.sourcevia.xyz

## Current Situation

From your screenshot and tests, here's what's happening:

1. **Frontend:** `https://sourcevia.xyz` ✅ (working)
2. **Backend:** `https://sourcevia-mgmt.emergent.host` ❌ (returning 500 Internal Server Error)

**Error seen:**
```
Access to XMLHttpRequest at 'https://sourcevia-mgmt.emergent.host/api/auth/login' 
from origin 'https://sourcevia.xyz' has been blocked by CORS policy
```

However, when we test the backend directly:
```
curl https://sourcevia-mgmt.emergent.host/api/auth/login
Result: 500 Internal Server Error
```

**This means two issues:**
1. CORS is partially working (OPTIONS passes) but POST fails
2. Backend is crashing with 500 error (likely MongoDB authentication issue)

## Root Causes

### Issue 1: Backend MongoDB Configuration

The production backend is likely experiencing the MongoDB Atlas authentication error we fixed earlier:
```
pymongo.errors.OperationFailure: not authorized on procurement_db
```

This happens because the `MONGO_URL` doesn't have the database name, or it has the wrong database name.

### Issue 2: CORS Not Fully Configured

The backend needs proper CORS configuration to allow requests from sourcevia.xyz.

## Complete Fix - Step by Step

### Step 1: Update Production Backend Environment Variables

In your **backend deployment** at `sourcevia-mgmt.emergent.host`, set these environment variables:

```yaml
# MongoDB Configuration
MONGO_URL: "mongodb+srv://sourcevia-admin:YOUR_PASSWORD@cluster.mongodb.net/YOUR_DATABASE_NAME?retryWrites=true&w=majority"

# IMPORTANT: Replace:
# - YOUR_PASSWORD: Your actual MongoDB password
# - YOUR_DATABASE_NAME: The actual database name in Atlas (e.g., sourcevia_production)

# CORS Configuration
CORS_ORIGINS: "https://sourcevia.xyz,https://www.sourcevia.xyz,https://sourcevia-mgmt.emergent.host"

# Optional (if using Emergent LLM features)
EMERGENT_LLM_KEY: "your_emergent_key_here"
```

**Critical Notes:**
- The `MONGO_URL` **MUST** include the database name after the cluster address
- The database name in the URL must match the database you have access to in Atlas
- Make sure the MongoDB user has `readWrite` permissions for that database

### Step 2: Update Production Frontend Environment Variable

In your **frontend deployment** at `www.sourcevia.xyz`, set:

```yaml
# Frontend Configuration
REACT_APP_BACKEND_URL: "https://sourcevia-mgmt.emergent.host"
```

### Step 3: Deploy Updated Code

You have two options:

**Option A: Deploy from Emergent (Recommended)**
1. Use Emergent's native deployment feature
2. Click "Deploy" or "Push to Production"
3. Ensure both frontend and backend are deployed

**Option B: Manual Deployment**
1. Pull the latest code from this workspace
2. Deploy backend to sourcevia-mgmt.emergent.host
3. Deploy frontend to www.sourcevia.xyz
4. Ensure environment variables are set

### Step 4: Verify Deployment

After deployment, verify each component:

#### 4.1 Check Backend Health

```bash
curl -v https://sourcevia-mgmt.emergent.host/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

**Expected:** Should return 401 (invalid credentials) NOT 500 (server error)

If you get 500, the MongoDB configuration is wrong.

#### 4.2 Check Backend CORS

```bash
curl -v -X OPTIONS https://sourcevia-mgmt.emergent.host/api/auth/login \
  -H "Origin: https://sourcevia.xyz" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

**Expected:** Should see:
```
access-control-allow-origin: https://sourcevia.xyz
access-control-allow-credentials: true
```

#### 4.3 Check Frontend Configuration

1. Open `https://www.sourcevia.xyz` in browser
2. Open browser console (F12)
3. Look for this message:
```javascript
🔧 API Configuration: {
  BACKEND_URL: "https://sourcevia-mgmt.emergent.host",
  API_URL: "https://sourcevia-mgmt.emergent.host/api",
  source: "environment variable"
}
```

If you see `source: "window.location.origin"`, the environment variable is not set.

### Step 5: Test Login

1. Go to `https://www.sourcevia.xyz/login`
2. Open browser console (F12)
3. Try to login with: `admin@sourcevia.com` / `admin123`
4. Check console for errors
5. Should successfully login and redirect to dashboard

## MongoDB Atlas Configuration

### Finding Your Database Name

1. Login to MongoDB Atlas: https://cloud.mongodb.com
2. Click on your cluster
3. Click "Browse Collections"
4. Note the database name (it's shown at the top)
5. Use this exact name in your MONGO_URL

### Connection String Format

**Correct format:**
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER_ADDRESS/DATABASE_NAME?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://sourcevia-admin:MyP@ssw0rd@cluster0.abc123.mongodb.net/sourcevia_production?retryWrites=true&w=majority
```

**Common mistakes:**
```
❌ mongodb+srv://user@cluster.net/?opts          (missing database name)
❌ mongodb+srv://user@cluster.net/wrong_db?opts  (wrong database name)
❌ mongodb://localhost:27017/procurement_db      (using local instead of Atlas)
```

### User Permissions

Ensure your MongoDB user has the correct permissions:

1. Go to Database Access in Atlas
2. Find your user (e.g., `sourcevia-admin`)
3. Click Edit
4. Ensure they have `readWrite` role for your database

## Deployment Platforms

### If Using Emergent Native Deployment

1. Go to your Emergent dashboard
2. Click on your project
3. Go to "Environment Variables"
4. Add the variables listed above
5. Click "Deploy" or "Redeploy"

### If Using Kubernetes

Update your deployment YAML:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sourcevia-backend
spec:
  template:
    spec:
      containers:
      - name: backend
        env:
        - name: MONGO_URL
          value: "mongodb+srv://user:pass@cluster.net/dbname?opts"
        - name: CORS_ORIGINS
          value: "https://sourcevia.xyz,https://www.sourcevia.xyz"
```

Apply with:
```bash
kubectl apply -f deployment.yaml
kubectl rollout restart deployment/sourcevia-backend
```

### If Using Docker Compose

Update your `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - MONGO_URL=mongodb+srv://user:pass@cluster.net/dbname?opts
      - CORS_ORIGINS=https://sourcevia.xyz,https://www.sourcevia.xyz
  
  frontend:
    environment:
      - REACT_APP_BACKEND_URL=https://sourcevia-mgmt.emergent.host
```

## Troubleshooting

### Issue: Still getting 500 error after deployment

**Cause:** MongoDB configuration is wrong

**Check:**
```bash
# Test if you can connect to MongoDB
mongosh "YOUR_MONGO_URL" --eval "db.users.countDocuments()"
```

If this fails, your MONGO_URL is incorrect.

### Issue: Still getting CORS error

**Cause:** CORS_ORIGINS not set correctly in production

**Check backend logs** for:
```
🔒 CORS Configuration:
   Allowed Origins: ['https://sourcevia.xyz', ...]
```

If you see `['*']` or something else, CORS_ORIGINS is not being read.

### Issue: Frontend still calling wrong backend

**Cause:** REACT_APP_BACKEND_URL not set in production

**Check browser console** for:
```javascript
🔧 API Configuration: {
  source: "environment variable"  // ✅ Good
  // OR
  source: "window.location.origin"  // ❌ Bad - env var not set
}
```

### Issue: "User not found" after login

**Cause:** Production database is empty

**Solution:** 
1. Register a new user via the registration page
2. Or seed the production database with test users

## Quick Diagnostic Commands

### 1. Test Backend MongoDB Connection

Check backend logs for:
```
✅ [DECISION] Using database name from MONGO_URL: 'your_database'
🔗 FINAL MongoDB Configuration:
   Database: 'your_database'
   Source: URL  ← Should see "URL" not "Environment Variable"
```

### 2. Test Backend API

```bash
# Should return user data or 401, NOT 500
curl -X POST https://sourcevia-mgmt.emergent.host/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### 3. Test Frontend API Call

Open browser console on www.sourcevia.xyz:
```javascript
fetch('https://sourcevia-mgmt.emergent.host/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  credentials: 'include',
  body: JSON.stringify({email: 'admin@sourcevia.com', password: 'admin123'})
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Summary Checklist

Before your site can work, ensure:

- [ ] Backend deployed to sourcevia-mgmt.emergent.host
- [ ] Backend has MONGO_URL with database name in it
- [ ] Backend has CORS_ORIGINS including sourcevia.xyz
- [ ] Backend returns 200 or 401 (not 500) when testing login
- [ ] Frontend deployed to www.sourcevia.xyz
- [ ] Frontend has REACT_APP_BACKEND_URL set
- [ ] Frontend console shows correct API configuration
- [ ] Can login successfully from www.sourcevia.xyz

## Files to Deploy

From this workspace, deploy these files with fixes:

**Backend:**
- `/app/backend/server.py` (CORS fix applied)
- `/app/backend/utils/database.py` (MongoDB name extraction fix)
- All other backend files

**Frontend:**
- `/app/frontend/src/pages/Login.js` (Rewritten login/registration)
- `/app/frontend/src/config/api.js` (API configuration)
- All other frontend files

**Environment Variables:**
Set the environment variables as listed above in your deployment platform.

## Need Help?

If deployment still fails, provide:

1. **Backend logs** showing MongoDB Configuration section
2. **Backend logs** showing CORS Configuration section
3. **Error message** when testing: `curl https://sourcevia-mgmt.emergent.host/api/auth/login`
4. **Browser console** screenshot from www.sourcevia.xyz
5. **MongoDB Atlas** database name and user permissions screenshot

The most common issue is the MONGO_URL not having the correct database name!
