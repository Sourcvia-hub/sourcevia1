#!/usr/bin/env python3
"""
Create a test user and session for testing the Sourcevia Procurement System
"""
import os
import sys
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient
import uuid

# Get MongoDB connection details
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
db_name = os.environ.get('DB_NAME', 'test_database')

# Connect to MongoDB
client = MongoClient(mongo_url)
db = client[db_name]

# Generate unique IDs
user_id = f"test-user-{int(datetime.now().timestamp())}"
session_token = f"test_session_{uuid.uuid4().hex}"

# Create test users with different roles
test_users = [
    {
        "id": f"procurement-officer-{int(datetime.now().timestamp())}",
        "email": f"procurement.officer.{int(datetime.now().timestamp())}@test.com",
        "name": "Test Procurement Officer",
        "picture": "https://via.placeholder.com/150",
        "role": "procurement_officer",
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": f"project-manager-{int(datetime.now().timestamp())}",
        "email": f"project.manager.{int(datetime.now().timestamp())}@test.com",
        "name": "Test Project Manager",
        "picture": "https://via.placeholder.com/150",
        "role": "project_manager",
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": f"vendor-{int(datetime.now().timestamp())}",
        "email": f"vendor.{int(datetime.now().timestamp())}@test.com",
        "name": "Test Vendor",
        "picture": "https://via.placeholder.com/150",
        "role": "vendor",
        "created_at": datetime.now(timezone.utc).isoformat()
    },
]

print("Creating test users...")
for user in test_users:
    # Insert user
    db.users.insert_one(user.copy())
    
    # Create session for this user
    session = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "session_token": f"test_session_{uuid.uuid4().hex}",
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    db.user_sessions.insert_one(session)
    
    print(f"\n✓ Created {user['role']}:")
    print(f"  Email: {user['email']}")
    print(f"  Session Token: {session['session_token']}")
    print(f"  User ID: {user['id']}")

print("\n" + "="*60)
print("Test users created successfully!")
print("="*60)
print("\nTo use these accounts:")
print("1. Copy a session token from above")
print("2. Open browser DevTools (F12)")
print("3. Go to Application > Cookies")
print("4. Add a cookie named 'session_token' with the copied token")
print("5. Refresh the page")
print("\nOr use this curl command to test:")
print(f"\ncurl -H 'Authorization: Bearer <session_token>' http://localhost:8001/api/auth/me")
