# 🧪 Test Accounts for Sourcevia Procurement System

I've created test accounts with different roles for you to test the system.

## Quick Start - Manual Cookie Method

Since the Google OAuth redirect might have issues in your environment, you can manually set session cookies to test the system:

### Step 1: Get Session Tokens

**Procurement Officer:**
- Email: `procurement.officer.1762934360@test.com`
- Session Token: `test_session_45f8488250e449b896ff6d95bd32bf35`

**Project Manager:**
- Email: `project.manager.1762934360@test.com`
- Session Token: `test_session_1c53bdbc3f8941a784f640e413e72ac9`

**Vendor:**
- Email: `vendor.1762934360@test.com`
- Session Token: `test_session_efb5361fd9cb4bd6987ab131d6439971`

### Step 2: Set Cookie in Browser

1. Open your app in the browser
2. Open DevTools (Press F12)
3. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Click on **Cookies** in the left sidebar
5. Select your domain
6. Click the "+" button to add a new cookie
7. Set these values:
   - **Name:** `session_token`
   - **Value:** (paste one of the session tokens above)
   - **Path:** `/`
   - **Expires:** (leave default or set future date)
8. Refresh the page

You should now be logged in as that user!

## Testing Different Roles

### As Procurement Officer:
- ✅ Can view and approve vendors
- ✅ Can create tenders
- ✅ Can verify invoices
- ✅ Full access to dashboard stats

### As Project Manager:
- ✅ Can approve contracts
- ✅ Can approve invoices
- ✅ Full access to dashboard stats
- ❌ Cannot manage vendors

### As Vendor:
- ✅ Can view assigned tenders
- ✅ Can submit proposals
- ✅ Can submit invoices
- ❌ Limited dashboard view

## Testing OAuth Flow (Alternative Method)

If you want to test the real OAuth flow:

1. Click "Sign In" on the landing page
2. You'll be redirected to Google OAuth via Emergent Auth
3. After signing in with Google, you'll be redirected back
4. The system will create a new user with **Vendor** role by default

**Note:** To change a user's role, a system admin needs to use the API:
```bash
curl -X PUT "http://localhost:8001/api/users/{user_id}/role?role=procurement_officer" \
  -H "Authorization: Bearer {admin_session_token}"
```

## Troubleshooting

### "Still showing landing page after setting cookie"
- Make sure the cookie name is exactly `session_token` (lowercase, underscore)
- Make sure you're on the correct domain
- Try clearing all cookies and setting again
- Check the browser console for any errors

### "Getting 401 Unauthorized"
- The session token might be expired (tokens last 7 days)
- Run the test user creation script again: `python3 /app/create_test_user.py`
- Copy the new session tokens

### "OAuth redirect not working"
- This is expected in some environments
- Use the manual cookie method instead
- Or update the redirect URL to match your exact domain

## Create More Test Users

Run this command to create fresh test users:
```bash
cd /app && python3 create_test_user.py
```

This will output new session tokens you can use immediately.
