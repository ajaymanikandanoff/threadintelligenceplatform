"""
Threat Correlation & Persistent Investigation Service
Integrates scan results across IP, Domain, URL, and PDF Research into a unified investigation store.
Saves and indexes investigations in backend/data/investigations.json.
Correlates related infrastructure and cross-observable findings.
"""

import os
import json
import time
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
INVESTIGATIONS_FILE = os.path.join(DATA_DIR, "investigations.json")
os.makedirs(DATA_DIR, exist_ok=True)

def _load_investigations() -> List[Dict[str, Any]]:
    if not os.path.exists(INVESTIGATIONS_FILE):
        return []
    try:
        with open(INVESTIGATIONS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _save_investigations(items: List[Dict[str, Any]]) -> None:
    try:
        with open(INVESTIGATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving investigations: {e}")

def save_investigation_record(
    indicator: str,
    indicator_type: str,
    risk_score: int,
    classification: str,
    severity: str,
    details: Dict[str, Any],
    user_email: Optional[str] = "analyst@threatlens.io"
) -> Dict[str, Any]:
    """
    Saves an investigation record to persistent storage and correlates
    it with associated observables.
    """
    investigations = _load_investigations()
    
    inv_id = f"inv-{int(time.time())}-{uuid.uuid4().hex[:6]}"
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    # Extract related observables based on type
    related_indicators = []
    if indicator_type.lower() == "ip":
        rev_dns = details.get("reverse_dns")
        if rev_dns and rev_dns != "No PTR record found":
            related_indicators.append({"type": "Domain", "value": rev_dns, "relationship": "PTR Hostname"})
    elif indicator_type.lower() == "domain":
        for ip in details.get("resolved_ips", []):
            related_indicators.append({"type": "IP", "value": ip, "relationship": "DNS A Record"})
    elif indicator_type.lower() == "url":
        hostname = details.get("hostname")
        if hostname:
            related_indicators.append({"type": "Domain", "value": hostname, "relationship": "URL Host"})
        for ip in details.get("resolved_ips", []):
            related_indicators.append({"type": "IP", "value": ip, "relationship": "Host IP"})
    elif indicator_type.lower() == "pdf":
        iocs = details.get("iocs", {})
        for ip_item in iocs.get("ipv4", [])[:5]:
            related_indicators.append({"type": "IP", "value": ip_item["value"], "relationship": "Extracted from PDF"})
        for dom_item in iocs.get("domains", [])[:5]:
            related_indicators.append({"type": "Domain", "value": dom_item["value"], "relationship": "Extracted from PDF"})

    record = {
        "id": inv_id,
        "indicator": indicator,
        "type": indicator_type,
        "risk_score": risk_score,
        "classification": classification,
        "severity": severity,
        "created_at": now_iso,
        "analyst": user_email or "analyst@threatlens.io",
        "related_indicators": related_indicators,
        "details": details
    }

    # Prepend to top of list
    investigations.insert(0, record)
    # Keep last 500 investigations
    if len(investigations) > 500:
        investigations = investigations[:500]

    _save_investigations(investigations)
    return record

def get_all_investigations(
    query: Optional[str] = None,
    ioc_type: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 50
) -> List[Dict[str, Any]]:
    """Retrieves investigations with flexible search and filtering."""
    items = _load_investigations()

    if query:
        q = query.lower().strip()
        items = [i for i in items if q in i.get("indicator", "").lower() or q in i.get("classification", "").lower()]

    if ioc_type and ioc_type.lower() != "all":
        t = ioc_type.lower()
        items = [i for i in items if i.get("type", "").lower() == t]

    if severity and severity.lower() != "all":
        s = severity.lower()
        items = [i for i in items if s in i.get("severity", "").lower()]

    return items[:limit]

def get_investigation_by_id(inv_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single investigation record by ID."""
    items = _load_investigations()
    for item in items:
        if item.get("id") == inv_id:
            return item
    return None

def delete_investigation(inv_id: str) -> bool:
    """Removes an investigation record."""
    items = _load_investigations()
    initial_len = len(items)
    items = [i for i in items if i.get("id") != inv_id]
    if len(items) != initial_len:
        _save_investigations(items)
        return True
    return False

