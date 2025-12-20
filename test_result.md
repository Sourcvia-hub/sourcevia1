# Test Result Documentation

## Current Testing Focus
Testing Controlled Access + HoP Role Control + Password Reset features

## Test Credentials
- **Procurement Officer**: `test_officer@sourcevia.com` / `Password123!`
- **Head of Procurement (HoP)**: `test_manager@sourcevia.com` / `Password123!`
- **Business User**: `testuser@test.com` / `Password123!`

## Features Implemented

### 1. Registration - No Role Selection
- Role dropdown removed from registration form
- All new users created as `business_user`
- Backend ignores any `role` field from client
- Notice shown: "All new accounts are created as Business User"

### 2. HoP-Only User Management (/user-management)
- List/search users by name, email
- Filter by role, status
- Change role dropdown (click on role badge)
- Disable/Enable accounts
- Force password reset
- Audit trail logging

### 3. Password Management
- Forgot Password flow (/forgot-password)
- Reset Password with token (/reset-password)
- Change Password in profile (/change-password)
- Force password reset on login
- Password policy: min 10 chars, uppercase, lowercase, number

### 4. Domain Restriction (Feature Flag)
- `AUTH_DOMAIN_RESTRICTION_ENABLED=false` (default, testing mode)
- `AUTH_ALLOWED_EMAIL_DOMAINS=tamyuz.com.sa,sourcevia.com`
- Shows "DISABLED (Testing Mode)" in UI

## API Endpoints
- POST /api/auth/register - Creates user as business_user
- POST /api/auth/forgot-password - Request reset link
- POST /api/auth/reset-password - Reset with token
- POST /api/auth/change-password - Change own password
- GET /api/users - List users (HoP only)
- PATCH /api/users/{id}/role - Change role (HoP only)
- PATCH /api/users/{id}/status - Enable/disable (HoP only)
- POST /api/users/{id}/force-password-reset - Force reset (HoP only)
- GET /api/users/audit/logs - Audit trail (HoP only)

## Test Plan
1. Register new user - verify role is business_user
2. Login as HoP - access User Management page
3. Change user role - verify audit log
4. Disable user - verify they cannot login
5. Test forgot password flow
6. Test change password flow
