"""
Sample Cybersecurity Threat Intelligence data and realistic advisories for demo & testing.
"""

SAMPLE_REPORTS = [
    {
        "id": "cisa-aa23-158a",
        "title": "CISA Advisory AA23-158A: CL0P Ransomware Gang Exploiting MOVEit Transfer (CVE-2023-34362)",
        "source": "CISA / FBI Cybersecurity Advisory",
        "date": "2023-06-07",
        "severity": "CRITICAL",
        "tlp": "AMBER",
        "summary": "The CL0P Ransomware Gang (also known as TA505 / Lace Tempest) is actively exploiting a zero-day SQL injection vulnerability (CVE-2023-34362) in Progress Software's MOVEit Transfer web application to steal sensitive data and extort organizations across Healthcare, Finance, and Government sectors.",
        "content": """CISA and the FBI are releasing this joint Cybersecurity Advisory (CSA) to disseminate known CL0P ransomware IOCs and TTPs identified through FBI investigations as recently as June 2023.

According to open-source reporting, beginning on May 27, 2023, the CL0P Ransomware Gang (TA505 / FIN11) began exploiting a previously unknown SQL injection vulnerability (CVE-2023-34362) in Progress Software's MOVEit Transfer MFT web application.

TECHNICAL DETAILS:
The threat actor executed SQL injection to elevate privileges and gain unauthorized access to the underlying MySQL, Microsoft SQL Server, or Azure SQL database. The actors deployed a customized webshell dubbed 'LEMURLOOT' (human2.aspx) into the MOVEit Transfer root directory.

LEMURLOOT webshell capabilities include:
1. Stealing Azure system settings and blob storage credentials.
2. Exfiltrating user tables, active sessions, and sensitive files.
3. Deleting arbitrary user records to evade detection.

MITRE ATT&CK TECHNIQUES OBSERVED:
- T1190: Exploit Public-Facing Application (SQL injection into MOVEit)
- T1505.003: Server Software Component: Web Shell (LEMURLOOT human2.aspx)
- T1059.001: Command and Scripting Interpreter: PowerShell
- T1078: Valid Accounts (Abuse of Azure and local SQL credentials)
- T1041: Exfiltration Over C2 Channel
- T1486: Data Encrypted for Impact (Double extortion / Data exfiltration)

INDICATORS OF COMPROMISE (IOCs):
Malicious IPs:
138.197.152.201
148.251.209.76
5.252.118.93
209.97.137.33

Observed File Hashes (LEMURLOOT Webshell):
SHA256: 3c0767222485c2921509a2542a033fce81df3e8a4a15a818c34fbc8cff76fe1a
SHA256: 48367d94cc8e4d3e69e7cd881e5828458e65842c943ab07e841dd51e06fe330e
MD5: e8012d97769cb3918a0026e4922ff11a

C2 Domains:
azure-blob-sync-cdn[.]com
transfer-service-check[.]net
moveit-storage-auth[.]org

TARGET SECTORS:
Healthcare, Higher Education, Financial Services, Critical Manufacturing, and Government Agencies globally.
"""
    },
    {
        "id": "cisa-volt-typhoon",
        "title": "CISA / NSA Advisory: Volt Typhoon Pre-Positioning in US Critical Infrastructure",
        "source": "CISA / NSA / FBI Joint Advisory",
        "date": "2024-02-07",
        "severity": "CRITICAL",
        "tlp": "CLEAR",
        "summary": "State-sponsored cyber group Volt Typhoon (Bronze Silhouette / Vanguard Panda) compromised IT environments of multiple critical infrastructure organizations, primarily in Communications, Energy, Transportation, and Water/Wastewater systems, utilizing living-off-the-land (LotL) techniques to maintain long-term persistence.",
        "content": """The security agencies assess with high confidence that Volt Typhoon actors are seeking to pre-position themselves on IT networks for disruptive or destructive cyberattacks in the event of geopolitical crisis or military conflict.

TECHNICAL OVERVIEW:
Volt Typhoon targets public-facing network appliances (such as Fortinet FortiGuard, Cisco routers, Ivanti Connect Secure, and NETGEAR routers) via CVE-2023-27997 and zero-day vulnerabilities. Once inside, actors emphasize 'Living off the Land' (LotL) commands:
1. Native Windows binaries: wmic.exe, ntdsutil.exe, netsh.exe, certutil.exe, and PowerShell.
2. Credential dumping from memory (LSASS) and Active Directory NTDS.dit database.
3. Proxying C2 communications through compromised SOHO routers (the KV-botnet) to mask origin IP addresses.

MITRE ATT&CK TECHNIQUES:
- T1190: Exploit Public-Facing Application (Edge Gateway Appliances)
- T1003.003: OS Credential Dumping: NTDS
- T1059.001: Command and Scripting Interpreter: PowerShell
- T1070: Indicator Removal: Clearing Windows Event Logs via wevtutil
- T1090.002: Proxy: External Proxy (SOHO KV-botnet mesh)
- T1049: System Network Connections Discovery (netstat, netsh)

INDICATORS OF COMPROMISE (IOCs):
Malicious Proxy IPs:
45.154.255.88
185.220.101.45
194.26.29.112
91.240.118.230

Targeted Appliances:
Fortinet FortiOS SSL-VPN (CVE-2023-27997)
Ivanti Connect Secure (CVE-2023-46805, CVE-2024-21887)

TARGET SECTORS:
Energy, Water & Wastewater, Transportation Systems, Communications, Ports and Maritime Operations.
"""
    },
    {
        "id": "alphv-blackcat-healthcare",
        "title": "FBI Flash Alert: ALPHV / BlackCat Ransomware Infiltrates Healthcare Ecosystem",
        "source": "FBI Cyber Division / HHS HC3",
        "date": "2024-03-01",
        "severity": "CRITICAL",
        "tlp": "WHITE",
        "summary": "ALPHV/BlackCat ransomware-as-a-service (RaaS) affiliates deployed sophisticated Rust-based ransomware against critical healthcare payment gateways, causing widespread pharmacy and hospital claim processing outages.",
        "content": """The FBI, CISA, and the Department of Health and Human Services (HHS) are warning healthcare organizations of ongoing targeted intrusions by ALPHV BlackCat affiliates.

ATTACK VECTOR:
Initial access was acquired through compromised credentials (stolen via infostealer malware like RedLine and Lumma) lacking multi-factor authentication (MFA) on Citrix and Remote Desktop Protocol (RDP) gateways. 

LATERAL MOVEMENT & EXECUTION:
Affiliates used Cobalt Strike beacons, PsExec, and Impacket to move laterally. They utilized custom Rust-based payloads configured to stop antivirus services, terminate SQL and healthcare database processes, and wipe shadow copies using vssadmin.

MITRE ATT&CK TECHNIQUES:
- T1078.002: Valid Accounts: Domain Accounts
- T1133: External Remote Services (Citrix / RDP Gateway without MFA)
- T1021.002: Remote Services: SMB/Windows Admin Shares (PsExec)
- T1490: Inhibit System Recovery (vssadmin delete shadows /all /quiet)
- T1486: Data Encrypted for Impact
- T1562.001: Impair Defenses: Disable or Modify Tools

INDICATORS OF COMPROMISE (IOCs):
Command and Control (C2) IPs:
193.106.191.162
89.208.103.24
194.5.249.46

File Hashes:
SHA256: 7b83f06c11d2e2b963cfb6d76bb939c367cb88a914ec73f848de4352e4209ce2
SHA256: f191dd3e5272a2db9ffef57774136fc19d45a9a14352f205c040d7c79e612185

TARGET SECTORS:
Healthcare, Pharmaceuticals, Health Insurance, Managed IT Providers.
"""
    }
]

