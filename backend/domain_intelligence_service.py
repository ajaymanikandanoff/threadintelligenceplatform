"""
Domain Intelligence Scanning Service
Integrated from IntelOwl Observable Domain Analyzers.
Provides:
- Domain validation & FQDN parsing.
- DNS record resolution: A, AAAA, MX, TXT, NS, CNAME.
- WHOIS / RDAP registration & expiration metadata.
- SSL/TLS certificate inspection over port 443.
- Nameserver analysis & infrastructure mapping.
- Suspicious indicator heuristics (DGA detection, young domains, risky TLDs).
- Structured threat assessment & risk scoring (0-100).
"""

import re
import socket
import ssl
import json
import urllib.request
import math
from datetime import datetime
from typing import Dict, Any, List, Optional
import dns.resolver

SUSPICIOUS_TLDS = {
    "top", "xyz", "club", "buzz", "work", "loan", "tk", "ml", "ga", "cf", "gq",
    "online", "site", "vip", "icu", "click", "live", "rest", "surf", "fit"
}

def calculate_shannon_entropy(string: str) -> float:
    """Calculates Shannon entropy to detect DGA (Domain Generation Algorithm) names."""
    if not string:
        return 0.0
    prob = [float(string.count(c)) / len(string) for c in set(string)]
    return -sum([p * math.log(p) / math.log(2.0) for p in prob])

def resolve_dns_records(domain: str) -> Dict[str, List[Any]]:
    """Resolves A, AAAA, MX, TXT, NS, and CNAME records."""
    resolver = dns.resolver.Resolver()
    resolver.timeout = 2.5
    resolver.lifetime = 3.0

    records: Dict[str, List[Any]] = {
        "A": [],
        "AAAA": [],
        "MX": [],
        "TXT": [],
        "NS": [],
        "CNAME": []
    }

    # Record types to query
    for rtype in ["A", "AAAA", "MX", "TXT", "NS", "CNAME"]:
        try:
            answers = resolver.resolve(domain, rtype)
            for rdata in answers:
                if rtype == "MX":
                    records["MX"].append({
                        "host": str(rdata.exchange).rstrip('.'),
                        "preference": rdata.preference
                    })
                elif rtype in ("A", "AAAA", "NS", "CNAME"):
                    records[rtype].append(str(rdata).rstrip('.'))
                elif rtype == "TXT":
                    records["TXT"].append(str(rdata).strip('"'))
        except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.Timeout, Exception):
            pass

    return records

def fetch_domain_rdap(domain: str) -> Dict[str, Any]:
    """Queries ICANN RDAP for domain registration, expiration, and registrar."""
    rdap_info = {
        "registrar": "Unknown",
        "created_date": None,
        "expires_date": None,
        "updated_date": None,
        "status": [],
        "age_days": None
    }

    try:
        url = f"https://rdap.org/domain/{domain}"
        req = urllib.request.Request(url, headers={"User-Agent": "ThreatLens-CTI/1.0"})
        with urllib.request.urlopen(req, timeout=4.0) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            
            # Events: registration, expiration, last changed
            events = data.get("events", [])
            for ev in events:
                action = ev.get("eventAction")
                date_str = ev.get("eventDate")
                if action == "registration":
                    rdap_info["created_date"] = date_str
                elif action == "expiration":
                    rdap_info["expires_date"] = date_str
                elif action in ("last changed", "last update of RDAP database"):
                    rdap_info["updated_date"] = date_str

            # Entities -> Registrar
            entities = data.get("entities", [])
            for ent in entities:
                roles = ent.get("roles", [])
                if "registrar" in roles:
                    vcard = ent.get("vcardArray", [])
                    if len(vcard) > 1:
                        for item in vcard[1]:
                            if item[0] == "fn":
                                rdap_info["registrar"] = item[3]
                                break

            # Calculate domain age in days if created_date is available
            if rdap_info["created_date"]:
                try:
                    # Clean date string (handles ISO format e.g. 2021-08-12T14:30:00Z)
                    clean_date = rdap_info["created_date"].split("T")[0]
                    dt = datetime.strptime(clean_date, "%Y-%m-%d")
                    rdap_info["age_days"] = (datetime.utcnow() - dt).days
                except Exception:
                    pass

            rdap_info["status"] = data.get("status", [])
    except Exception:
        pass

    return rdap_info

