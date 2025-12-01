# 🚀 Deploy Sourcevia - No MongoDB Access Required

## ✅ Everything is Already Configured

Your code is ready to deploy using **local MongoDB in the container** (no external MongoDB needed).

## Step-by-Step Deployment

### Step 1: Deploy Backend to Emergent

**In your Emergent dashboard:**

1. Go to your backend deployment (sourcevia-secure)
2. Click **"Deploy"** or **"Redeploy"**
3. Wait for deployment to complete (5-10 minutes)

**IMPORTANT: Set these environment variables in Emergent:**

```env
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=sourcevia
CORS_ORIGINS=https://sourcevia.xyz,https://www.sourcevia.xyz,https://sourcevia-secure.emergent.host
EMERGENT_LLM_KEY=sk-emergent-e9d7eEd061b2fCeDbB
```

**Make sure to REMOVE any old environment variables:**
- Remove any `MONGO_URL` that points to Atlas (mongodb+srv://...)
- Only use: `MONGO_URL=mongodb://localhost:27017`

### Step 2: Deploy Frontend to Emergent

**In your Emergent dashboard:**

1. Go to your frontend deployment (sourcevia.xyz)
2. Click **"Deploy"** or **"Redeploy"**
3. Wait for deployment to complete

**Set this environment variable:**

```env
REACT_APP_BACKEND_URL=https://sourcevia-secure.emergent.host
```

### Step 3: Create Initial User (After Deployment)

Once both are deployed, create your first user:

**Option A: Via Frontend**
1. Visit https://www.sourcevia.xyz/login
2. Click "Register" tab
3. Fill in:
   - Name: Admin User
   - Email: admin@sourcevia.com
   - Password: admin123
   - Role: admin
4. Click Register
5. You'll be logged in automatically

**Option B: Via API**
```bash
curl -X POST https://sourcevia-secure.emergent.host/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@sourcevia.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Step 4: Test Login

1. Go to https://www.sourcevia.xyz/login
2. Login with:
   - Email: admin@sourcevia.com
   - Password: admin123
3. Should redirect to dashboard

## Complete Environment Variable Setup

### Backend Environment Variables (Emergent)

```env
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=sourcevia
CORS_ORIGINS=https://sourcevia.xyz,https://www.sourcevia.xyz,https://sourcevia-secure.emergent.host
EMERGENT_LLM_KEY=sk-emergent-e9d7eEd061b2fCeDbB
ENV=production
LOG_LEVEL=info
```

### Frontend Environment Variables (Emergent)

```env
REACT_APP_BACKEND_URL=https://sourcevia-secure.emergent.host
WDS_SOCKET_PORT=443
```

## What Happens Behind the Scenes

1. **Emergent starts your backend container**
2. **MongoDB starts automatically** inside the container (at localhost:27017)
3. **Backend connects to local MongoDB** (no external connection needed)
4. **Frontend calls backend API** (with CORS working)
5. **Users can register and login** (data stored in local MongoDB)

## No MongoDB Setup Needed!

You don't need:
- ❌ MongoDB Atlas account
- ❌ External MongoDB server
- ❌ MongoDB credentials
- ❌ Database configuration
- ❌ Network setup

Everything runs **inside the container automatically**.

## Verification After Deployment

### 1. Check Backend Health
```bash
curl https://sourcevia-secure.emergent.host/api/health
```
**Expected:**
```json
{"status":"ok","database":"connected"}
```

### 2. Check Frontend
Visit: https://www.sourcevia.xyz/login

Should show login page with debug info at bottom:
```
Debug Info:
Backend: https://sourcevia-secure.emergent.host
```

### 3. Test Registration
Try registering a new user through the frontend.

Should work without any MongoDB errors.

## Troubleshooting

### Issue: "Connection refused" or "Cannot connect"

**Cause:** Backend not deployed or not running

**Fix:**
1. Check Emergent dashboard - is backend running?
2. Check backend logs for startup errors
3. Verify environment variables are set

### Issue: "CORS policy" error in browser

**Cause:** CORS_ORIGINS not set correctly

**Fix:**
1. Check backend environment variables
2. Must include: `https://sourcevia.xyz,https://www.sourcevia.xyz`
3. Redeploy backend

### Issue: "500 Internal Server Error" on login

**Cause:** MongoDB not running in container OR wrong MONGO_URL

**Fix:**
1. Check backend logs for MongoDB errors
2. Ensure MONGO_URL is `mongodb://localhost:27017`
3. Remove any Atlas URLs from environment variables
4. Redeploy backend

### Issue: "Invalid email or password"

**Cause:** No users created yet

**Fix:** Register a new user (see Step 3 above)

## Data Persistence Note

**Important:** Data is stored in the container's local MongoDB.

**This means:**
- ✅ Works perfectly for development and testing
- ✅ No external dependencies
- ⚠️ Data will be lost when container is recreated/redeployed

**For production with persistent data:**
- You would need external MongoDB (but you said you don't have access)
- For now, this setup is fine for testing and development

**Workaround for data persistence:**
- Before redeploying, export users via API
- After redeploying, recreate users via registration

## Summary

**What you need to do:**
1. ✅ Deploy backend (with environment variables above)
2. ✅ Deploy frontend (with environment variable above)
3. ✅ Register first user via frontend
4. ✅ Done!

**What you DON'T need:**
- ❌ MongoDB Atlas account
- ❌ MongoDB setup
- ❌ Database credentials
- ❌ External services

**Everything runs locally in the container automatically! 🚀**

---

## Quick Deployment Checklist

- [ ] Backend deployed with correct environment variables
- [ ] Frontend deployed with correct environment variable
- [ ] Removed any Atlas MONGO_URL from environment
- [ ] Both deployments showing "Running" in Emergent
- [ ] Visited https://www.sourcevia.xyz/login (page loads)
- [ ] Registered first user successfully
- [ ] Can login with registered user
- [ ] Redirected to dashboard after login

**If all checkboxes are checked, your app is working! ✅**
