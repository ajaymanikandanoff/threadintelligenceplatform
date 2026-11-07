"""
Unified Database Module for AI ThreatLens SOC
Supports:
1. MongoDB Atlas (Cloud Persistent Storage across Render deploys & restarts)
2. Local JSON Files (Fallback when MONGODB_URI is not set or offline)
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

logger = logging.getLogger("database")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
INVESTIGATIONS_FILE = os.path.join(DATA_DIR, "investigations.json")
os.makedirs(DATA_DIR, exist_ok=True)

_mongo_client = None
_mongo_db = None
_is_connected = False

def init_db():
    """Initializes MongoDB connection if MONGODB_URI is configured."""
    global _mongo_client, _mongo_db, _is_connected
    uri = os.environ.get("MONGODB_URI", "").strip()
    if not uri:
        logger.info("No MONGODB_URI found in environment. Using local JSON file storage.")
        _is_connected = False
        return

    try:
        import pymongo
        _mongo_client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=4000)
        # Test connection
        _mongo_client.admin.command('ping')
        
        # Determine database name (defaults to 'threatlens_soc' if not in URI)
        db_name = os.environ.get("MONGODB_DB_NAME", "threatlens_soc")
        _mongo_db = _mongo_client[db_name]
        _is_connected = True
        logger.info(f"Connected to MongoDB Atlas: database '{db_name}'.")

        # Create indexes for optimal lookup performance
        try:
            _mongo_db.users.create_index("email", unique=True)
            _mongo_db.investigations.create_index("id", unique=True)
            _mongo_db.investigations.create_index([("created_at", pymongo.DESCENDING)])
        except Exception as e:
            logger.warning(f"Could not create MongoDB indexes: {e}")

        # Auto-migrate existing local JSON data if MongoDB collections are fresh
        _auto_sync_initial_data()

    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e}. Falling back to local JSON storage.")
        _is_connected = False
        _mongo_client = None
        _mongo_db = None

def _auto_sync_initial_data():
    """Syncs existing local data into MongoDB on first connection if collection is empty."""
    if not _is_connected or _mongo_db is None:
        return

    try:
        # Sync users if empty
        if _mongo_db.users.count_documents({}) == 0 and os.path.exists(USERS_FILE):
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                local_users = json.load(f)
            if local_users:
                docs = [dict(v, _id=k) for k, v in local_users.items()]
                _mongo_db.users.insert_many(docs)
                logger.info(f"Auto-synced {len(docs)} users from local JSON to MongoDB Atlas.")

        # Sync investigations if empty
        if _mongo_db.investigations.count_documents({}) == 0 and os.path.exists(INVESTIGATIONS_FILE):
            with open(INVESTIGATIONS_FILE, "r", encoding="utf-8") as f:
                local_invs = json.load(f)
            if local_invs:
                docs = [dict(item, _id=item.get("id")) for item in local_invs]
                _mongo_db.investigations.insert_many(docs)
                logger.info(f"Auto-synced {len(docs)} investigations from local JSON to MongoDB Atlas.")
    except Exception as e:
        logger.warning(f"Initial sync to MongoDB failed: {e}")

# Initialize on module import
init_db()

def is_mongodb_connected() -> bool:
    """Returns True if connected to MongoDB Atlas."""
    return _is_connected and _mongo_db is not None

def get_db_status() -> Dict[str, Any]:
    """Returns database status for health endpoints."""
    return {
        "engine": "MongoDB Atlas" if is_mongodb_connected() else "Local JSON Storage",
        "is_cloud_persistent": is_mongodb_connected(),
        "database_name": _mongo_db.name if is_mongodb_connected() else "local_data"
    }

# ==============================================================
# USER STORAGE (Authentication, Profiles, Sessions)
# ==============================================================

def load_users() -> Dict[str, Dict[str, Any]]:
    """Loads all registered users as a dict keyed by lowercase email."""
    if is_mongodb_connected():
        try:
            users = {}
            for doc in _mongo_db.users.find():
                email = doc.get("email", "").lower().strip()
                if email:
                    doc.pop("_id", None)
                    users[email] = doc
            return users
        except Exception as e:
            logger.error(f"MongoDB load_users error: {e}. Falling back to JSON.")

    # Local fallback
    if not os.path.exists(USERS_FILE):
        return {}
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_users(users: Dict[str, Dict[str, Any]]) -> None:
    """Saves the entire users dictionary to persistent storage."""
    # Always update local JSON as backup
    try:
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Local JSON save_users error: {e}")

    # If MongoDB connected, sync records
    if is_mongodb_connected():
        try:
            for email, data in users.items():
                doc = dict(data)
                doc.pop("_id", None)
                _mongo_db.users.update_one(
                    {"email": email.lower().strip()},
                    {"$set": doc},
                    upsert=True
                )
        except Exception as e:
            logger.error(f"MongoDB save_users error: {e}")

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Fetches a single user by email."""
    email_key = email.lower().strip()
    if is_mongodb_connected():
        try:
            doc = _mongo_db.users.find_one({"email": email_key})
            if doc:
                doc.pop("_id", None)
                return doc
        except Exception as e:
            logger.error(f"MongoDB get_user_by_email error: {e}")

    users = load_users()
    return users.get(email_key)

