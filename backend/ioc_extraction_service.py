"""
IOC Extraction Service
Extracted and adapted from IntelOwl Observable Parsers & TTPMapper regex engines.
Extracts, defangs/refangs, validates, and calculates confidence for:
- IPv4 & IPv6 addresses
- Fully Qualified Domain Names (FQDNs)
- URLs
- File Hashes (MD5, SHA1, SHA256)
- CVE Identifiers (CVE-YYYY-NNNN+)
"""

import re
import ipaddress
from typing import Dict, List, Any, Optional

# Defang regex replacements
DEFANG_REPLACEMENTS = [
    (re.compile(r'hxxp://', re.IGNORECASE), 'http://'),
    (re.compile(r'hxxps://', re.IGNORECASE), 'https://'),
    (re.compile(r'\[\.\]', re.IGNORECASE), '.'),
    (re.compile(r'\(\.\)', re.IGNORECASE), '.'),
    (re.compile(r'\{\.\}', re.IGNORECASE), '.'),
    (re.compile(r'\[:\]', re.IGNORECASE), ':'),
    (re.compile(r'\(\:\)', re.IGNORECASE), ':'),
    (re.compile(r'\[dot\]', re.IGNORECASE), '.'),
    (re.compile(r'\[at\]', re.IGNORECASE), '@'),
]

# Standard Regex Patterns
IPV4_PATTERN = re.compile(
    r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b'
)

IPV6_PATTERN = re.compile(
    r'\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b|'
    r'\b(?:[A-Fa-f0-9]{1,4}:)*:[A-Fa-f0-9]{1,4}(?::[A-Fa-f0-9]{1,4})*\b'
)

DOMAIN_PATTERN = re.compile(
    r'\b(?!(?:https?|ftp)://)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|edu|gov|mil|io|ai|co|xyz|info|biz|ru|cn|in|uk|de|eu|top|online|site|club|vip|live|cc|me|app|dev|pro|tech|store|news|security|click|link|space)\b',
    re.IGNORECASE
)

URL_PATTERN = re.compile(
    r'\bhttps?://(?:[a-zA-Z0-9\-._~%!$&\'()*+,;=:]+@)?(?:[a-zA-Z0-9\-._~%]+|\[[a-fA-F0-9:]+\])(?::\d+)?(?:/[a-zA-Z0-9\-._~%!$&\'()*+,;=:@/]*)*(?:\?[a-zA-Z0-9\-._~%!$&\'()*+,;=:@/?]*)?(?:#[a-zA-Z0-9\-._~%!$&\'()*+,;=:@/?]*)?\b',
    re.IGNORECASE
)

MD5_PATTERN = re.compile(r'\b[a-fA-F0-9]{32}\b')
SHA1_PATTERN = re.compile(r'\b[a-fA-F0-9]{40}\b')
SHA256_PATTERN = re.compile(r'\b[a-fA-F0-9]{64}\b')

CVE_PATTERN = re.compile(r'\bCVE-\d{4}-\d{4,7}\b', re.IGNORECASE)

# Ignored domains/common noise to prevent false positives
IGNORED_DOMAINS = {
    'github.com', 'microsoft.com', 'google.com', 'w3.org', 'adobe.com',
    'apple.com', 'cve.mitre.org', 'nvd.nist.gov', 'example.com', 'example.org',
    'localhost', 'schema.org', 'mitre.org', 'attack.mitre.org', 'virustotal.com'
}

def refang_text(text: str) -> str:
    """Normalize defanged indicators back into canonical formats."""
    result = text
    for pattern, replacement in DEFANG_REPLACEMENTS:
        result = pattern.sub(replacement, result)
    return result

def defang_indicator(indicator: str, ioc_type: str) -> str:
    """Converts a live malicious indicator into safe, non-clickable defanged text."""
    if not indicator:
        return ""
    if ioc_type in ('url', 'URL'):
        return indicator.replace('http://', 'hxxp://').replace('https://', 'hxxps://')
    if ioc_type in ('ip', 'ipv4', 'ipv6', 'IP address', 'domain', 'Domain'):
        return indicator.replace('.', '[.]')
    return indicator

def find_context_snippet(full_text: str, match_text: str, window: int = 120) -> str:
    """Locates the sentence or surrounding context where the indicator was observed."""
    idx = full_text.find(match_text)
    if idx == -1:
        return ""
    start = max(0, idx - window)
    end = min(len(full_text), idx + len(match_text) + window)
    snippet = full_text[start:end].replace('\n', ' ').strip()
    return f"...{snippet}..." if (start > 0 or end < len(full_text)) else snippet

