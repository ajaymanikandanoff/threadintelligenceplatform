"""
MITRE ATT&CK Mapping Service
Adapted from TTPMapper rule and behavioral parsing engine.
Maps unstructured threat reports and intelligence observations to
the standard MITRE ATT&CK Enterprise Matrix (Tactics, Techniques, Sub-techniques).
Distinguishes between Explicit Report Facts and AI/Behavioral Inferences.
"""

import re
from typing import List, Dict, Any, Optional

# Verified MITRE ATT&CK Enterprise Matrix Knowledge Base
MITRE_TECHNIQUES_DB: Dict[str, Dict[str, Any]] = {
    "T1566": {
        "id": "T1566",
        "name": "Phishing",
        "tactic": "Initial Access",
        "tactic_id": "TA0001",
        "description": "Adversaries may send phishing messages to gain access to victim systems via malicious attachments or links.",
        "url": "https://attack.mitre.org/techniques/T1566/",
        "keywords": ["phishing", "spearphishing", "malicious attachment", "fake invoice", "lure document", "macro-enabled", "credential harvesting link", "suspicious email", "weaponized document"]
    },
    "T1566.001": {
        "id": "T1566.001",
        "name": "Spearphishing Attachment",
        "tactic": "Initial Access",
        "tactic_id": "TA0001",
        "description": "Adversaries send malicious attachments via spearphishing to execute code.",
        "url": "https://attack.mitre.org/techniques/T1566/001/",
        "keywords": ["spearphishing attachment", "malicious pdf", "malicious docx", "weaponized xlsx", "iso container", "zip attachment"]
    },
    "T1566.002": {
        "id": "T1566.002",
        "name": "Spearphishing Link",
        "tactic": "Initial Access",
        "tactic_id": "TA0001",
        "description": "Adversaries send links to malicious sites in spearphishing emails to deliver exploits or steal credentials.",
        "url": "https://attack.mitre.org/techniques/T1566/002/",
        "keywords": ["phishing link", "credential harvesting portal", "fake login page", "spoofed domain", "lookalike link"]
    },
    "T1190": {
        "id": "T1190",
        "name": "Exploit Public-Facing Application",
        "tactic": "Initial Access",
        "tactic_id": "TA0001",
        "description": "Adversaries exploit weaknesses in Internet-facing programs to gain initial network access.",
        "url": "https://attack.mitre.org/techniques/T1190/",
        "keywords": ["cve-", "remote code execution", "rce", "unauthenticated", "buffer overflow", "sql injection", "perimeter exploit", "public-facing", "vpn vulnerability"]
    },
    "T1059": {
        "id": "T1059",
        "name": "Command and Scripting Interpreter",
        "tactic": "Execution",
        "tactic_id": "TA0002",
        "description": "Adversaries abuse command and script interpreters to execute arbitrary commands, scripts, or binaries.",
        "url": "https://attack.mitre.org/techniques/T1059/",
        "keywords": ["powershell", "cmd.exe", "bash", "python", "vbs", "wscript", "cscript", "mshta", "command execution"]
    },
    "T1059.001": {
        "id": "T1059.001",
        "name": "PowerShell",
        "tactic": "Execution",
        "tactic_id": "TA0002",
        "description": "Adversaries execute commands using the PowerShell interactive command-line interface.",
        "url": "https://attack.mitre.org/techniques/T1059/001/",
        "keywords": ["powershell.exe", "invoke-expression", "iex", "encodedcommand", "-enc", "bypass -noprofile", "invoke-mimikatz", "powershell script"]
    },
    "T1204": {
        "id": "T1204",
        "name": "User Execution",
        "tactic": "Execution",
        "tactic_id": "TA0002",
        "description": "An adversary may rely on a user opening a malicious file or clicking a link.",
        "url": "https://attack.mitre.org/techniques/T1204/",
        "keywords": ["victim clicked", "user execution", "user opened", "double-clicked", "enabled macros"]
    },
    "T1053": {
        "id": "T1053",
        "name": "Scheduled Task/Job",
        "tactic": "Persistence",
        "tactic_id": "TA0003",
        "description": "Adversaries abuse task scheduling functionality to facilitate initial or recurring execution of malicious code.",
        "url": "https://attack.mitre.org/techniques/T1053/",
        "keywords": ["schtasks", "cron", "scheduled task", "at job", "task scheduler"]
    },
    "T1078": {
        "id": "T1078",
        "name": "Valid Accounts",
        "tactic": "Defense Evasion",
        "tactic_id": "TA0005",
        "description": "Adversaries obtain and abuse existing user credentials to gain access and evade detection.",
        "url": "https://attack.mitre.org/techniques/T1078/",
        "keywords": ["compromised credentials", "valid account", "stolen password", "default credentials", "vpn login with stolen"]
    },
    "T1027": {
        "id": "T1027",
        "name": "Obfuscated Files or Information",
        "tactic": "Defense Evasion",
        "tactic_id": "TA0005",
        "description": "Adversaries employ obfuscation to disguise payloads and evade signature-based detection.",
        "url": "https://attack.mitre.org/techniques/T1027/",
        "keywords": ["obfuscated", "base64", "xor encrypted", "packed with upx", "steganography", "string encryption"]
    },
    "T1110": {
        "id": "T1110",
        "name": "Brute Force",
        "tactic": "Credential Access",
        "tactic_id": "TA0006",
        "description": "Adversaries iterate through password attempts to gain access to accounts.",
        "url": "https://attack.mitre.org/techniques/T1110/",
        "keywords": ["brute-force", "password spray", "credential stuffing", "dictionary attack", "repeated login failures"]
    },
    "T1003": {
        "id": "T1003",
        "name": "OS Credential Dumping",
        "tactic": "Credential Access",
        "tactic_id": "TA0006",
        "description": "Adversaries dump credentials to obtain account logins and password hashes from operating systems.",
        "url": "https://attack.mitre.org/techniques/T1003/",
        "keywords": ["mimikatz", "lsass", "dumping credentials", "sam hive", "procdump lsass", "ntds.dit", "sekurlsa"]
    },
    "T1056": {
        "id": "T1056",
        "name": "Input Capture",
        "tactic": "Collection",
        "tactic_id": "TA0009",
        "description": "Adversaries log keystrokes or hook APIs to harvest user credentials and sensitive inputs.",
        "url": "https://attack.mitre.org/techniques/T1056/",
        "keywords": ["keylogger", "keystroke logging", "form grabbing", "clipboard monitor", "input capture"]
    },
    "T1071": {
        "id": "T1071",
        "name": "Application Layer Protocol",
        "tactic": "Command and Control",
        "tactic_id": "TA0011",
        "description": "Adversaries communicate using OSI application layer protocols to blend in with normal traffic.",
        "url": "https://attack.mitre.org/techniques/T1071/",
        "keywords": ["c2 beacon", "http beaconing", "https traffic", "dns tunneling", "custom user-agent", "heartbeat"]
    },
    "T1105": {
        "id": "T1105",
        "name": "Ingress Tool Transfer",
        "tactic": "Command and Control",
        "tactic_id": "TA0011",
        "description": "Adversaries transfer tools or other files from an external system into a compromised network.",
        "url": "https://attack.mitre.org/techniques/T1105/",
        "keywords": ["curl -o", "certutil -urlcache", "wget", "bitsadmin", "download payload", "stager dropped", "secondary payload"]
    },
    "T1567": {
        "id": "T1567",
        "name": "Exfiltration Over Web Service",
        "tactic": "Exfiltration",
        "tactic_id": "TA0010",
        "description": "Adversaries exfiltrate data to legitimate cloud storage or web services.",
        "url": "https://attack.mitre.org/techniques/T1567/",
        "keywords": ["mega.nz", "dropbox exfiltration", "discord webhook", "telegram bot exfiltration", "pastebin exfiltration", "onedrive upload"]
    },
    "T1041": {
        "id": "T1041",
        "name": "Exfiltration Over C2 Channel",
        "tactic": "Exfiltration",
        "tactic_id": "TA0010",
        "description": "Adversaries steal sensitive data directly through existing command and control channels.",
        "url": "https://attack.mitre.org/techniques/T1041/",
        "keywords": ["exfiltration over c2", "exfiltrated sensitive", "stolen data sent to c2", "archive sent to listening"]
    },
    "T1486": {
        "id": "T1486",
        "name": "Data Encrypted for Impact",
        "tactic": "Impact",
        "tactic_id": "TA0040",
        "description": "Adversaries encrypt data on target systems to interrupt system availability and demand ransom.",
        "url": "https://attack.mitre.org/techniques/T1486/",
        "keywords": ["ransomware", "encrypting files", "ransom note", "ransom demand", "volume shadow copies deleted", "vssadmin delete shadows"]
    }
}

