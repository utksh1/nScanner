# app/api/routes.py
"""FastAPI route definitions for the scanner API."""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from app.services.scan_manager import (
    start_scan_async,
    get_scan,
    list_scans,
    delete_scan
)
from app.api.validators import validate_target, validate_port_range
from app.api.schemas import ScanRequest
from app.db.models import ScanStatus, RiskLevel

# Initialize FastAPI app
app = FastAPI(
    title="nScanner",
    description="Safe, non-intrusive network port scanner with security checks",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/scan")
async def api_start_scan(request: ScanRequest):
    """
    Initiate a new port scan.
    
    Args:
        request: Scan configuration (target and port_range)
        
    Returns:
        Dictionary with scan ID
    """
    target = request.host
    port_range = request.ports

    # Validate inputs
    if not validate_target(target):
        raise HTTPException(status_code=400, detail="Invalid target. Must be a valid domain or public IP address.")
    
    if not validate_port_range(port_range):
        raise HTTPException(status_code=400, detail="Invalid port range. Must be between 1-65535.")
    
    # Start scan
    scan_id = await start_scan_async(target, port_range)
    
    return {"scan_id": scan_id}


@app.get("/api/scan/{scan_id}")
async def api_get_scan(scan_id: str):
    """
    Get scan details and results.
    
    Args:
        scan_id: Unique scan identifier
        
    Returns:
        Complete scan information with port results
    """
    scan = get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return scan


@app.get("/api/scans")
async def api_list_scans(limit: int = Query(50, ge=1, le=100)):
    """
    List recent scans.
    
    Args:
        limit: Maximum number of scans to return (1-100)
        
    Returns:
        List of scan summaries
    """
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
    
    scans = list_scans(limit)
    return {"scans": scans}


@app.delete("/api/scan/{scan_id}")
async def api_delete_scan(scan_id: str):
    """
    Delete a scan and its results.
    
    Args:
        scan_id: Unique scan identifier
        
    Returns:
        Success message
    """
    success = delete_scan(scan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return {"message": "Scan deleted successfully"}


@app.get("/api/health")
async def api_health():
    """
    Health check endpoint.
    
    Returns:
        Service health status
    """
    return {
        "status": "healthy",
        "service": "nScanner",
        "version": "1.0.0"
    }


# Root endpoint for API documentation
@app.get("/")
async def api_root():
    """
    Root endpoint with API information.
    
    Returns:
        API documentation links
    """
    return {
        "name": "nScanner API",
        "version": "1.0.0",
        "description": "Safe, non-intrusive network port scanner with security checks",
        "endpoints": {
            "POST /api/scan": "Start a new scan",
            "GET /api/scan/{scan_id}": "Get scan results",
            "GET /api/scans": "List recent scans",
            "DELETE /api/scan/{scan_id}": "Delete a scan",
            "GET /api/health": "Health check",
            "GET /docs": "Interactive API documentation"
        }
    }