"""
Threat Graph Service
Constructs interactive node-edge graph structures connecting:
- Threat Actors
- Malware Families
- Campaigns
- IP addresses
- Domains
- URLs
- File Hashes
- CVEs
- MITRE ATT&CK Techniques

Nodes and edges include detailed metadata (evidence snippets, relationships, sources, and confidence ratings)
for interactive analyst inspection.
"""

from typing import Dict, Any, List, Optional

def build_graph_for_investigation(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Builds a full Cytoscape/D3/Vis compatible knowledge graph from an investigation record.
    Returns:
    {
        "nodes": [ { id, label, type, severity, confidence, details, evidence } ],
        "edges": [ { id, source, target, relationship, label, confidence } ],
        "summary": { total_nodes, total_edges, primary_entity }
    }
    """
    nodes = []
    edges = []
    seen_node_ids = set()
    seen_edge_ids = set()

    def add_node(nid: str, label: str, ntype: str, severity: str = "medium", confidence: int = 85, details: str = "", evidence: str = ""):
        if nid not in seen_node_ids:
            seen_node_ids.add(nid)
            nodes.append({
                "id": nid,
                "label": label,
                "type": ntype,
                "severity": severity,
                "confidence": confidence,
                "details": details,
                "evidence": evidence
            })

    def add_edge(source: str, target: str, rel: str, label: str = "", confidence: int = 85):
        eid = f"{source}-{rel}-{target}"
        if eid not in seen_edge_ids and source in seen_node_ids and target in seen_node_ids:
            seen_edge_ids.add(eid)
            edges.append({
                "id": eid,
                "source": source,
                "target": target,
                "relationship": rel,
                "label": label or rel.replace("_", " "),
                "confidence": confidence
            })

    ind = record.get("indicator", "Indicator")
    itype = record.get("type", "unknown").lower()
    details = record.get("details", {})
    risk_score = record.get("risk_score", 50)
    severity = "critical" if risk_score >= 80 else "high" if risk_score >= 50 else "medium" if risk_score >= 25 else "safe"

    # Root Node
    root_id = f"node-{itype}-{ind}"
    add_node(
        nid=root_id,
        label=ind,
        ntype=itype,
        severity=severity,
        confidence=details.get("confidence", 90),
        details=f"Primary Investigation Target: {ind} ({itype.upper()})",
        evidence=f"Analyzed risk score: {risk_score}/100. Classification: {record.get('classification', 'Observed')}"
    )

    # 1. IP Target Expansion
    if itype in ("ip", "ip address"):
        geo = details.get("geolocation", {})
        country = geo.get("country")
        if country and country != "Unknown":
            cid = f"node-geo-{country}"
            add_node(cid, country, "location", "safe", 95, f"Geographic hosting location: {geo.get('city')}, {country}")
            add_edge(root_id, cid, "hosted_in", "Hosted in")

        asn = geo.get("as_org")
        if asn and asn != "N/A":
            aid = f"node-asn-{asn[:16]}"
            add_node(aid, asn, "asn", "medium", 90, f"Autonomous System: {geo.get('as_number')} - {asn}")
            add_edge(root_id, aid, "announced_by", "Routed by")

        rev = details.get("reverse_dns")
        if rev and rev != "No PTR record found":
            rid = f"node-domain-{rev}"
            add_node(rid, rev, "domain", "medium", 90, f"Reverse DNS hostname: {rev}")
            add_edge(root_id, rid, "reverse_resolves_to", "PTR Host")

        for p in details.get("open_ports", []):
            pid = f"node-port-{p['port']}"
            add_node(pid, f"Port {p['port']} ({p['service']})", "port", "high" if p['port'] in (21, 23) else "medium", 90, f"Exposed network listener: TCP {p['port']}")
            add_edge(root_id, pid, "exposes_port", "Open Port")

    # 2. Domain Target Expansion
    elif itype == "domain":
        dns_recs = details.get("dns_records", {})
        for ip in dns_recs.get("A", [])[:4]:
            nid = f"node-ip-{ip}"
            add_node(nid, ip, "ip", "high", 95, f"Resolved IPv4 infrastructure: {ip}")
            add_edge(root_id, nid, "resolves_to_ip", "Resolves to IP")

        for mx in dns_recs.get("MX", [])[:2]:
            mid = f"node-mx-{mx['host']}"
            add_node(mid, mx["host"], "mail_server", "safe", 90, f"Mail Exchange Server (Pref: {mx.get('preference')})")
            add_edge(root_id, mid, "mail_exchange", "MX Server")

        for ns in dns_recs.get("NS", [])[:2]:
            nsid = f"node-ns-{ns}"
            add_node(nsid, ns, "nameserver", "safe", 90, f"Authoritative Nameserver: {ns}")
            add_edge(root_id, nsid, "nameserver", "Authoritative NS")

        ssl_info = details.get("ssl", {})
        if ssl_info and ssl_info.get("has_ssl"):
            issuer = ssl_info.get("issuer_org") or ssl_info.get("issuer_cn")
            if issuer:
                sid = f"node-ssl-{issuer[:16]}"
                add_node(sid, f"CA: {issuer}", "certificate", "safe" if not ssl_info.get("is_expired") else "critical", 95, f"Issued by {issuer}. Expires in {ssl_info.get('days_remaining')} days.")
                add_edge(root_id, sid, "certified_by", "SSL Certificate")

    # 3. URL Target Expansion
    elif itype == "url":
        hostname = details.get("hostname")
        if hostname:
            hid = f"node-domain-{hostname}"
            add_node(hid, hostname, "domain", "high" if risk_score > 60 else "medium", 95, f"Target URL FQDN hostname: {hostname}")
            add_edge(root_id, hid, "hosted_on_domain", "Domain")

            for ip in details.get("resolved_ips", [])[:2]:
                ipid = f"node-ip-{ip}"
                add_node(ipid, ip, "ip", "high" if risk_score > 60 else "medium", 90, f"Host IP address: {ip}")
                add_edge(hid, ipid, "resolves_to", "IP Address")

        chain = details.get("redirect_chain", [])
        if len(chain) > 1:
            prev_id = root_id
            for hop in chain[1:]:
                hop_url = hop.get("url")
                if hop_url and hop_url != ind:
                    hop_id = f"node-url-{hop['hop']}"
                    add_node(hop_id, f"Hop {hop['hop']}: {hop.get('status_code')}", "redirect", "medium", 90, f"Redirect step to: {hop_url}")
                    add_edge(prev_id, hop_id, "redirects_to", f"HTTP {hop.get('status_code')}")
                    prev_id = hop_id

    # 4. PDF Research Document Expansion
    elif itype == "pdf":
        for actor in details.get("threat_actors", []):
            aid = f"node-actor-{actor['name']}"
            add_node(aid, actor["name"], "actor", "critical", actor.get("confidence", 95), f"Origin: {actor.get('origin', 'Unknown')}. Targets: {', '.join(actor.get('target_sectors', []))}", actor.get("evidence", ""))
            add_edge(root_id, aid, "attributed_to_actor", "Attributed Actor")

            for malware in details.get("malware_families", []):
                mid = f"node-malware-{malware['name']}"
                add_node(mid, malware["name"], "malware", "high", malware.get("confidence", 90), f"Category: {malware.get('category')}. {malware.get('description')}", malware.get("evidence", ""))
                add_edge(aid, mid, "deploys_malware", "Deploys Tool")

        for tech in details.get("mitre_mappings", [])[:6]:
            tid = f"node-mitre-{tech['id']}"
            add_node(tid, f"{tech['id']} ({tech['name']})", "technique", "high", tech.get("confidence", 85), f"Tactic: {tech.get('tactic')}. {tech.get('description')}", tech.get("evidence", ""))
            add_edge(root_id, tid, "exhibits_technique", "MITRE Technique")

        iocs = details.get("iocs", {})
        for ip in iocs.get("ipv4", [])[:3]:
            ipid = f"node-ip-{ip['value']}"
            add_node(ipid, ip["value"], "ip", "high", ip.get("confidence", 90), f"Observed infrastructure from page {ip.get('page')}", ip.get("evidence", ""))
            add_edge(root_id, ipid, "observes_ip", "IOC IP")

        for dom in iocs.get("domains", [])[:3]:
            did = f"node-domain-{dom['value']}"
            add_node(did, dom["value"], "domain", "high", dom.get("confidence", 90), f"Observed domain from page {dom.get('page')}", dom.get("evidence", ""))
            add_edge(root_id, did, "observes_domain", "IOC Domain")

        for cve in iocs.get("cves", [])[:2]:
            cveid = f"node-cve-{cve['value']}"
            add_node(cveid, cve["value"], "cve", "critical", 98, f"Exploited Vulnerability: {cve['value']}", cve.get("evidence", ""))
            add_edge(root_id, cveid, "exploits_cve", "Exploits Vulnerability")

    return {
        "nodes": nodes,
        "edges": edges,
        "summary": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "primary_entity": ind,
            "type": itype
        }
    }
