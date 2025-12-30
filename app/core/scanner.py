# app/core/scanner.py
"""Core port scanning functionality."""

import socket
import time
from typing import List, Dict, Any, Tuple
import asyncio
import concurrent.futures
from .safe_checks import safe_http_checks, safe_tls_checks


# Configuration constants
SOCKET_CONNECT_TIMEOUT = 2
MAX_CONCURRENT_SCANS = 200
MIN_PORT = 1
MAX_PORT = 65535


def validate_port(port: int) -> bool:
    """Validate that a port number is within valid range."""
    try:
        port = int(port)
        return MIN_PORT <= port <= MAX_PORT
    except (ValueError, TypeError):
        return False


def scan_port(host: str, port: int) -> Dict[str, Any]:
    """
    Scan a single port using socket.create_connection().
    
    Args:
        host: Target hostname or IP address
        port: Port number to scan
        
    Returns:
        Dictionary with scan results including open/closed status and latency
    """
    result = {
        "host": host,
        "port": port,
        "is_open": False,
        "service": None,
        "banner": None,
        "tls": False,
        "latency": None
    }
    
    start_time = time.time()
    
    try:
        # Use socket.create_connection() as specified
        with socket.create_connection((host, port), timeout=SOCKET_CONNECT_TIMEOUT) as sock:
            result["is_open"] = True
            result["latency"] = round((time.time() - start_time) * 1000, 2)  # in ms
            
            # Try to get service name
            try:
                result["service"] = socket.getservbyport(port)
            except OSError:
                result["service"] = "unknown"
            
            # Perform safe checks based on port
            if port in [80, 8080, 8000]:
                http_info = safe_http_checks(host, port, use_https=False)
                if http_info:
                    result["banner"] = http_info.get("server_header")
            
            if port in [443, 8443]:
                tls_info = safe_tls_checks(host, port)
                if tls_info:
                    result["tls"] = True
                    result["banner"] = f"TLS - {tls_info.get('issuer', 'Unknown')}"
                    
    except socket.timeout:
        result["latency"] = SOCKET_CONNECT_TIMEOUT * 1000  # timeout in ms
    except (socket.error, OSError, ConnectionRefusedError):
        # Port is closed - keep is_open as False
        pass
    except Exception as e:
        result["error"] = str(e)
    
    return result


def parse_port_spec(port_spec: str) -> List[int]:
    """
    Parse a port specification string into a list of port numbers.
    
    Args:
        port_spec: Port specification (e.g., "22,80,443" or "1-1024")
        
    Returns:
        List of port numbers
    """
    ports = []
    port_spec_cleaned = port_spec.replace(" ", "")
    
    if not port_spec_cleaned:
        raise ValueError("No valid ports specified")
    
    for port_entry in port_spec_cleaned.split(","):
        port_entry = port_entry.strip()
        
        if '-' in port_entry:
            # Handle port range
            try:
                start, end = map(int, port_entry.split('-'))
                if start > end:
                    raise ValueError(f"Invalid range: {start}-{end} (start > end)")
                if not (validate_port(start) and validate_port(end)):
                    raise ValueError(f"Invalid port range: {port_entry}")
                ports.extend(range(start, end + 1))
            except ValueError as e:
                raise ValueError(f"Invalid port range format: {port_entry} - {str(e)}")
        
        elif port_entry.isdigit():
            # Handle single port
            port = int(port_entry)
            if not validate_port(port):
                raise ValueError(f"Invalid port: {port_entry}")
            ports.append(port)
        
        else:
            raise ValueError(f"Invalid port format: {port_entry}")
    
    return sorted(list(set(ports)))  # Remove duplicates and sort


async def scan_ports_async(
    host: str,
    port_spec: str,
    progress_callback=None,
) -> List[Dict[str, Any]]:
    """
    Scan multiple ports concurrently with max 50 concurrent connections.
    
    Args:
        host: Target hostname or IP address
        port_spec: Port specification string
        
    Returns:
        List of scan results for each port
    """
    try:
        ports = parse_port_spec(port_spec)
    except ValueError as e:
        return [{"error": str(e)}]
    
    # Use ThreadPoolExecutor for concurrent scanning with max 50 workers
    loop = asyncio.get_event_loop()
    total_ports = len(ports)

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_CONCURRENT_SCANS) as executor:
        futures = [
            loop.run_in_executor(executor, scan_port, host, port)
            for port in ports
        ]

        scan_results: List[Dict[str, Any]] = []
        completed = 0

        for fut in asyncio.as_completed(futures):
            try:
                result = await fut
                scan_results.append(result)
            except Exception as e:
                scan_results.append({"error": str(e)})
            finally:
                completed += 1
                if progress_callback is not None:
                    try:
                        progress_callback(completed, total_ports)
                    except Exception:
                        # Progress callbacks must never break scanning
                        pass

    # Keep output stable/predictable (sorted by port when present)
    def _sort_key(entry: Dict[str, Any]):
        port = entry.get("port")
        return (port is None, port)

    return sorted(scan_results, key=_sort_key)


def scanning(host: str, port_spec: str, progress_callback=None) -> List[Dict[str, Any]]:
    """
    Synchronous wrapper for scanning ports.
    
    Args:
        host: Target hostname or IP address
        port_spec: Port specification string
        
    Returns:
        List of scan results
    """
    return asyncio.run(scan_ports_async(host, port_spec, progress_callback=progress_callback))