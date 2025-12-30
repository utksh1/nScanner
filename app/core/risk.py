# app/core/risk.py
"""Risk assessment engine for vulnerability analysis."""

from typing import List, Dict, Any
from datetime import datetime
from ..db.models import RiskLevel


def assess_port_risk(port_result: Dict[str, Any]) -> RiskLevel:
    """
    Assess risk level for a single port based on vulnerability rules.
    
    Args:
        port_result: Dictionary containing port scan results
        
    Returns:
        RiskLevel enum (low, medium, high)
    """
    if not port_result.get("is_open", False):
        return RiskLevel.low
    
    port = port_result.get("port", 0)
    service = port_result.get("service", "").lower()
    tls_info = port_result.get("tls", False)
    
    # High risk ports
    high_risk_ports = [21, 23, 3389]  # FTP, Telnet, RDP
    if port in high_risk_ports:
        return RiskLevel.high
    
    # Check for expired TLS certificate
    if tls_info and port_result.get("tls_info"):
        not_after = port_result["tls_info"].get("not_after", "")
        if not_after:
            try:
                # Parse certificate expiry date
                exp_date = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z")
                if exp_date < datetime.now():
                    return RiskLevel.high
            except ValueError:
                pass  # If we can't parse, don't mark as high risk
    
    # Medium risk conditions
    medium_conditions = [
        # HTTP without TLS
        port in [80, 8080, 8000] and not tls_info,
        # Open ports > 1024 with banner
        port > 1024 and port_result.get("banner"),
        # Common services with potential issues
        service in ["ssh", "ftp", "smtp"] and port_result.get("banner")
    ]
    
    if any(medium_conditions):
        return RiskLevel.medium
    
    # Default to low risk
    return RiskLevel.low


def calculate_overall_risk(port_results: List[Dict[str, Any]]) -> RiskLevel:
    """
    Calculate overall scan risk based on individual port risks.
    
    Args:
        port_results: List of port scan results
        
    Returns:
        Overall RiskLevel (highest detected risk)
    """
    if not port_results:
        return RiskLevel.low
    
    risk_levels = []
    for result in port_results:
        risk = assess_port_risk(result)
        risk_levels.append(risk)
    
    # Return highest risk level
    if RiskLevel.high in risk_levels:
        return RiskLevel.high
    elif RiskLevel.medium in risk_levels:
        return RiskLevel.medium
    else:
        return RiskLevel.low


def get_risk_summary(port_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate risk summary for scan results.
    
    Args:
        port_results: List of port scan results
        
    Returns:
        Dictionary with risk summary statistics
    """
    if not port_results:
        return {
            "overall_risk": RiskLevel.low,
            "open_ports": 0,
            "high_risk_ports": 0,
            "medium_risk_ports": 0,
            "low_risk_ports": 0
        }
    
    open_ports = [r for r in port_results if r.get("is_open", False)]
    risk_counts = {
        RiskLevel.high: 0,
        RiskLevel.medium: 0,
        RiskLevel.low: 0
    }
    
    for result in open_ports:
        risk = assess_port_risk(result)
        risk_counts[risk] += 1
    
    return {
        "overall_risk": calculate_overall_risk(port_results),
        "open_ports": len(open_ports),
        "high_risk_ports": risk_counts[RiskLevel.high],
        "medium_risk_ports": risk_counts[RiskLevel.medium],
        "low_risk_ports": risk_counts[RiskLevel.low]
    }


def severity_weight(severity: str) -> int:
    """
    Get the risk score weight for a severity level.
    
    Args:
        severity: Severity level (critical, high, medium, low, info)
        
    Returns:
        Integer weight value for the severity
    """
    weights = {
        "critical": 50,
        "high": 30,
        "medium": 15,
        "low": 5,
        "info": 0
    }
    return weights.get(severity.lower(), 0)


def compute_port_score(port_result: Dict[str, Any]) -> int:
    """
    Compute risk score for a single port result.
    
    Args:
        port_result: Dictionary containing port scan results
        
    Returns:
        Risk score (0-100)
    """
    is_open = port_result.get("is_open")
    if is_open is None:
        is_open = port_result.get("state") == "open"

    # Closed ports have zero score
    if not is_open:
        return 0
    
    score = 10  # Base score for any open port
    
    port = port_result.get("port", 0)
    findings = port_result.get("findings", [])
    
    # Add points for risky ports
    high_risk_ports = [21, 23, 3389]  # FTP, Telnet, RDP
    if port in high_risk_ports:
        score += 20
    
    # Add points for findings
    for finding in findings:
        severity = finding.get("severity", "info")
        score += severity_weight(severity)
    
    # Add points for banner information
    if port_result.get("banner"):
        score += 5
    
    # Add points for TLS (positive or negative)
    if port_result.get("tls"):
        score += 5
    
    return min(score, 100)  # Cap at 100


def summarize_scan(scan_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Summarize scan results with statistics and risk assessment.
    
    Args:
        scan_results: List of scan result dictionaries
        
    Returns:
        Dictionary with scan summary statistics
    """
    if not scan_results:
        return {
            "ports_scanned": 0,
            "open_ports": 0,
            "closed_ports": 0,
            "error_count": 0,
            "total_findings": 0,
            "critical_findings": 0,
            "high_findings": 0,
            "risk_level": "LOW",
            "risk_score": 0
        }
    
    ports_scanned = len(scan_results)
    open_ports = 0
    closed_ports = 0
    error_count = 0
    total_findings = 0
    critical_findings = 0
    high_findings = 0
    total_score = 0
    
    for result in scan_results:
        if "error" in result:
            error_count += 1
        else:
            is_open = result.get("is_open")
            if is_open is None:
                is_open = result.get("state") == "open"

            if is_open:
                open_ports += 1
            else:
                closed_ports += 1
        
        # Count findings
        findings = result.get("findings", [])
        total_findings += len(findings)
        
        for finding in findings:
            severity = finding.get("severity", "").lower()
            if severity == "critical":
                critical_findings += 1
            elif severity == "high":
                high_findings += 1
        
        # Calculate risk score
        total_score += compute_port_score(result)
    
    # Determine risk level
    if critical_findings > 0 or high_findings > 2:
        risk_level = "HIGH"
    elif high_findings > 0 or total_findings > 5:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
    
    return {
        "ports_scanned": ports_scanned,
        "open_ports": open_ports,
        "closed_ports": closed_ports,
        "error_count": error_count,
        "total_findings": total_findings,
        "critical_findings": critical_findings,
        "high_findings": high_findings,
        "risk_level": risk_level,
        "risk_score": min(total_score, 100)
    }