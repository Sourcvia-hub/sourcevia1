"""
Script to create test users with different roles for RBAC testing
"""
import asyncio
from utils.database import db
from utils.auth import hash_password
from datetime import datetime, timezone
import uuid


async def create_test_users():
    """Create test users for each role"""
    
    test_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "user@test.com",
            "name": "Test User (Regular)",
            "password": hash_password("password"),
            "role": "user",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "email": "manager@test.com",
            "name": "Test Direct Manager",
            "password": hash_password("password"),
            "role": "direct_manager",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "email": "officer@test.com",
            "name": "Test Procurement Officer",
            "password": hash_password("password"),
            "role": "procurement_officer",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "email": "senior@test.com",
            "name": "Test Senior Manager",
            "password": hash_password("password"),
            "role": "senior_manager",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "email": "procmgr@test.com",
            "name": "Test Procurement Manager",
            "password": hash_password("password"),
            "role": "procurement_manager",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "email": "admin@test.com",
            "name": "Test Admin",
            "password": hash_password("password"),
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    print("Creating test users...")
    print("-" * 60)
    
    for user_data in test_users:
        # Check if user already exists
        existing = await db.users.find_one({"email": user_data["email"]})
        
        if existing:
            # Update role if exists
            await db.users.update_one(
                {"email": user_data["email"]},
                {"$set": {"role": user_data["role"], "name": user_data["name"]}}
            )
            print(f"✓ Updated: {user_data['email']:25} | Role: {user_data['role']:25}")
        else:
            # Create new user
            await db.users.insert_one(user_data)
            print(f"✓ Created: {user_data['email']:25} | Role: {user_data['role']:25}")
    
    print("-" * 60)
    print("\n📋 Test Accounts Summary:")
    print("=" * 60)
    print(f"{'Email':<25} | {'Password':<15} | {'Role':<25}")
    print("-" * 60)
    
    for user_data in test_users:
        print(f"{user_data['email']:<25} | {'password':<15} | {user_data['role']:<25}")
    
    print("=" * 60)
    print("\n✅ All test users ready!")
    print("\n💡 Usage:")
    print("   1. Go to login page")
    print("   2. Use any email above with password: 'password'")
    print("   3. Test different role permissions\n")


if __name__ == "__main__":
    asyncio.run(create_test_users())
