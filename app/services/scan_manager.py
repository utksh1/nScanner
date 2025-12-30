# app/services/scan_manager.py
"""Service layer for managing and orchestrating scans."""

import uuid
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlmodel import Session, select
from app.core.scanner import scan_ports_async
from app.core.risk import get_risk_summary, calculate_overall_risk
from app.db.models import Scan, PortResult, ScanStatus, RiskLevel
from app.db.session import get_session

# In-memory store for active scan tracking
ACTIVE_SCANS: Dict[str, Dict[str, Any]] = {}
SCAN_SEMAPHORE: Optional[asyncio.Semaphore] = None
MAX_CONCURRENT_SCANS = 50


def get_semaphore() -> asyncio.Semaphore:
    """Get or create the scan concurrency semaphore."""
    global SCAN_SEMAPHORE
    if SCAN_SEMAPHORE is None:
        SCAN_SEMAPHORE = asyncio.Semaphore(MAX_CONCURRENT_SCANS)
    return SCAN_SEMAPHORE


async def start_scan_async(target: str, port_range: str = "1-1024") -> str:
    """
    Start an asynchronous port scan.
    
    Args:
        target: Target hostname or IP address
        port_range: Port specification string
        
    Returns:
        Unique scan ID for tracking
    """
    scan_id = str(uuid.uuid4())
    
    # Create scan record in database
    with get_session() as session:
        scan = Scan(
            id=scan_id,
            target=target,
            port_range=port_range,
            status=ScanStatus.pending,
            started_at=datetime.now()
        )
        session.add(scan)
        session.commit()
    
    # Initialize in-memory tracking
    ACTIVE_SCANS[scan_id] = {
        "status": ScanStatus.pending,
        "target": target,
        "port_range": port_range,
        "started_at": datetime.now()
    }
    
    # Start scan in background
    asyncio.create_task(execute_scan(scan_id, target, port_range))
    
    return scan_id


async def execute_scan(scan_id: str, target: str, port_range: str):
    """
    Execute the actual scan and save results.
    
    Args:
        scan_id: Unique scan identifier
        target: Target hostname or IP address
        port_range: Port specification string
    """
    semaphore = get_semaphore()
    
    async with semaphore:
        try:
            # Update status to running
            await update_scan_status(scan_id, ScanStatus.running)
            
            # Perform scan
            scan_results = await scan_ports_async(target, port_range)
            
            # Save results to database
            await save_scan_results(scan_id, scan_results)
            
            # Update status to completed
            await update_scan_status(scan_id, ScanStatus.completed)
            
        except Exception as e:
            # Update status to failed
            await update_scan_status(scan_id, ScanStatus.failed)
            print(f"Scan {scan_id} failed: {e}")
        
        finally:
            # Clean up in-memory tracking
            ACTIVE_SCANS.pop(scan_id, None)


async def save_scan_results(scan_id: str, scan_results: List[Dict[str, Any]]):
    """
    Save scan results to database.
    
    Args:
        scan_id: Unique scan identifier
        scan_results: List of port scan results
    """
    with get_session() as session:
        # Calculate overall risk
        overall_risk = calculate_overall_risk(scan_results)
        
        # Update scan with overall risk and completion time
        scan = session.get(Scan, scan_id)
        if scan:
            scan.overall_risk = overall_risk
            scan.completed_at = datetime.now()
            
            # Save port results
            for result in scan_results:
                if "error" not in result:
                    port_result = PortResult(
                        scan_id=scan_id,
                        port=result.get("port", 0),
                        is_open=result.get("is_open", False),
                        service=result.get("service"),
                        banner=result.get("banner"),
                        tls=result.get("tls", False),
                        risk=assess_port_risk_from_result(result)
                    )
                    session.add(port_result)
            
            session.commit()


def assess_port_risk_from_result(result: Dict[str, Any]) -> RiskLevel:
    """
    Assess port risk from scan result.
    
    Args:
        result: Port scan result
        
    Returns:
        Risk level for the port
    """
    from app.core.risk import assess_port_risk
    return assess_port_risk(result)


async def update_scan_status(scan_id: str, status: ScanStatus):
    """
    Update scan status in database and memory.
    
    Args:
        scan_id: Unique scan identifier
        status: New scan status
    """
    with get_session() as session:
        scan = session.get(Scan, scan_id)
        if scan:
            scan.status = status
            if status == ScanStatus.running and not scan.started_at:
                scan.started_at = datetime.now()
            elif status in [ScanStatus.completed, ScanStatus.failed]:
                scan.completed_at = datetime.now()
            session.commit()
    
    # Update in-memory tracking
    if scan_id in ACTIVE_SCANS:
        ACTIVE_SCANS[scan_id]["status"] = status


def get_scan(scan_id: str) -> Optional[Dict[str, Any]]:
    """
    Get scan details and results.
    
    Args:
        scan_id: Unique scan identifier
        
    Returns:
        Scan details with port results or None
    """
    with get_session() as session:
        scan = session.get(Scan, scan_id)
        if not scan:
            return None
        
        # Get port results
        port_results = session.exec(
            select(PortResult).where(PortResult.scan_id == scan_id)
        ).all()
        
        return {
            "id": scan.id,
            "target": scan.target,
            "port_range": scan.port_range,
            "status": scan.status,
            "started_at": scan.started_at.isoformat() if scan.started_at else None,
            "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
            "overall_risk": scan.overall_risk,
            "port_results": [
                {
                    "port": pr.port,
                    "is_open": pr.is_open,
                    "service": pr.service,
                    "banner": pr.banner,
                    "tls": pr.tls,
                    "risk": pr.risk
                }
                for pr in port_results
            ]
        }


def list_scans(limit: int = 50) -> List[Dict[str, Any]]:
    """
    List recent scans.
    
    Args:
        limit: Maximum number of scans to return
        
    Returns:
        List of scan summaries
    """
    with get_session() as session:
        scans = session.exec(
            select(Scan)
            .order_by(Scan.started_at.desc())
            .limit(limit)
        ).all()
        
        return [
            {
                "id": scan.id,
                "target": scan.target,
                "port_range": scan.port_range,
                "status": scan.status,
                "started_at": scan.started_at.isoformat() if scan.started_at else None,
                "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
                "overall_risk": scan.overall_risk
            }
            for scan in scans
        ]


def delete_scan(scan_id: str) -> bool:
    """
    Delete a scan and its results.
    
    Args:
        scan_id: Unique scan identifier
        
    Returns:
        True if deleted, False if not found
    """
    with get_session() as session:
        # Delete port results first
        port_results = session.exec(
            select(PortResult).where(PortResult.scan_id == scan_id)
        ).all()
        for pr in port_results:
            session.delete(pr)
        
        # Delete scan
        scan = session.get(Scan, scan_id)
        if scan:
            session.delete(scan)
            session.commit()
            return True
        
        return False
    
    