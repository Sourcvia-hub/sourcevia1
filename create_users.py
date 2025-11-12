#!/usr/bin/env python3
"""
Create test users for Sourcevia Procurement System with email/password auth
"""
import requests
import json

BACKEND_URL = "http://localhost:8001"

# Test users to create
users = [
    {
        "email": "procurement@test.com",
        "password": "password",
        "name": "Procurement Officer",
        "role": "procurement_officer"
    },
    {
        "email": "manager@test.com",
        "password": "password",
        "name": "Project Manager",
        "role": "project_manager"
    }
]

print("Creating test users...")
print("=" * 60)

for user in users:
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/register",
            json=user
        )
        
        if response.status_code == 200:
            print(f"\n✅ Created: {user['name']}")
            print(f"   Email: {user['email']}")
            print(f"   Password: {user['password']}")
            print(f"   Role: {user['role']}")
        elif response.status_code == 400:
            print(f"\n⚠️  User already exists: {user['email']}")
        else:
            print(f"\n❌ Failed to create {user['email']}: {response.text}")
    except Exception as e:
        print(f"\n❌ Error creating {user['email']}: {str(e)}")

print("\n" + "=" * 60)
print("✅ Setup complete!")
print("=" * 60)
print("\nYou can now login with:")
print("  Email: procurement@test.com")
print("  Password: password")
print("\n  Email: manager@test.com")
print("  Password: password")
print("\nGo to your app URL and use these credentials to login!")