# Regex to detect explicit MITRE Technique IDs in text (e.g., T1566, T1059.001)
TECHNIQUE_ID_REGEX = re.compile(r'\bT1\d{3}(?:\.\d{3})?\b', re.IGNORECASE)

def extract_mitre_mappings(text: str, page_number: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Extracts MITRE ATT&CK techniques from threat report text:
    1. Identifies explicit technique citations (e.g. 'T1566', 'T1059').
    2. Identifies behavioral keywords and matches them to official techniques.
    3. Categorizes each match as 'Explicit Report Fact' vs 'AI Behavioral Inference'.
    4. Attaches evidence snippet and calculated confidence.
    """
    if not text:
        return []

    text_lower = text.lower()
    mappings: List[Dict[str, Any]] = []
    seen_technique_ids = set()

    # Step 1: Explicit Technique IDs mentioned directly in text
    explicit_matches = TECHNIQUE_ID_REGEX.findall(text)
    for tid in explicit_matches:
        tid_norm = tid.upper()
        if tid_norm in MITRE_TECHNIQUES_DB and tid_norm not in seen_technique_ids:
            seen_technique_ids.add(tid_norm)
            tech = MITRE_TECHNIQUES_DB[tid_norm]
            
            # Find snippet
            idx = text.find(tid)
            start = max(0, idx - 100)
            end = min(len(text), idx + len(tid) + 100)
            snippet = text[start:end].replace('\n', ' ').strip()

            mappings.append({
                "id": tech["id"],
                "name": tech["name"],
                "tactic": tech["tactic"],
                "tactic_id": tech["tactic_id"],
                "description": tech["description"],
                "url": tech["url"],
                "type": "Explicit Report Fact",
                "evidence": f"...{snippet}..." if (start > 0 or end < len(text)) else snippet,
                "page": page_number,
                "confidence": 98,
                "confidence_explanation": f"Technique ID {tech['id']} is explicitly referenced in report text."
            })

    # Step 2: Behavioral heuristic matching against known threat activities
    for tid, tech in MITRE_TECHNIQUES_DB.items():
        if tid in seen_technique_ids:
            continue
        
        # Check if technique name or keywords occur in text
        matched_keywords = []
        name_lower = tech["name"].lower()
        if name_lower in text_lower:
            matched_keywords.append(tech["name"])
            
        for kw in tech["keywords"]:
            if kw.lower() in text_lower:
                matched_keywords.append(kw)
                
        if matched_keywords:
            seen_technique_ids.add(tid)
            # Find evidence snippet around the strongest matched keyword
            best_kw = matched_keywords[0]
            idx = text_lower.find(best_kw.lower())
            start = max(0, idx - 110)
            end = min(len(text), idx + len(best_kw) + 110)
            snippet = text[start:end].replace('\n', ' ').strip()
            
            confidence = 85 if len(matched_keywords) >= 2 else 72
            is_explicit = name_lower in text_lower

            mappings.append({
                "id": tech["id"],
                "name": tech["name"],
                "tactic": tech["tactic"],
                "tactic_id": tech["tactic_id"],
                "description": tech["description"],
                "url": tech["url"],
                "type": "Explicit Report Fact" if is_explicit else "AI Behavioral Inference",
                "matched_behaviors": matched_keywords[:3],
                "evidence": f"...{snippet}..." if (start > 0 or end < len(text)) else snippet,
                "page": page_number,
                "confidence": confidence,
                "confidence_explanation": f"Matched behavioral keywords: {', '.join(matched_keywords[:3])}."
            })

    # Sort so highest confidence explicit facts appear first
    mappings.sort(key=lambda x: (x["type"] == "Explicit Report Fact", x["confidence"]), reverse=True)
    return mappings

