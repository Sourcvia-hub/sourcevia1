# 🔧 Fix MongoDB Atlas Permissions - Step-by-Step Guide

## Current Issue

**Error:** `pymongo.errors.OperationFailure: not authorized on sourcevia to execute command`  
**Error Code:** 13 (Unauthorized)  
**Database:** "sourcevia"  
**Cause:** MongoDB Atlas user doesn't have read/write permissions on the "sourcevia" database

## Step-by-Step Fix

### Step 1: Login to MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Login with your credentials
3. Select your project (the one containing your Sourcevia cluster)

### Step 2: Navigate to Database Access

1. In the left sidebar, click on **"Database Access"**
2. You'll see a list of database users

### Step 3: Find Your User

1. Look for the username that's in your MONGO_URL connection string
2. Your MONGO_URL looks like: `mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/sourcevia`
3. Find that USERNAME in the list

### Step 4: Edit User Permissions

1. Click the **"Edit"** button (pencil icon) next to your user
2. Scroll to the **"Database User Privileges"** section

### Step 5: Grant Permissions

**Option A: Grant Permissions on Specific Database (Recommended)**

1. Under "Built-in Role", select **"Add Specific Privilege"**
2. In the dropdown:
   - **Database:** Enter `sourcevia`
   - **Role:** Select `readWrite`
3. Click **"Add Privilege"**

**Option B: Grant Permissions on All Databases (For Testing)**

1. Under "Built-in Role", select **"Read and write to any database"**
2. This gives broader access (good for testing, narrow down later)

### Step 6: Save Changes

1. Scroll to the bottom
2. Click **"Update User"**
3. Wait 1-2 minutes for changes to propagate

### Step 7: Verify Connection String

Your MONGO_URL should be:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/sourcevia?retryWrites=true&w=majority
```

**Important:** The database name `sourcevia` must be in the URL path (after `.net/`)

### Step 8: Restart/Redeploy Backend

After updating permissions:
1. Redeploy your backend to Sourcevia
2. Or restart the backend service if already deployed
3. Wait for service to fully start

## Verification Steps

### 1. Check Backend Logs

After redeployment, check backend logs for:
```
✅ Success: Database client created successfully
✅ No authorization errors
```

### 2. Test Health Endpoint

```bash
curl https://sourcevia-secure.emergent.host/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 3. Test Registration (Without User)

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

**Expected Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user"
  }
}
```

**Before Fix:** HTTP 500 with authorization error  
**After Fix:** HTTP 200 with user data

### 4. Test Login

```bash
curl -X POST https://sourcevia-secure.emergent.host/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user"
  }
}
```

### 5. Test from Frontend

1. Visit https://sourcevia.xyz/login
2. Try to register a new user
3. Expected: Success message, redirect to dashboard
4. Try to login with the new user
5. Expected: Success, redirect to dashboard

## Common Issues and Solutions

### Issue 1: Still Getting 401 Errors After Granting Permissions

**Solution:**
- Wait 2-3 minutes for Atlas to propagate changes
- Restart/redeploy backend
- Check that the username in MONGO_URL matches the user you edited

### Issue 2: "User not found" in Atlas

**Solution:**
- The username in your MONGO_URL doesn't exist
- Create a new user with correct permissions
- Update MONGO_URL with new credentials

### Issue 3: Permissions Look Correct But Still Failing

**Solution:**
- Check IP whitelist in MongoDB Atlas → Network Access
- Make sure production IPs are whitelisted
- Or use 0.0.0.0/0 (allow from anywhere) for testing

### Issue 4: Wrong Database Name

**Solution:**
- If your Atlas user has permissions on a different database
- Update MONGO_URL to use that database name instead:
  ```
  mongodb+srv://USER:PASS@CLUSTER.net/CORRECT_DB_NAME?...
  ```

## Visual Checklist

```
MongoDB Atlas → Database Access
  ↓
Find user (from MONGO_URL)
  ↓
Click "Edit" button
  ↓
Add Specific Privilege
  ↓
Database: sourcevia
Role: readWrite
  ↓
Click "Update User"
  ↓
Wait 1-2 minutes
  ↓
Redeploy backend
  ↓
Test endpoints
  ↓
✅ Working!
```

## Expected Permissions Screenshot

After fixing, your user should show:

```
Database User Privileges:
┌─────────────┬────────────┐
│ Database    │ Role       │
├─────────────┼────────────┤
│ sourcevia   │ readWrite  │
└─────────────┴────────────┘
```

Or:

```
Built-in Role:
└─ Read and write to any database
```

## What Each Permission Means

- **readWrite on sourcevia:** User can read and write data in the "sourcevia" database only
- **Read and write to any database:** User can read and write to ALL databases (broader)
- **Atlas admin:** Full admin access (not needed for this app)

**Recommendation:** Use "readWrite on sourcevia" for security best practice.

## After Fixing

Once permissions are granted:

1. ✅ /api/auth/register will work (create users)
2. ✅ /api/auth/login will work (authenticate users)
3. ✅ /api/auth/me will work (get current user)
4. ✅ All database operations will succeed
5. ✅ Frontend login/register will work from https://sourcevia.xyz

## Support

If you encounter issues after following these steps:

1. Check backend logs for specific error messages
2. Verify the username in MONGO_URL matches the user in Atlas
3. Ensure database name in MONGO_URL is "sourcevia"
4. Check IP whitelist includes production server IP
5. Wait 2-3 minutes after any Atlas changes before testing

## Summary

**Problem:** MongoDB Atlas user lacks permissions on "sourcevia" database  
**Solution:** Grant readWrite permission in Atlas Database Access  
**Time Required:** 5 minutes  
**Impact:** Fixes all auth endpoint 500 errors  
**Test:** Registration and login should work after fix

---

**Ready to proceed? Follow the steps above and your production authentication will start working! 🚀**