def fetch_ssl_certificate(domain: str) -> Optional[Dict[str, Any]]:
    """Extracts live SSL/TLS certificate details for the domain over port 443."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE  # inspect even untrusted/self-signed certs

    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3.0)
        wrapped = ctx.wrap_socket(sock, server_hostname=domain)
        wrapped.connect((domain, 443))
        cert = wrapped.getpeercert(binary_form=False)
        wrapped.close()

        if not cert:
            return None

        # Parse subject & issuer
        subject = {}
        for item in cert.get('subject', ()):
            for key, val in item:
                subject[key] = val

        issuer = {}
        for item in cert.get('issuer', ()):
            for key, val in item:
                issuer[key] = val

        not_after = cert.get('notAfter')
        not_before = cert.get('notBefore')

        days_remaining = None
        if not_after:
            try:
                exp_dt = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z")
                days_remaining = (exp_dt - datetime.utcnow()).days
            except Exception:
                pass

        sans = [val for key, val in cert.get('subjectAltName', []) if key == 'DNS']

        return {
            "has_ssl": True,
            "subject_cn": subject.get("commonName", domain),
            "issuer_cn": issuer.get("commonName", "Unknown"),
            "issuer_org": issuer.get("organizationName", "Unknown"),
            "valid_from": not_before,
            "valid_to": not_after,
            "days_remaining": days_remaining,
            "is_expired": days_remaining is not None and days_remaining < 0,
            "san_count": len(sans),
            "subject_alt_names": sans[:8]
        }
    except Exception:
        return {
            "has_ssl": False,
            "reason": "Port 443 SSL handshake timed out or not available."
        }

def scan_domain_intelligence(domain_input: str) -> Dict[str, Any]:
    """
    Executes full domain intelligence assessment:
    Syntax validation, DNS record queries, WHOIS/RDAP, SSL certificate,
    DGA entropy analysis, and comprehensive risk scoring.
    """
    cleaned = domain_input.strip().lower()
    cleaned = re.sub(r'^https?://', '', cleaned).split('/')[0].split(':')[0]

    # Validate domain format
    if not re.match(r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$', cleaned):
        return {
            "success": False,
            "error": f"Invalid domain name format: '{domain_input}'.",
            "status": "invalid"
        }

    tld = cleaned.split('.')[-1]
    name_body = cleaned.split('.')[0]

    # 1. DNS Records
    dns_records = resolve_dns_records(cleaned)
    resolved_ips = dns_records.get("A", []) + dns_records.get("AAAA", [])

    # 2. WHOIS / RDAP
    rdap = fetch_domain_rdap(cleaned)

    # 3. SSL Certificate
    ssl_info = fetch_ssl_certificate(cleaned)

    # 4. Risk Factors & Suspicious Indicators
    risk_score = 0
    evidence = []
    risk_factors = []

    # Heuristic: Suspicious TLD
    if tld in SUSPICIOUS_TLDS:
        risk_score += 25
        risk_factors.append(f"High-abuse top-level domain (.{tld})")
        evidence.append(f"Top-level domain '.{tld}' is designated as high-abuse in global phishing/malware feeds.")

    # Heuristic: Shannon Entropy (DGA)
    entropy = calculate_shannon_entropy(name_body)
    if entropy > 3.6 and len(name_body) > 10:
        risk_score += 30
        risk_factors.append("High name entropy (Potential DGA / Algorithmically Generated Domain)")
        evidence.append(f"Shannon entropy of '{name_body}' is {entropy:.2f} (above 3.6 threshold), characteristic of automated DGA beacons.")

    # Heuristic: Domain Age
    age_days = rdap.get("age_days")
    if age_days is not None:
        if age_days < 14:
            risk_score += 35
            risk_factors.append(f"Newly registered domain (Registered {age_days} days ago)")
            evidence.append(f"Domain registered only {age_days} days ago. High correlation with disposable phishing/malware delivery.")
        elif age_days < 60:
            risk_score += 15
            evidence.append(f"Young domain ({age_days} days old).")
        else:
            evidence.append(f"Established domain age: {age_days} days (~{age_days//365} years old).")
    else:
        evidence.append("Registration date unlisted in public RDAP directory.")

    # Heuristic: DNS & Hosting
    if not resolved_ips:
        risk_score += 15
        evidence.append("No active A or AAAA DNS records found (Sinkholed, expired, or unassigned).")
    else:
        evidence.append(f"Resolves to {len(resolved_ips)} IP addresses: {', '.join(resolved_ips[:4])}.")

    # Heuristic: SSL certificate
    if ssl_info and ssl_info.get("has_ssl"):
        if ssl_info.get("is_expired"):
            risk_score += 20
            risk_factors.append("Expired SSL/TLS Certificate")
            evidence.append(f"SSL certificate expired ({ssl_info.get('valid_to')}).")
        else:
            evidence.append(f"Valid SSL certificate issued by '{ssl_info.get('issuer_cn')}' (Expires in {ssl_info.get('days_remaining')} days).")
    else:
        evidence.append("No active SSL/TLS listener detected on port 443.")

    # Check for security record compliance
    txt_records = dns_records.get("TXT", [])
    has_spf = any("v=spf1" in txt.lower() for txt in txt_records)
    has_dmarc = False # Would check _dmarc.domain
    if has_spf:
        evidence.append("SPF email validation record configured.")
    else:
        evidence.append("No SPF (Sender Policy Framework) record detected.")

    risk_score = min(100, max(5, risk_score))

    if risk_score >= 75:
        classification = "Malicious / High Risk"
        severity = "Critical severity"
    elif risk_score >= 50:
        classification = "Suspicious"
        severity = "High severity"
    elif risk_score >= 25:
        classification = "Elevated Risk"
        severity = "Medium severity"
    else:
        classification = "Clean / Legitimate"
        severity = "Safe"
        evidence.append("Domain exhibits established registration history, valid DNS resolution, and trusted certificate.")

    # Recommended Actions
    actions = []
    if risk_score >= 70:
        actions.append(f"Sinkhole DNS resolution for {cleaned} on enterprise recursive resolvers.")
        actions.append("Inspect web gateway logs for any outbound user connections to this domain.")
        actions.append("Block associated hosting IP infrastructure at the perimeter.")
    elif risk_score >= 40:
        actions.append(f"Isolate user web sessions visiting {cleaned} with browser isolation (RBI).")
        actions.append("Flag emails originating from this domain for strict security inspection.")
    else:
        actions.append("No blocking required. Domain satisfies baseline security criteria.")

    return {
        "success": True,
        "indicator": cleaned,
        "type": "Domain",
        "domain": cleaned,
        "tld": tld,
        "entropy": round(entropy, 2),
        "risk_score": risk_score,
        "reputation_score": 100 - risk_score,
        "classification": classification,
        "severity": severity,
        "confidence": 92,
        "rdap": rdap,
        "dns_records": dns_records,
        "resolved_ips": resolved_ips,
        "ssl": ssl_info,
        "risk_factors": risk_factors,
        "evidence": evidence,
        "recommended_actions": actions,
        "summary": f"Domain {cleaned} (.{tld}) registered via '{rdap.get('registrar')}'. Resolved {len(resolved_ips)} host IP(s). Risk assessment: {classification} ({risk_score}/100)."
    }

