# app/db/session.py
"""Database session management."""

from sqlmodel import Session, create_engine
from .models import init_db

# Global engine instance
engine = None


def get_engine(database_url: str = "sqlite:///./nscanner.db"):
    """Get or create database engine."""
    global engine
    if engine is None:
        engine = init_db(database_url)
    return engine


def get_session() -> Session:
    """Get a new database session."""
    return Session(get_engine())
