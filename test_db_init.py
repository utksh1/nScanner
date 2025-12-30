import sys
import os
sys.path.append(os.getcwd())

from app.db.models import init_db
from app.db.session import get_engine

print("Initializing DB...")
try:
    engine = get_engine()
    print("DB initialized successfully.")
except Exception as e:
    print(f"DB initialization failed: {e}")
