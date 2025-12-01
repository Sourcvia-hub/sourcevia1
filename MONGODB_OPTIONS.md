# MongoDB Options - No Atlas Required

## Understanding the Error

The production error you saw:
```
pymongo.errors.OperationFailure: not authorized on sourcevia to execute command
```

This error suggests your production environment is connecting to **some** MongoDB instance, but the user doesn't have permissions.

## Your Options (No Atlas Required)

### Option 1: Emergent-Managed MongoDB (Recommended)

**If Emergent provides MongoDB automatically:**

The platform might automatically provision MongoDB and inject the connection string via environment variables.

**What you need to do:**
- Check Emergent documentation or dashboard
- Look for MongoDB connection details
- The MONGO_URL might be automatically provided
- Just ensure the database name is "sourcevia"

**Configuration:**
```env
# Let Emergent inject MONGO_URL automatically
# Just set the database name
MONGO_DB_NAME=sourcevia
```

### Option 2: Self-Hosted MongoDB

**Run your own MongoDB server:**

1. Set up MongoDB on your own server/VPS
2. Configure it to be accessible from your Emergent deployment
3. Update MONGO_URL to point to your server

**Configuration:**
```env
MONGO_URL=mongodb://YOUR_SERVER_IP:27017
MONGO_DB_NAME=sourcevia
```

**Requirements:**
- MongoDB installed and running
- Network accessible from Emergent
- No authentication required, OR proper user/password configured

### Option 3: Alternative MongoDB Hosting

**Use MongoDB hosting services other than Atlas:**

Some alternatives:
- **MongoDB Cloud Manager** (self-managed)
- **mLab** (now part of Atlas, but different offering)
- **Railway** (provides MongoDB)
- **Render** (provides MongoDB)
- **DigitalOcean Managed MongoDB**
- **AWS DocumentDB** (MongoDB-compatible)

### Option 4: Remove Database Authentication

**If using a MongoDB that requires authentication:**

The error means the user in your connection string doesn't have permissions.

**Solutions:**
1. **Disable authentication** (only for development/testing)
2. **Create a user with proper permissions** (on your MongoDB instance)
3. **Use a different database name** that your user can access

## What's Causing Your Production Error?

Looking at the error:
```
not authorized on sourcevia to execute command
Error code: 13 (Unauthorized)
Database: "sourcevia"
```

This means:
1. ✅ Connection to MongoDB is working
2. ✅ Backend is running
3. ❌ The MongoDB user doesn't have permissions on "sourcevia" database

**Where is this MongoDB instance?**
- Check your Emergent deployment environment variables
- Look at what MONGO_URL is actually set to in production
- It might be pointing to a MongoDB that's not under your control

## Quick Fix Options

### Fix 1: Check What MongoDB You're Actually Using

```bash
# In your production backend, check environment variables
echo $MONGO_URL
echo $MONGO_DB_NAME
```

This will tell you where the connection is going.

### Fix 2: If It's a Managed Service

Contact the service provider (Emergent support?) to:
- Grant permissions on "sourcevia" database
- Or find out what database name you should use
- Or get a different connection string

### Fix 3: Change Database Name

If you can't get permissions on "sourcevia", use a different database name:

```env
# Use a database your user CAN access
MONGO_DB_NAME=admin  # Or 'test', or whatever works
```

Then update your code or let me know which database name works.

### Fix 4: Use Local/Simple MongoDB (Development Only)

For testing, use MongoDB without authentication:

```env
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=sourcevia
```

This works for development but not for production.

## Recommended Next Steps

**To help you, I need to know:**

1. **Where should MongoDB run?**
   - Emergent-managed (automatic)
   - Your own server
   - Another hosting service

2. **What's your production MONGO_URL currently set to?**
   - Check your Emergent deployment environment variables
   - This will tell us what MongoDB you're actually connecting to

3. **Do you control the MongoDB instance?**
   - If yes: We can configure it properly
   - If no: We need to work with what's provided

## Configuration for Common Scenarios

### Scenario A: Emergent Provides MongoDB
```env
# Don't set MONGO_URL - let Emergent inject it
MONGO_DB_NAME=sourcevia
```

### Scenario B: Your Own MongoDB Server
```env
MONGO_URL=mongodb://your-server.com:27017
MONGO_DB_NAME=sourcevia
```

### Scenario C: MongoDB Without Authentication
```env
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=sourcevia
```

### Scenario D: MongoDB With Authentication
```env
MONGO_URL=mongodb://username:password@host:27017
MONGO_DB_NAME=sourcevia
```

## Summary

**You don't need Atlas!** But you need **some** MongoDB instance.

**Current problem:** The MongoDB instance in your production environment doesn't allow access to the "sourcevia" database.

**To fix it, tell me:**
1. Where do you want MongoDB to run? (Emergent-managed? Your server? Other?)
2. What's your current production MONGO_URL?
3. Can you access/control that MongoDB instance?

Then I can help you configure it correctly without using Atlas.
