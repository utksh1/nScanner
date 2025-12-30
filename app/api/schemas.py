from pydantic import BaseModel, Field, validator, model_validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import ipaddress
# Import constant for consistency
from app.core.config import MAX_PORTS_PER_SCAN


class ScanRequest(BaseModel):
    """Request model for initiating a port scan."""
    
    host: Optional[str] = Field(None, description="Target hostname or IP address")
    target: Optional[str] = Field(None, description="Target hostname or IP address (alias for host)")
    ports: Optional[str] = Field(None, description="Port specification (e.g., '22,80,443' or '1-1024')")
    port_range: Optional[str] = Field(None, description="Port range (alias for ports)")

    @model_validator(mode='before')
    @classmethod
    def validate_request(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
            
        # Map aliases
        if 'target' in data and not data.get('host'):
            data['host'] = data['target']
        if 'port_range' in data and not data.get('ports'):
            data['ports'] = data['port_range']
            
        host = data.get('host')
        ports = data.get('ports') or "1-1024"
        
        if not host:
            raise ValueError("Host or Target is required")
            
        # Strip and validate host
        host = str(host).strip()
        if "://" in host:
            host = host.split("://")[-1]
        host = host.split("/")[0]

        # Strip and validate ports
        ports = str(ports).strip()
        
        # Count total ports to prevent abuse
        port_count = 0
        for part in ports.split(','):
            if '-' in part:
                try:
                    start, end = map(int, part.strip().split('-'))
                    port_count += (end - start + 1)
                except:
                    pass
            else:
                port_count += 1
        
        if port_count > MAX_PORTS_PER_SCAN: 
            raise ValueError(f"Maximum {MAX_PORTS_PER_SCAN} ports per scan")
            
        data['host'] = host
        data['ports'] = ports
        return data

class FindingModel(BaseModel):
    """Model for a single security finding."""
    
    type: str
    detail: str
    severity: Optional[str] = "info"


class PortResult(BaseModel):
    """Model for a single port scan result."""
    
    host: Optional[str] = None
    port: Optional[int] = None
    state: Optional[str] = None
    service: Optional[str] = None
    banner: Optional[str] = None
    findings: List[FindingModel] = []
    mapping_summary: Optional[str] = None
    remediation: Optional[str] = None
    base_severity: Optional[str] = None
    error: Optional[str] = None


class ScanResponse(BaseModel):
    """Response model for scan initiation."""
    
    scan_id: str
    status: str = "queued"
    message: str = "Scan queued successfully"


class ScanStatus(BaseModel):
    """Model for scan status information."""
    
    scan_id: str
    host: str
    ports: str
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress: Optional[int] = None  # Percentage if available


class ScanResult(BaseModel):
    """Complete scan result model."""
    
    scan_id: str
    host: str
    ports: str
    status: str
    ports_scanned: int
    open_ports: int
    closed_ports: int
    error_count: int
    elapsed: float
    risk_score: int
    risk_level: str
    total_findings: int
    critical_findings: int
    high_findings: int
    results: List[PortResult]
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class ScanListItem(BaseModel):
    """Model for scan list item (summary view)."""
    
    scan_id: str
    host: str
    status: str
    risk_level: Optional[str] = None
    open_ports: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class ErrorResponse(BaseModel):
    """Model for error responses."""
    
    error: str
    detail: Optional[str] = None