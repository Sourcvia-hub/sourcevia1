"""
Migration script to add workflow fields to all request collections
Run this once to migrate existing data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/procureflix")
client = AsyncIOMotorClient(MONGO_URL)

# Extract database name from URL
db_name = MONGO_URL.split("/")[-1].split("?")[0]
db = client[db_name]


async def add_workflow_to_collection(collection_name: str):
    """Add workflow fields to a collection"""
    print(f"\n📦 Migrating {collection_name}...")
    
    collection = db[collection_name]
    
    # Count documents without workflow field
    count = await collection.count_documents({"workflow": {"$exists": False}})
    print(f"   Found {count} documents to migrate")
    
    if count == 0:
        print("   ✅ Already migrated")
        return
    
    # Add workflow field to all documents
    result = await collection.update_many(
        {"workflow": {"$exists": False}},
        {
            "$set": {
                "workflow": {
                    "submitted_by": None,
                    "submitted_by_name": None,
                    "submitted_at": None,
                    "reviewed_by": None,
                    "reviewed_by_name": None,
                    "reviewed_at": None,
                    "assigned_approvers": [],
                    "assigned_approver_names": [],
                    "approvals": [],
                    "rejections": [],
                    "final_approved_by": None,
                    "final_approved_by_name": None,
                    "final_approved_at": None,
                    "returned_for_clarification": None,
                    "history": []
                }
            }
        }
    )
    
    print(f"   ✅ Migrated {result.modified_count} documents")


async def migrate_admin_users():
    """Convert all admin users to procurement_manager"""
    print(f"\n👥 Migrating admin users to procurement_manager...")
    
    # Count admin users
    count = await db.users.count_documents({"role": "admin"})
    print(f"   Found {count} admin users")
    
    if count == 0:
        print("   ✅ No admin users to migrate")
        return
    
    # Update all admin users
    result = await db.users.update_many(
        {"role": "admin"},
        {
            "$set": {
                "role": "procurement_manager",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    print(f"   ✅ Migrated {result.modified_count} users to procurement_manager")


async def update_existing_statuses():
    """Update existing records to have proper workflow status"""
    print(f"\n🔄 Updating existing record statuses...")
    
    collections = [
        "vendors",
        "tenders",
        "contracts", 
        "purchase_orders",
        "invoices",
        "service_requests",
        "resources"
    ]
    
    for collection_name in collections:
        collection = db[collection_name]
        
        # Update records with old statuses to workflow statuses
        # Map old statuses to new workflow statuses
        status_mapping = {
            "approved": "final_approved",
            "active": "final_approved",
            "published": "final_approved",
            "pending": "pending_review",
            "draft": "draft",
            "rejected": "rejected",
            "expired": "final_approved",  # Keep as final_approved, just expired
            "closed": "final_approved"
        }
        
        for old_status, new_status in status_mapping.items():
            result = await collection.update_many(
                {"status": old_status, "workflow.history.0": {"$exists": False}},
                {
                    "$set": {
                        "workflow.history": [{
                            "action": "created",
                            "by": "system",
                            "by_name": "System Migration",
                            "at": datetime.now(timezone.utc).isoformat(),
                            "comment": f"Migrated from legacy status: {old_status}"
                        }]
                    }
                }
            )
            if result.modified_count > 0:
                print(f"   ✅ {collection_name}: Updated {result.modified_count} records from {old_status}")


async def run_migration():
    """Run all migrations"""
    print("=" * 60)
    print("🚀 Starting Workflow Migration")
    print("=" * 60)
    
    # Collections to migrate
    collections = [
        "vendors",
        "tenders",
        "contracts",
        "purchase_orders",
        "invoices",
        "service_requests",
        "resources"
    ]
    
    # Add workflow fields to all collections
    for collection in collections:
        await add_workflow_to_collection(collection)
    
    # Migrate admin users
    await migrate_admin_users()
    
    # Update existing statuses
    await update_existing_statuses()
    
    print("\n" + "=" * 60)
    print("✅ Migration Complete!")
    print("=" * 60)
    
    # Close connection
    client.close()


if __name__ == "__main__":
    asyncio.run(run_migration())