MITRE_ENTERPRISE_TACTICS = [
    {
        "id": "TA0043",
        "name": "Reconnaissance",
        "description": "Gathering information to plan future adversary operations.",
        "techniques": ["T1595 - Active Scanning", "T1592 - Gather Victim Host Info", "T1589 - Gather Victim Identity Info"]
    },
    {
        "id": "TA0042",
        "name": "Resource Development",
        "description": "Establishing resources adversaries need to support operations.",
        "techniques": ["T1583 - Acquire Infrastructure", "T1587 - Develop Capabilities", "T1588 - Obtain Capabilities"]
    },
    {
        "id": "TA0001",
        "name": "Initial Access",
        "description": "Techniques that use various entry vectors to gain a foothold.",
        "techniques": ["T1190 - Exploit Public-Facing Application", "T1566 - Phishing", "T1133 - External Remote Services", "T1078 - Valid Accounts"]
    },
    {
        "id": "TA0002",
        "name": "Execution",
        "description": "Techniques that result in adversary-controlled code running.",
        "techniques": ["T1059.001 - PowerShell", "T1059.003 - Windows Command Shell", "T1204 - User Execution", "T1569 - System Services"]
    },
    {
        "id": "TA0003",
        "name": "Persistence",
        "description": "Maintaining a presence across restarts or credential changes.",
        "techniques": ["T1505.003 - Web Shell", "T1543 - Create or Modify System Process", "T1136 - Create Account", "T1053 - Scheduled Task/Job"]
    },
    {
        "id": "TA0004",
        "name": "Privilege Escalation",
        "description": "Gaining higher-level permissions on a system or network.",
        "techniques": ["T1068 - Exploitation for Privilege Escalation", "T1548 - Abuse Elevation Control Mechanism", "T1078 - Valid Accounts"]
    },
    {
        "id": "TA0005",
        "name": "Defense Evasion",
        "description": "Techniques adversaries use to avoid detection throughout their compromise.",
        "techniques": ["T1070 - Indicator Removal on Host", "T1562.001 - Disable or Modify Tools", "T1027 - Obfuscated Files or Information"]
    },
    {
        "id": "TA0006",
        "name": "Credential Access",
        "description": "Stealing credentials like account names and passwords.",
        "techniques": ["T1003.003 - OS Credential Dumping: NTDS", "T1003.001 - LSASS Memory", "T1110 - Brute Force", "T1555 - Credentials from Password Stores"]
    },
    {
        "id": "TA0007",
        "name": "Discovery",
        "description": "Observing the system and network environment.",
        "techniques": ["T1049 - System Network Connections Discovery", "T1082 - System Information Discovery", "T1087 - Account Discovery"]
    },
    {
        "id": "TA0008",
        "name": "Lateral Movement",
        "description": "Moving through an environment to reach objectives.",
        "techniques": ["T1021.002 - SMB/Windows Admin Shares", "T1021.001 - Remote Desktop Protocol", "T1570 - Lateral Tool Transfer"]
    },
    {
        "id": "TA0009",
        "name": "Collection",
        "description": "Gathering data of interest to the adversary's goal.",
        "techniques": ["T1560 - Archive Collected Data", "T1119 - Automated Collection", "T1005 - Data from Local System"]
    },
    {
        "id": "TA0011",
        "name": "Command and Control",
        "description": "Communicating with systems under adversary control.",
        "techniques": ["T1071.001 - Web Protocols (HTTP/HTTPS)", "T1090.002 - External Proxy", "T1573 - Encrypted Channel"]
    },
    {
        "id": "TA0010",
        "name": "Exfiltration",
        "description": "Stealing data from your network.",
        "techniques": ["T1041 - Exfiltration Over C2 Channel", "T1567 - Exfiltration Over Web Service", "T1048 - Exfiltration Over Alternative Protocol"]
    },
    {
        "id": "TA0040",
        "name": "Impact",
        "description": "Disrupting availability or integrity of systems and data.",
        "techniques": ["T1486 - Data Encrypted for Impact", "T1490 - Inhibit System Recovery", "T1489 - Service Stop"]
    }
]
