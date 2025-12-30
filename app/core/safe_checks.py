# app/core/safe_checks.py
"""Non-intrusive security checks for various services."""

import socket
import ssl
import httpx
from datetime import datetime
from typing import Dict, Optional


def safe_http_checks(host: str, port: int, use_https: bool = False) -> Optional[Dict[str, str]]:
    """
    Perform safe HTTP checks using HEAD request.
    
    Args:
        host: Target hostname or IP
        port: Target port number
        use_https: Whether to use HTTPS
        
    Returns:
        Dictionary with server header info or None
    """
    try:
        protocol = "https" if use_https else "http"
        url = f"{protocol}://{host}:{port}"
        
        with httpx.Client(timeout=5.0, follow_redirects=False) as client:
            response = client.head(url)
            
            # Extract server header only as specified
            server_header = response.headers.get("Server", "")
            
            return {
                "server_header": server_header,
                "status_code": response.status_code
            }
            
    except Exception:
        return None


def safe_tls_checks(host: str, port: int) -> Optional[Dict[str, str]]:
    """
    Perform safe TLS certificate checks.
    
    Args:
        host: Target hostname or IP
        port: Target port number
        
    Returns:
        Dictionary with TLS certificate info or None
    """
    try:
        # Create default SSL context
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        with socket.create_connection((host, port), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=host) as secure_sock:
                cert = secure_sock.getpeercert()
                
                # Extract certificate information
                issuer = dict(x[0] for x in cert.get('issuer', []))
                not_before = cert.get('notBefore', '')
                not_after = cert.get('notAfter', '')
                
                return {
                    "issuer": issuer.get('commonName', 'Unknown'),
                    "not_before": not_before,
                    "not_after": not_after,
                    "version": cert.get('version', ''),
                    "serial_number": cert.get('serialNumber', '')
                }
                
    except Exception:
        return None