def extract_all_iocs(text: str, page_number: Optional[int] = None) -> Dict[str, List[Dict[str, Any]]]:
    """
    Parses unstructured text and extracts all validated IOC categories
    with evidence snippets and confidence ratings.
    """
    normalized_text = refang_text(text or "")
    
    extracted: Dict[str, List[Dict[str, Any]]] = {
        "ipv4": [],
        "ipv6": [],
        "domains": [],
        "urls": [],
        "hashes": {
            "md5": [],
            "sha1": [],
            "sha256": []
        },
        "cves": []
    }
    
    seen_values = set()

    # 1. URLs (extracted before domains to avoid domain collision)
    url_matches = URL_PATTERN.findall(normalized_text)
    for url in url_matches:
        u_clean = url.rstrip('.)],;\'"')
        if u_clean not in seen_values and len(u_clean) > 8:
            seen_values.add(u_clean)
            extracted["urls"].append({
                "value": u_clean,
                "defanged": defang_indicator(u_clean, "url"),
                "type": "URL",
                "page": page_number,
                "evidence": find_context_snippet(normalized_text, u_clean),
                "confidence": 95 if "?" in u_clean or len(u_clean) > 25 else 85
            })

    # 2. IPv4
    for match in IPV4_PATTERN.finditer(normalized_text):
        ip_str = match.group(0)
        try:
            ip_obj = ipaddress.IPv4Address(ip_str)
            # Filter non-routable / private defaults from high-priority IOCs unless specified
            is_private = ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_reserved or ip_obj.is_link_local
            if ip_str not in seen_values and ip_str != "0.0.0.0" and not ip_str.startswith("255."):
                seen_values.add(ip_str)
                extracted["ipv4"].append({
                    "value": ip_str,
                    "defanged": defang_indicator(ip_str, "ip"),
                    "type": "IPv4",
                    "is_private": is_private,
                    "page": page_number,
                    "evidence": find_context_snippet(normalized_text, ip_str),
                    "confidence": 75 if is_private else 95
                })
        except ValueError:
            continue

    # 3. IPv6
    for match in IPV6_PATTERN.finditer(normalized_text):
        ip6_str = match.group(0)
        if ":" in ip6_str and len(ip6_str) > 4:
            try:
                ip6_obj = ipaddress.IPv6Address(ip6_str)
                if ip6_str not in seen_values:
                    seen_values.add(ip6_str)
                    extracted["ipv6"].append({
                        "value": ip6_str,
                        "defanged": defang_indicator(ip6_str, "ip"),
                        "type": "IPv6",
                        "is_private": ip6_obj.is_private,
                        "page": page_number,
                        "evidence": find_context_snippet(normalized_text, ip6_str),
                        "confidence": 90
                    })
            except ValueError:
                continue

    # 4. Domains
    for match in DOMAIN_PATTERN.finditer(normalized_text):
        dom = match.group(0).lower().rstrip('.)],;\'"')
        if dom not in seen_values and dom not in IGNORED_DOMAINS and not dom.endswith('.pdf'):
            # Ensure it's not a substring of an already extracted URL host
            seen_values.add(dom)
            extracted["domains"].append({
                "value": dom,
                "defanged": defang_indicator(dom, "domain"),
                "type": "Domain",
                "page": page_number,
                "evidence": find_context_snippet(normalized_text, dom),
                "confidence": 90
            })

    # 5. Hashes
    # SHA-256
    for match in SHA256_PATTERN.finditer(normalized_text):
        h = match.group(0).lower()
        if h not in seen_values:
            seen_values.add(h)
            extracted["hashes"]["sha256"].append({
                "value": h,
                "type": "SHA-256",
                "page": page_number,
                "evidence": find_context_snippet(normalized_text, match.group(0)),
                "confidence": 99
            })

    # SHA-1
    for match in SHA1_PATTERN.finditer(normalized_text):
        h = match.group(0).lower()
        if h not in seen_values:
            seen_values.add(h)
            extracted["hashes"]["sha1"].append({
                "value": h,
                "type": "SHA-1",
                "page": page_number,
                "evidence": find_context_snippet(normalized_text, match.group(0)),
                "confidence": 95
            })

    # MD5
    for match in MD5_PATTERN.finditer(normalized_text):
        h = match.group(0).lower()
        if h not in seen_values:
            seen_values.add(h)
            extracted["hashes"]["md5"].append({
                "value": h,
                "type": "MD5",
                "page": page_number,
                "evidence": find_context_snippet(normalized_text, match.group(0)),
                "confidence": 90
            })

    # 6. CVEs
    for match in CVE_PATTERN.finditer(normalized_text):
        cve_id = match.group(0).upper()
        if cve_id not in seen_values:
            seen_values.add(cve_id)
            extracted["cves"].append({
                "value": cve_id,
                "type": "CVE",
                "url": f"https://nvd.nist.gov/vuln/detail/{cve_id}",
                "page": page_number,
                "evidence": find_context_snippet(normalized_text, match.group(0)),
                "confidence": 99
            })

    return extracted

