# 🚀 Production Deployment Guide - Sourcevia

## Current Configuration Status

### ✅ Code is Production-Ready
- Database connection logic supports both local and Atlas
- CORS properly configured
- Environment variables structured correctly
- All authentication flows tested and working

### ⚠️ Action Required: Update MONGO_URL for Production

## Step 1: Get Your MongoDB Atlas Connection String

1. **Login to MongoDB Atlas:** https://cloud.mongodb.com
2. **Select your cluster**
3. **Click "Connect"**
4. **Choose "Connect your application"**
5. **Copy the connection string**

Your connection string will look like:
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## Step 2: Add Database Name to Connection String

**Important:** Add `/sourcevia` before the `?` in the connection string:

**Before:**
```
mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true
```

**After:**
```
mongodb+srv://user:pass@cluster.mongodb.net/sourcevia?retryWrites=true
```

The `/sourcevia` tells MongoDB which database to use.

## Step 3: Ensure MongoDB Atlas Permissions

**Critical:** Your MongoDB Atlas user must have **readWrite** permissions on the **sourcevia** database.

### To Grant Permissions:

1. Go to MongoDB Atlas → **Database Access**
2. Find your user (the username from your connection string)
3. Click **"Edit"**
4. Under "Database User Privileges":
   - Click **"Add Specific Privilege"**
   - Database: `sourcevia`
   - Role: `readWrite`
5. Click **"Add Privilege"**
6. Click **"Update User"**
7. Wait 1-2 minutes for changes to propagate

### Alternative: Grant Broader Permissions (For Testing)
- Role: **"Read and write to any database"**
- This gives access to all databases (less secure, but simpler for testing)

## Step 4: Update Production Environment Variables

In your Emergent deployment, set these environment variables:

```env
# MongoDB Atlas (REQUIRED)
MONGO_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/sourcevia?retryWrites=true&w=majority

# OR use separate database name variable
MONGO_DB_NAME=sourcevia

# CORS (Already configured)
CORS_ORIGINS=https://sourcevia.xyz,https://www.sourcevia.xyz,https://sourcevia-secure.emergent.host

# Emergent Key
EMERGENT_LLM_KEY=sk-emergent-e9d7eEd061b2fCeDbB
```

**Replace:**
- `YOUR_USERNAME` with your Atlas username
- `YOUR_PASSWORD` with your Atlas password
- `YOUR_CLUSTER` with your cluster name

## Step 5: Deploy

1. Deploy your backend through Emergent
2. The code will automatically:
   - Detect Atlas URL
   - Extract database name from URL (`sourcevia`)
   - Connect to MongoDB Atlas
   - Log connection details

## Step 6: Verify Deployment

### Check Backend Logs

Look for these messages in your backend logs:

```
✅ Success Messages:
🔗 FINAL MongoDB Configuration:
   URL: mongodb+srv://***:***@cluster.mongodb.net/sourcevia...
   Database: 'sourcevia'
   Source: URL

[DB Init] Database client created successfully
INFO: Application startup complete
```

### Test Endpoints

**1. Health Check:**
```bash
curl https://sourcevia-secure.emergent.host/api/health
```
Expected: `{"status":"ok","database":"connected"}`

**2. Register User:**
```bash
curl -X POST https://sourcevia-secure.emergent.host/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456",
    "role": "user"
  }'
```
Expected: HTTP 200 with user data

**3. Login:**
```bash
curl -X POST https://sourcevia-secure.emergent.host/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```
Expected: HTTP 200 with user data and token

## Troubleshooting

### Error: "not authorized on sourcevia to execute command"

**Cause:** MongoDB Atlas user lacks permissions

**Fix:** Follow Step 3 above to grant readWrite permissions

### Error: "Authentication failed"

**Cause:** Wrong username or password in MONGO_URL

**Fix:** 
1. Check your Atlas credentials
2. Reset password if needed in Atlas → Database Access
3. Update MONGO_URL with correct password

### Error: "Server selection timeout"

**Cause:** IP address not whitelisted or cluster unreachable

**Fix:**
1. Go to Atlas → Network Access
2. Add IP address or use `0.0.0.0/0` (allow from anywhere)
3. Wait 1-2 minutes for changes to propagate

### Error: "Database name not found in URL"

**Cause:** MONGO_URL missing `/sourcevia` in path

**Fix:** Ensure URL format is:
```
mongodb+srv://user:pass@cluster.net/sourcevia?options
                                      ^^^^^^^^^ Must be present
```

## How the Database Connection Works

### Your Current Code (`/app/backend/utils/database.py`):

1. **Reads MONGO_URL from environment**
2. **Extracts database name from URL** (if present)
   - URL: `mongodb+srv://.../sourcevia?...` → Uses `sourcevia`
3. **Falls back to MONGO_DB_NAME** (if not in URL)
4. **Creates MongoDB client** with extracted database name
5. **Logs configuration** for debugging

### This Means:

**Option A: Include database in URL** (Recommended)
```env
MONGO_URL=mongodb+srv://user:pass@cluster.net/sourcevia?...
```
→ Database name: `sourcevia` (from URL)

**Option B: Use separate variable**
```env
MONGO_URL=mongodb+srv://user:pass@cluster.net/?...
MONGO_DB_NAME=sourcevia
```
→ Database name: `sourcevia` (from MONGO_DB_NAME)

## Configuration Checklist

Before deploying:

- [ ] MongoDB Atlas user created
- [ ] User has readWrite permissions on `sourcevia` database
- [ ] MONGO_URL includes database name `/sourcevia` in path
- [ ] MONGO_URL credentials are correct
- [ ] IP whitelist configured in Atlas
- [ ] CORS_ORIGINS includes production domains
- [ ] Environment variables set in Emergent deployment

After deploying:

- [ ] Backend logs show successful database connection
- [ ] Health endpoint returns 200 OK
- [ ] Registration endpoint works (200 OK)
- [ ] Login endpoint works (200 OK)
- [ ] Frontend can register and login users

## Summary

**Current Status:**
- ✅ Code is ready for production
- ✅ Database connection supports Atlas
- ✅ CORS configured correctly
- ⏳ Waiting for: MongoDB Atlas permissions + MONGO_URL update

**Action Required:**
1. Grant MongoDB Atlas permissions (5 minutes)
2. Update MONGO_URL in production environment
3. Deploy

**After deployment:**
- ✅ All auth endpoints will work
- ✅ Users can register and login
- ✅ Application fully functional

---

**Need help? Check the logs for detailed error messages and refer to the troubleshooting section above.**
