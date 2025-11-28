"""
Database connection and utilities
"""
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs

load_dotenv()

def extract_db_name_from_url(mongo_url):
    """
    Extract database name from MongoDB connection string.
    Supports both standard and Atlas connection strings.
    
    Examples:
    - mongodb://localhost:27017/mydb -> mydb
    - mongodb+srv://user:pass@cluster.net/mydb?options -> mydb
    - mongodb://localhost:27017/ -> None
    """
    try:
        # Parse the URL
        parsed = urlparse(mongo_url)
        
        # Get the path (everything after the host, before query string)
        path = parsed.path
        
        # Remove leading slash and query parameters
        if path and len(path) > 1:
            db_name = path.lstrip('/').split('?')[0]
            if db_name:
                return db_name
    except Exception as e:
        print(f"Warning: Could not parse database name from URL: {e}")
    
    return None

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')

# Database name priority:
# 1. Explicitly set MONGO_DB_NAME environment variable
# 2. Database name extracted from MONGO_URL
# 3. Default fallback to 'procurement_db'
MONGO_DB_NAME = (
    os.environ.get('MONGO_DB_NAME') or 
    extract_db_name_from_url(MONGO_URL) or 
    'procurement_db'
)

print(f"🔗 MongoDB Configuration:")
print(f"   URL: {MONGO_URL[:50]}...")
print(f"   Database: {MONGO_DB_NAME}")

client = AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB_NAME]
