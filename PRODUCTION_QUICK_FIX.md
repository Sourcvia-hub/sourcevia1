# Quick Fix for Production 500 Error

## The Problem

Your production backend at `sourcevia-mgmt.emergent.host` is returning:
```
500 Internal Server Error
```

This is the **MongoDB authentication error**. Your backend is trying to connect to MongoDB but failing.

## Root Cause

Looking at your error, the backend is likely configured with:
```
MONGO_URL=mongodb+srv://sourcevia-admin:password@cluster.mongodb.net/?options
```

The problem: **NO DATABASE NAME IN THE URL**

MongoDB Atlas needs the database name in the connection string.

## The Fix

### Option 1: Update MONGO_URL (Recommended)

In your production backend deployment, update the `MONGO_URL` environment variable to include the database name:

**Find your database name:**
1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Click "Browse Collections"
3. Note the database name (probably something like `sourcevia`, `sourcevia_production`, or `procurement_db`)

**Update MONGO_URL:**
```bash
# OLD (WRONG):
MONGO_URL=mongodb+srv://sourcevia-admin:PASSWORD@cluster.mongodb.net/?retryWrites=true

# NEW (CORRECT):
MONGO_URL=mongodb+srv://sourcevia-admin:PASSWORD@cluster.mongodb.net/YOUR_DATABASE_NAME?retryWrites=true
```

Replace:
- `PASSWORD` with your actual MongoDB password
- `YOUR_DATABASE_NAME` with the actual database name from Atlas

### Option 2: Quick Test with Curl

To find what database name you have access to, test with mongosh:

```bash
# Replace with your actual credentials
mongosh "mongodb+srv://sourcevia-admin:PASSWORD@cluster.mongodb.net/" --eval "db.adminCommand('listDatabases')"
```

This will show you all databases you have access to.

### Option 3: If You Don't Know Database Name

If you're not sure what database name to use:

1. Create a new database in Atlas called `sourcevia_production`
2. Make sure your user has `readWrite` permissions for it
3. Use that database name in your MONGO_URL

## How to Apply the Fix

### If Using Emergent Deployment:

1. Go to your deployment dashboard
2. Click on "Environment Variables" or "Settings"
3. Update `MONGO_URL` with the correct value (including database name)
4. Click "Redeploy" or "Restart"

### If Using Direct Server Access:

1. SSH into your server
2. Edit the `.env` file or update environment variables
3. Restart the backend service:
   ```bash
   supervisorctl restart backend
   # OR
   pm2 restart backend
   # OR
   systemctl restart sourcevia-backend
   ```

### If Using Docker/Kubernetes:

1. Update your deployment configuration:
   ```yaml
   env:
     - name: MONGO_URL
       value: "mongodb+srv://user:pass@cluster.net/DATABASE_NAME?opts"
   ```
2. Apply changes:
   ```bash
   kubectl apply -f deployment.yaml
   kubectl rollout restart deployment/sourcevia-backend
   ```

## Verification

After applying the fix, test the backend:

```bash
curl -X POST https://sourcevia-mgmt.emergent.host/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

**Expected result:**
- ✅ Should return: `{"detail":"Invalid email or password"}` (401 error)
- ❌ Should NOT return: `Internal Server Error` (500 error)

If you get 401, it means the backend is working! Then you can register users.

## Create First User After Fix

Once backend is working, create an admin user:

```bash
curl -X POST https://sourcevia-mgmt.emergent.host/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@sourcevia.com",
    "password": "admin123",
    "role": "admin"
  }'
```

Then try logging in at: https://sourcevia.xyz

## Frontend Configuration

Also make sure your frontend at `sourcevia.xyz` has this environment variable set:

```
REACT_APP_BACKEND_URL=https://sourcevia-mgmt.emergent.host
```

If this is not set, the frontend will try to call `https://sourcevia.xyz/api` instead of `https://sourcevia-mgmt.emergent.host/api`.

## Still Not Working?

If you still get 500 error after updating MONGO_URL:

### Check Backend Logs

Look for errors like:
```
pymongo.errors.OperationFailure: not authorized on procurement_db
```

This means:
1. The database name in your URL doesn't match what you have access to
2. Or your user doesn't have permissions for that database

### Verify MongoDB User Permissions

In Atlas:
1. Go to "Database Access"
2. Find your user (e.g., `sourcevia-admin`)
3. Click "Edit"
4. Make sure it has `readWrite` role for your database
5. If it only has access to `admin` database, add access to your actual database

## Summary

**The 500 error is because your production backend can't connect to MongoDB.**

**Quick Fix:**
1. Add database name to MONGO_URL: `...mongodb.net/YOUR_DB_NAME?...`
2. Redeploy/restart backend
3. Test: `curl` should return 401 instead of 500
4. Register admin user
5. Login at sourcevia.xyz

**This MUST be done on your production deployment.** The code in this workspace works perfectly, but your production server needs the same fix.

## Need Help?

Share:
1. Your MONGO_URL (hide the password: `mongodb+srv://user:***@cluster.net/???`)
2. Database name from MongoDB Atlas
3. Backend logs after restart