def upsert_user(email: str, user_data: Dict[str, Any]) -> None:
    """Inserts or updates a user record."""
    email_key = email.lower().strip()
    clean_data = dict(user_data)
    clean_data.pop("_id", None)
    clean_data["email"] = email_key

    # Save to MongoDB
    if is_mongodb_connected():
        try:
            _mongo_db.users.update_one(
                {"email": email_key},
                {"$set": clean_data},
                upsert=True
            )
        except Exception as e:
            logger.error(f"MongoDB upsert_user error: {e}")

    # Save to local JSON
    users = load_users()
    users[email_key] = clean_data
    try:
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Local JSON upsert_user error: {e}")

# ==============================================================
# INVESTIGATION & SEARCH HISTORY STORAGE
# ==============================================================

def load_investigations() -> List[Dict[str, Any]]:
    """Loads all saved investigation records ordered from newest to oldest."""
    if is_mongodb_connected():
        try:
            import pymongo
            items = []
            for doc in _mongo_db.investigations.find().sort("created_at", pymongo.DESCENDING).limit(500):
                doc.pop("_id", None)
                items.append(doc)
            return items
        except Exception as e:
            logger.error(f"MongoDB load_investigations error: {e}. Falling back to JSON.")

    if not os.path.exists(INVESTIGATIONS_FILE):
        return []
    try:
        with open(INVESTIGATIONS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_investigations(items: List[Dict[str, Any]]) -> None:
    """Persists investigations list to storage."""
    try:
        with open(INVESTIGATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Local JSON save_investigations error: {e}")

    if is_mongodb_connected():
        try:
            # Upsert top investigations
            for item in items[:500]:
                doc = dict(item)
                doc.pop("_id", None)
                inv_id = doc.get("id")
                if inv_id:
                    _mongo_db.investigations.update_one(
                        {"id": inv_id},
                        {"$set": doc},
                        upsert=True
                    )
        except Exception as e:
            logger.error(f"MongoDB save_investigations error: {e}")

def insert_investigation(record: Dict[str, Any]) -> None:
    """Inserts a single new investigation record."""
    clean_record = dict(record)
    clean_record.pop("_id", None)
    inv_id = clean_record.get("id")

    if is_mongodb_connected():
        try:
            _mongo_db.investigations.update_one(
                {"id": inv_id},
                {"$set": clean_record},
                upsert=True
            )
        except Exception as e:
            logger.error(f"MongoDB insert_investigation error: {e}")

    # Also update local JSON
    local_items = load_investigations()
    local_items = [clean_record] + [i for i in local_items if i.get("id") != inv_id][:499]
    try:
        with open(INVESTIGATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(local_items, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Local JSON insert_investigation error: {e}")

def delete_investigation(inv_id: str) -> bool:
    """Removes an investigation record by ID."""
    deleted = False
    if is_mongodb_connected():
        try:
            res = _mongo_db.investigations.delete_one({"id": inv_id})
            deleted = res.deleted_count > 0
        except Exception as e:
            logger.error(f"MongoDB delete_investigation error: {e}")

    items = load_investigations()
    init_len = len(items)
    items = [i for i in items if i.get("id") != inv_id]
    if len(items) != init_len:
        try:
            with open(INVESTIGATIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(items, f, indent=2, ensure_ascii=False)
            deleted = True
        except Exception as e:
            logger.error(f"Local JSON delete_investigation error: {e}")
            
    return deleted

def clear_all_investigations() -> int:
    """Clears all investigations from storage."""
    count = 0
    if is_mongodb_connected():
        try:
            res = _mongo_db.investigations.delete_many({})
            count = res.deleted_count
        except Exception as e:
            logger.error(f"MongoDB clear_all_investigations error: {e}")

    items = load_investigations()
    count = max(count, len(items))
    try:
        with open(INVESTIGATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)
    except Exception as e:
        logger.error(f"Local JSON clear_all_investigations error: {e}")

    return count
