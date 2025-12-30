# app/db/models.py
"""SQLModel database models for storing scan results."""

from sqlmodel import SQLModel, Field, Column, JSON, create_engine, Session, ForeignKey
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


class ScanStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Scan(SQLModel, table=True):
    """Database model for storing scan information and results."""
    
    __tablename__ = "scans"
    
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        description="Unique scan identifier"
    )
    target: str = Field(description="Target host scanned")
    port_range: str = Field(description="Port specification used")
    status: ScanStatus = Field(default=ScanStatus.pending, description="Scan status")
    
    started_at: Optional[datetime] = Field(default=None, description="Scan start timestamp")
    completed_at: Optional[datetime] = Field(default=None, description="Scan completion timestamp")
    
    overall_risk: Optional[RiskLevel] = Field(default=None, description="Overall risk level")


class PortResult(SQLModel, table=True):
    """Database model for storing individual port scan results."""
    
    __tablename__ = "port_results"
    
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        description="Unique port result identifier"
    )
    scan_id: str = Field(foreign_key="scans.id", description="Reference to scan")
    
    port: int = Field(description="Port number")
    is_open: bool = Field(description="Whether port is open")
    service: Optional[str] = Field(default=None, description="Service name")
    banner: Optional[str] = Field(default=None, description="Service banner")
    tls: bool = Field(default=False, description="Whether TLS is present")
    risk: RiskLevel = Field(default=RiskLevel.low, description="Port risk level")


def init_db(database_url: str = "sqlite:///./nscanner.db") -> Any:
    """
    Initialize the database engine and create tables.
    
    Args:
        database_url: SQLAlchemy database URL
        
    Returns:
        SQLAlchemy engine instance
    """
    engine = create_engine(
        database_url,
        echo=False,
        connect_args={"check_same_thread": False} if database_url.startswith("sqlite") else {}
    )
    SQLModel.metadata.create_all(engine)
    return engine


def get_session(engine: Any) -> Session:
    """
    Get a new database session.
    
    Args:
        engine: SQLAlchemy engine instance
        
    Returns:
        Database session
    """
    return Session(engine)