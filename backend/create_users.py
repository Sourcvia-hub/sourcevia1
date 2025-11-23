"""
Script to create default users in the database
Run this script to initialize users for the Sourcevia Procurement Management System
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from datetime import datetime, timezone

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

async def create_users():
    """Create default users in the database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Default user
    default_user = {
        "id": "user-procurement-001",
        "email": "procurement@test.com",
        "password": pwd_context.hash("password"),
        "role": "procurement_officer",
        "name": "Procurement Officer",
        "full_name": "Procurement Officer",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": default_user["email"]})
    
    if existing_user:
        print(f"✅ User already exists: {default_user['email']}")
        # Update password if needed
        await db.users.update_one(
            {"email": default_user["email"]},
            {"$set": {"password": default_user["password"], "name": default_user["name"]}}
        )
        print(f"✅ Updated user: {default_user['email']}")
    else:
        await db.users.insert_one(default_user)
        print(f"✅ Created user: {default_user['email']}")
    
    print("\n=== User Credentials ===")
    print(f"Email: {default_user['email']}")
    print(f"Password: password")
    print(f"Role: {default_user['role']}")
    print(f"Name: {default_user['name']}")
    print("========================\n")
    
    client.close()

if __name__ == "__main__":
    print("Creating default users...\n")
    asyncio.run(create_users())
    print("Done!")
