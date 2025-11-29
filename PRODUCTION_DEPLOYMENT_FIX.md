# Production CORS Fix - Cannot Connect to Server

## Problem Identified

From the browser console screenshot, the issue is:

**Frontend:** `https://sourcevia.xyz`  
**Backend:** `https://sourcevia-mgmt.emergent.host`

**Error:**
```
Access to XMLHttpRequest at 'https://sourcevia-mgmt.emergent.host/api/auth/login' 
from origin 'https://sourcevia.xyz' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present
```

## Root Cause

The backend at `sourcevia-mgmt.emergent.host` doesn't have `https://sourcevia.xyz` in its CORS allowed origins list.

## Solution

### Option 1: Update Production Environment Variables (Recommended)

In your production deployment configuration (Kubernetes/Emergent), set:

```yaml
# Backend Environment Variables
CORS_ORIGINS: "https://sourcevia.xyz,https://www.sourcevia.xyz,https://sourcevia-mgmt.emergent.host"
MONGO_URL: "mongodb+srv://username:password@cluster.net/database_name?retryWrites=true&w=majority"
EMERGENT_LLM_KEY: "your_key_here"
```

**Important:** Make sure all your frontend domains are included in CORS_ORIGINS.

### Option 2: Temporary Fix - Allow All Origins (Testing Only)

⚠️ **USE ONLY FOR TESTING** - Not secure for production

Set in deployment:
```yaml
CORS_ORIGINS: "*"
```

This will allow requests from any domain but is not secure for production.

### Option 3: Update Backend Code (If env vars don't work)

If updating environment variables doesn't work, you can hardcode it temporarily:

Edit `/app/backend/server.py`:

```python
# Find the CORS configuration section (around line 3718)
cors_origins_str = os.environ.get('CORS_ORIGINS', 'http://localhost:3000')

# Add this line right after:
cors_origins_str = 'https://sourcevia.xyz,https://www.sourcevia.xyz,https://sourcevia-mgmt.emergent.host'
```

Then redeploy.

## How to Apply the Fix

### If using Emergent Deployment:

1. Go to your deployment settings
2. Add/Update environment variables:
   ```
   CORS_ORIGINS=https://sourcevia.xyz,https://www.sourcevia.xyz,https://sourcevia-mgmt.emergent.host
   ```
3. Redeploy the application

### If using Kubernetes:

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
        - name: CORS_ORIGINS
          value: "https://sourcevia.xyz,https://www.sourcevia.xyz,https://sourcevia-mgmt.emergent.host"
        - name: MONGO_URL
          value: "mongodb+srv://..."
```

Apply with:
```bash
kubectl apply -f deployment.yaml
kubectl rollout restart deployment/sourcevia-backend
```

## Verification

After applying the fix:

1. **Check Backend Logs:**
   Look for this in your backend startup logs:
   ```
   🔒 CORS Configuration:
      Allowed Origins: ['https://sourcevia.xyz', 'https://www.sourcevia.xyz', ...]
   ```

2. **Test in Browser:**
   - Go to https://sourcevia.xyz
   - Open browser console (F12)
   - Try to login with: `admin@sourcevia.com` / `admin123`
   - You should NO LONGER see CORS errors

3. **Quick Test:**
   Run in browser console:
   ```javascript
   fetch('https://sourcevia-mgmt.emergent.host/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({
       email: 'admin@sourcevia.com',
       password: 'admin123'
     })
   })
   .then(r => r.json())
   .then(data => console.log('✅ Login successful:', data))
   .catch(err => console.error('❌ Error:', err));
   ```

## Expected Result

After fix:
- ✅ No CORS errors in console
- ✅ Login request succeeds (status 200)
- ✅ User redirected to dashboard
- ✅ Registration works

## Additional Notes

### Frontend URL Configuration

Also verify that your frontend is using the correct backend URL.

Check `/app/frontend/.env` in production:
```
REACT_APP_BACKEND_URL=https://sourcevia-mgmt.emergent.host
```

This should match the domain shown in your browser console errors.

### Multiple Domains

If you have multiple frontend domains (e.g., with and without www), include all of them:

```
CORS_ORIGINS=https://sourcevia.xyz,https://www.sourcevia.xyz,https://app.sourcevia.xyz,https://sourcevia-mgmt.emergent.host
```

### Testing Different Environments

- **Development:** Uses localhost, preview URLs
- **Staging:** Might use different subdomain
- **Production:** Uses your main domain (sourcevia.xyz)

Make sure CORS_ORIGINS includes all environments you're testing.

## Troubleshooting

### Issue: Still seeing CORS error after fix

**Check:**
1. Did the deployment restart successfully?
2. Are environment variables actually set? Check logs.
3. Is the frontend calling the correct backend URL?
4. Clear browser cache and try in incognito mode

### Issue: Backend logs show different CORS origins

**Solution:**
- Environment variables might not be loading
- Check deployment configuration
- Verify the CORS_ORIGINS value in backend logs matches what you set

### Issue: Works in curl but not in browser

**Solution:**
- This is definitely a CORS issue
- Browsers enforce CORS, curl doesn't
- Make sure CORS_ORIGINS is set correctly

## Summary

**The Fix:**
```yaml
CORS_ORIGINS: "https://sourcevia.xyz,https://www.sourcevia.xyz,https://sourcevia-mgmt.emergent.host"
```

**Where to set it:**
- Production deployment environment variables
- Kubernetes deployment YAML
- Or hardcode in server.py temporarily

**After applying:**
- Restart/redeploy backend
- Clear browser cache
- Test login again

The "Cannot connect to server" error will be resolved once CORS is configured correctly in production.
