# Development Mode - Skip Validation Guide

## Overview

A development mode has been added to bypass backend validation and allow frontend testing without a working backend.

## How to Enable

### Option 1: Environment Variable (Recommended)

Edit `/app/frontend/.env` and set:

```bash
REACT_APP_DEV_MODE=true
```

Then restart the frontend:

```bash
cd /app/frontend
yarn start
```

### Option 2: Temporary (Session Only)

In your browser console, before logging in:

```javascript
localStorage.setItem('REACT_APP_DEV_MODE', 'true');
```

Then refresh the page.

## What Gets Bypassed

When DEV_MODE is enabled:

### Login Page:
- ✅ Skips backend authentication
- ✅ Skips password validation
- ✅ Creates fake auth token
- ✅ Navigates directly to dashboard
- ✅ Sets user as 'admin' role by default

### Registration Page:
- ✅ Skips all form validation (name, email, password)
- ✅ Skips backend registration API
- ✅ Skips auto-login after registration
- ✅ Creates fake auth token
- ✅ Uses role selected in the form
- ✅ Navigates directly to dashboard

## How It Works

### Code Logic:

```javascript
// In /app/frontend/src/pages/Login.js
const DEV_MODE_SKIP_VALIDATION = process.env.REACT_APP_DEV_MODE === 'true';

if (DEV_MODE_SKIP_VALIDATION) {
  console.warn('🔧 DEV MODE: Skipping validation');
  
  // Set fake credentials
  localStorage.setItem('dev_token', 'DEV_MODE_TOKEN');
  localStorage.setItem('dev_user', JSON.stringify({
    email: formData.email || 'dev@test.com',
    name: formData.name || 'Dev User',
    role: formData.role || 'admin'
  }));
  
  // Navigate to dashboard
  navigate('/dashboard');
  return;
}
```

### Fake Data Created:

```javascript
// Stored in localStorage:
{
  "dev_token": "DEV_MODE_TOKEN",
  "dev_user": {
    "email": "your@email.com",
    "name": "Your Name",
    "role": "admin"  // or whatever role you selected
  }
}
```

## Testing Different Roles

You can test different user roles by:

1. **Via Registration Form:**
   - Enable DEV_MODE
   - Go to registration page
   - Select role from dropdown (user, direct_manager, procurement_officer, etc.)
   - Submit - you'll be logged in with that role

2. **Via Browser Console:**
   ```javascript
   localStorage.setItem('dev_user', JSON.stringify({
     email: 'test@test.com',
     name: 'Test User',
     role: 'procurement_manager'  // Change this to any role
   }));
   window.location.reload();
   ```

## Available Roles

- `user` - Basic user (lowest permissions)
- `direct_manager` - Team manager
- `procurement_officer` - Procurement officer
- `procurement_manager` - Procurement manager
- `controller` - Financial controller
- `admin` - Full system access

## Console Warnings

When DEV_MODE is active, you'll see warnings in the browser console:

```
🔧 DEV MODE: Skipping validation and backend calls
🔧 DEV MODE: Skipping login validation
```

This is intentional to remind you that you're in development mode.

## Security Warning

⚠️ **NEVER enable DEV_MODE in production!**

This mode:
- Bypasses all authentication
- Bypasses all validation
- Creates fake credentials
- Allows anyone to access any role

**Only use for local development and testing.**

## Disabling DEV_MODE

### Method 1: Environment Variable

Edit `/app/frontend/.env`:

```bash
REACT_APP_DEV_MODE=false
```

Or simply remove the line.

### Method 2: Clear Browser Storage

Open browser console:

```javascript
localStorage.removeItem('REACT_APP_DEV_MODE');
localStorage.removeItem('dev_token');
localStorage.removeItem('dev_user');
window.location.reload();
```

## Use Cases

### Testing UI/UX Flow
- Test dashboard layouts without backend
- Test role-based UI controls
- Test navigation and routing
- Test responsive design

### Testing RBAC UI Controls
- Quickly switch between roles
- Verify buttons show/hide correctly
- Test permission-based rendering
- Verify role-specific features

### Frontend Development
- Develop UI components independently
- Test state management
- Debug frontend logic
- Design iterations without backend dependency

## Limitations

DEV_MODE only bypasses the **login/registration flow**. Once you're in the dashboard:

- ❌ API calls to fetch data will still fail if backend is down
- ❌ You'll see errors when trying to create/update/delete items
- ❌ Dashboard statistics won't load without backend
- ❌ Forms that submit to backend will fail

**DEV_MODE is only for bypassing authentication, not all backend calls.**

## Example: Testing Admin Dashboard

1. Enable DEV_MODE in `.env`:
   ```bash
   REACT_APP_DEV_MODE=true
   ```

2. Restart frontend:
   ```bash
   sudo supervisorctl restart frontend
   ```

3. Go to `/login`

4. Enter any email (or leave empty)

5. Click "Login" or "Register"

6. You'll be redirected to dashboard as admin

7. Test the UI, navigation, role-based features

## Reverting to Normal Mode

When you want to test with real backend:

1. Set `REACT_APP_DEV_MODE=false` in `.env`
2. Restart frontend
3. Clear localStorage in browser console:
   ```javascript
   localStorage.clear();
   ```
4. Now login will use real backend authentication

## Troubleshooting

### Issue: DEV_MODE not working

**Solution:**
1. Check `.env` file has `REACT_APP_DEV_MODE=true`
2. Restart frontend: `sudo supervisorctl restart frontend`
3. Hard refresh browser: `Ctrl+Shift+R` or `Cmd+Shift+R`
4. Clear browser cache
5. Check browser console for "🔧 DEV MODE" messages

### Issue: Still seeing validation errors

**Solution:**
- Environment variable name must be exact: `REACT_APP_DEV_MODE`
- Value must be string `'true'` (not boolean)
- Must restart React app after changing `.env`

### Issue: Dashboard shows errors after login

**Solution:**
- This is expected if backend is down
- DEV_MODE only bypasses authentication
- To test dashboard, you need backend running
- Or mock the API calls in your components

## Summary

✅ **Enabled:** Login/Registration bypass  
✅ **Enabled:** Role selection  
✅ **Enabled:** Fake credentials  
❌ **Not Enabled:** API call mocking  
❌ **Not Enabled:** Backend bypass for other operations  

DEV_MODE is a **targeted bypass for authentication only**, not a full backend replacement.
