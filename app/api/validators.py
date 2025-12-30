# app/api/validators.py
"""Input validation utilities for the nScanner API."""

import re
import ipaddress
from typing import List


# Private IP ranges to block
PRIVATE_IP_RANGES = [
    ipaddress.IPv4Network("10.0.0.0/8"),
    ipaddress.IPv4Network("172.16.0.0/12"),
    ipaddress.IPv4Network("192.168.0.0/16"),
    ipaddress.IPv4Network("127.0.0.0/8"),  # Loopback
    ipaddress.IPv4Network("169.254.0.0/16"),  # Link-local
    ipaddress.IPv4Network("224.0.0.0/4"),  # Multicast
    ipaddress.IPv4Network("0.0.0.0/8"),  # Reserved
    ipaddress.IPv4Network("240.0.0.0/4"),  # Reserved
]

# Domain name regex
DOMAIN_REGEX = re.compile(
    r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$"
)


def is_private_ip(ip_str: str) -> bool:
    """
    Check if an IP address is in a private range.
    
    Args:
        ip_str: IP address string
        
    Returns:
        True if IP is private, False otherwise
    """
    try:
        ip = ipaddress.IPv4Address(ip_str)
        for private_range in PRIVATE_IP_RANGES:
            if ip in private_range:
                return True
        return False
    except ipaddress.AddressValueError:
        return False


def validate_target(target: str) -> bool:
    """
    Validate target hostname or IP address.
    
    Args:
        target: Target hostname or IP address
        
    Returns:
        True if valid and not private, False otherwise
    """
    if not target or not isinstance(target, str):
        return False
    
    target = target.strip()
    
    # Remove protocol prefix if present
    if "://" in target:
        target = target.split("://")[-1]
    
    # Remove path/trailing slashes
    target = target.split("/")[0]
    
    # Check if it's an IP address
    try:
        ip = ipaddress.IPv4Address(target)
        # Block private IPs
        return not is_private_ip(target)
    except ipaddress.AddressValueError:
        pass
    
    # Check if it's a domain name
    if DOMAIN_REGEX.match(target):
        return True
    
    return False


def validate_port_range(port_spec: str) -> bool:
    """
    Validate port specification string.
    
    Args:
        port_spec: Port specification (e.g., "22,80,443" or "1-1024")
        
    Returns:
        True if valid, False otherwise
    """
    if not port_spec or not isinstance(port_spec, str):
        return False
    
    port_spec = port_spec.strip().replace(" ", "")
    
    if not port_spec:
        return False
    
    # Split by comma
    port_entries = port_spec.split(",")
    
    for entry in port_entries:
        entry = entry.strip()
        
        # Check for range
        if "-" in entry:
            try:
                start, end = entry.split("-")
                start = int(start)
                end = int(end)
                
                # Validate range
                if start > end:
                    return False
                if start < 1 or end > 65535:
                    return False
            except ValueError:
                return False
        
        # Check for single port
        else:
            try:
                port = int(entry)
                if port < 1 or port > 65535:
                    return False
            except ValueError:
                return False
    
    return True


def parse_port_spec(port_spec: str) -> List[int]:
    """
    Parse port specification string into list of ports.
    
    Args:
        port_spec: Port specification (e.g., "22,80,443" or "1-1024")
        
    Returns:
        List of port numbers
    """
    if not validate_port_range(port_spec):
        raise ValueError("Invalid port specification")
    
    ports = []
    port_spec = port_spec.strip().replace(" ", "")
    
    for entry in port_spec.split(","):
        entry = entry.strip()
        
        if "-" in entry:
            # Handle range
            start, end = map(int, entry.split("-"))
            ports.extend(range(start, end + 1))
        else:
            # Handle single port
            ports.append(int(entry))
    
    # Remove duplicates and sort
    return sorted(list(set(ports)))


def sanitize_target(target: str) -> str:
    """
    Sanitize target string.
    
    Args:
        target: Target hostname or IP
        
    Returns:
        Sanitized target string
    """
    if not target:
        return ""
    
    return target.strip().lower()


def get_validation_error(field: str, value: str) -> str:
    """
    Get user-friendly validation error message.
    
    Args:
        field: Field name (target or port_range)
        value: Invalid value
        
    Returns:
        Error message
    """
    if field == "target":
        if not value:
            return "Target is required"
        if is_private_ip(value):
            return f"Private IP addresses are not allowed: {value}"
        return f"Invalid target. Must be a valid public domain name or IP address: {value}"
    
    elif field == "port_range":
        if not value:
            return "Port range is required"
        return f"Invalid port range. Must be between 1-65535: {value}"
    
    return f"Invalid {field}: {value}"
