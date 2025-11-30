# ✅ Production Deployment Checklist

## Pre-Deployment

- [x] MongoDB database name fix applied (procurement_db → sourcevia)
- [x] CORS hardcoded defaults added to code
- [x] `/api/health` endpoint added
- [x] Error handling added to auth endpoints
- [x] All endpoints tested in development
- [x] CORS tested for both sourcevia.xyz domains

## Deployment Steps

### 1. Deploy Code
- [ ] Click **Deploy** in Emergent interface
- [ ] Select deployment: **EMT-496c37 (sourcevia-secure)**
- [ ] Wait for deployment to complete (10-15 minutes)

### 2. Configure Environment Variables

**Backend Environment Variables:**
```
CORS_ORIGINS=https://sourcevia.xyz,https://www.sourcevia.xyz,https://sourcevia-mgmt.emergent.host
MONGO_URL=mongodb+srv://YOUR_USER:YOUR_PASS@YOUR_CLUSTER.mongodb.net/sourcevia?retryWrites=true&w=majority
EMERGENT_LLM_KEY=sk-emergent-e9d7eEd061b2fCeDbB
```

- [ ] Set `CORS_ORIGINS` (or rely on hardcoded defaults)
- [ ] Set `MONGO_URL` with your MongoDB Atlas credentials
- [ ] Verify database name is `sourcevia` in URL path
- [ ] Restart backend after setting variables

**Frontend Environment Variables:**
```
REACT_APP_BACKEND_URL=https://sourcevia-mgmt.emergent.host
```

- [ ] Verify `REACT_APP_BACKEND_URL` is set correctly

### 3. Post-Deployment Testing

**Test 1: Backend Health**
```bash
curl https://sourcevia-mgmt.emergent.host/api/health
```
- [ ] Returns 200 OK with `{"status":"ok","database":"connected"}`

**Test 2: API Documentation**
- [ ] Open https://sourcevia-mgmt.emergent.host/docs in browser
- [ ] FastAPI Swagger UI loads

**Test 3: CORS Headers**
```bash
curl -X OPTIONS https://sourcevia-mgmt.emergent.host/api/auth/login \
  -H "Origin: https://sourcevia.xyz" \
  -H "Access-Control-Request-Method: POST" -v
```
- [ ] Response includes `access-control-allow-origin: https://sourcevia.xyz`

**Test 4: Login Endpoint**
```bash
curl -X POST https://sourcevia-mgmt.emergent.host/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```
- [ ] Returns 401 Unauthorized (expected for invalid credentials)
- [ ] Does NOT return 500 Internal Server Error

**Test 5: Frontend Integration**
- [ ] Open https://sourcevia.xyz/login in browser
- [ ] Open DevTools (F12) → Console
- [ ] Try to login with test credentials
- [ ] Check Console: NO CORS errors
- [ ] Check Network tab: Successful POST to backend

**Test 6: Create Test Users**
- [ ] Run user creation script in production database
- [ ] Test login with: `admin@sourcevia.com` / `admin123`
- [ ] Verify successful login and redirect to dashboard

## Success Indicators

### Backend Logs Should Show:
```
🔒 CORS Configuration:
   Allowed Origins: ['https://sourcevia.xyz', 'https://www.sourcevia.xyz', ...]
   
🔗 FINAL MongoDB Configuration:
   Database: 'sourcevia'
   
INFO: Application startup complete.
```

### Browser Should Show:
- ✅ No CORS errors in Console
- ✅ Successful API responses in Network tab
- ✅ Login works and redirects to dashboard
- ✅ "Backend is reachable!" message in debug info

### API Responses Should Include:
```
access-control-allow-origin: https://sourcevia.xyz
access-control-allow-credentials: true
access-control-allow-methods: *
access-control-allow-headers: *
```

## Troubleshooting

### Issue: Still Getting CORS Errors

**Check 1: Backend Deployed?**
```bash
curl https://sourcevia-mgmt.emergent.host/api/health
```
If this fails, backend is not deployed or not running.

**Check 2: CORS_ORIGINS Set?**
Check backend environment variables. Should include:
```
CORS_ORIGINS=https://sourcevia.xyz,https://www.sourcevia.xyz
```

**Check 3: Backend Restarted?**
After setting environment variables, restart the backend service.

**Check 4: Old Code?**
Verify deployment includes latest code with hardcoded CORS defaults.

### Issue: 500 Internal Server Error

**Check 1: MongoDB Connection**
```bash
curl https://sourcevia-mgmt.emergent.host/api/health
```
Response should show: `"database":"connected"`

**Check 2: Database Name**
Verify `MONGO_URL` includes `/sourcevia` in the path:
```
mongodb+srv://...@cluster.mongodb.net/sourcevia?...
```

**Check 3: Backend Logs**
Check backend logs for errors during startup.

### Issue: 404 Not Found

**Check 1: Correct URLs**
- Root: `/`
- Health: `/health` or `/api/health`
- Login: `/api/auth/login` (with `/api` prefix)
- Docs: `/docs`

**Check 2: API Router Included**
Backend code should include: `app.include_router(api_router)`

## Final Verification

- [ ] Backend is accessible at https://sourcevia-mgmt.emergent.host
- [ ] All health endpoints return 200 OK
- [ ] CORS headers present in responses
- [ ] MongoDB connection established
- [ ] Frontend can call backend without CORS errors
- [ ] Login works from https://sourcevia.xyz
- [ ] Test users can authenticate successfully

## 🎉 Deployment Complete!

When all checkboxes are checked, your production deployment is successful!

**Frontend:** https://sourcevia.xyz → ✅ Working  
**Backend:** https://sourcevia-mgmt.emergent.host → ✅ Working  
**CORS:** Configured → ✅ No Errors  
**Authentication:** Login/Register → ✅ Functional  

---

**Reference Documents:**
- `/app/CORS_DEPLOYMENT_FINAL.md` - CORS configuration details
- `/app/PRODUCTION_500_ERROR_FIX.md` - Backend error fixes
- `/app/PRODUCTION_TEST_COMMANDS.sh` - Testing commands
- `/app/backend/.env.production` - Environment variables template
