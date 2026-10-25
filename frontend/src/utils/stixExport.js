/**
 * STIX 2.1 Exporter
 * Converts analyzed threat data into an OASIS STIX 2.1 JSON bundle.
 */
export function generateStixBundle(threatData) {
  if (!threatData) return null;

  const now = new Date().toISOString();
  const bundleId = `bundle--${crypto.randomUUID()}`;
  const objects = [];

  // Threat Actor
  const actorId = `threat-actor--${crypto.randomUUID()}`;
  if (threatData.threat_actor) {
    objects.push({
      type: 'threat-actor',
      spec_version: '2.1',
      id: actorId,
      created: now,
      modified: now,
      name: threatData.threat_actor.name || 'Unknown Adversary',
      description: threatData.threat_actor.description || '',
      threat_actor_types: ['cyber-espionage', 'ransomware'],
      aliases: threatData.threat_actor.aliases || [],
      goals: threatData.target_sectors || []
    });
  }

  // MITRE ATT&CK Attack Patterns
  const techniqueMap = {};
  (threatData.mitre_techniques || []).forEach(t => {
    const apId = `attack-pattern--${crypto.randomUUID()}`;
    techniqueMap[t.id] = apId;
    objects.push({
      type: 'attack-pattern',
      spec_version: '2.1',
      id: apId,
      created: now,
      modified: now,
      name: t.name,
      description: t.description || '',
      external_references: [
        {
          source_name: 'mitre-attack',
          external_id: t.id,
          url: `https://attack.mitre.org/techniques/${t.id.replace('.', '/')}`
        }
      ],
      kill_chain_phases: [
        {
          kill_chain_name: 'mitre-attack',
          phase_name: t.tactic ? t.tactic.toLowerCase().replace(/\s+/g, '-') : 'unknown'
        }
      ]
    });

    // Relationship: Threat Actor uses Attack Pattern
    if (threatData.threat_actor) {
      objects.push({
        type: 'relationship',
        spec_version: '2.1',
        id: `relationship--${crypto.randomUUID()}`,
        created: now,
        modified: now,
        relationship_type: 'uses',
        source_ref: actorId,
        target_ref: apId
      });
    }
  });

  // Indicators (IoCs)
  (threatData.iocs || []).forEach(ioc => {
    const indId = `indicator--${crypto.randomUUID()}`;
    let pattern = '';
    if (ioc.type === 'ipv4') pattern = `[ipv4-addr:value = '${ioc.value}']`;
    else if (ioc.type === 'domain') pattern = `[domain-name:value = '${ioc.value}']`;
    else if (ioc.type === 'sha256') pattern = `[file:hashes.'SHA-256' = '${ioc.value}']`;
    else if (ioc.type === 'md5') pattern = `[file:hashes.MD5 = '${ioc.value}']`;
    else pattern = `[custom:value = '${ioc.value}']`;

    objects.push({
      type: 'indicator',
      spec_version: '2.1',
      id: indId,
      created: now,
      modified: now,
      name: `${ioc.type.toUpperCase()} Indicator: ${ioc.value}`,
      description: ioc.context || '',
      pattern: pattern,
      pattern_type: 'stix',
      valid_from: now
    });

    // Relationship: Indicator indicates Threat Actor
    if (threatData.threat_actor) {
      objects.push({
        type: 'relationship',
        spec_version: '2.1',
        id: `relationship--${crypto.randomUUID()}`,
        created: now,
        modified: now,
        relationship_type: 'indicates',
        source_ref: indId,
        target_ref: actorId
      });
    }
  });

  // Vulnerabilities (CVEs)
  (threatData.cves || []).forEach(cve => {
    const vulnId = `vulnerability--${crypto.randomUUID()}`;
    objects.push({
      type: 'vulnerability',
      spec_version: '2.1',
      id: vulnId,
      created: now,
      modified: now,
      name: cve.id,
      description: cve.description || '',
      external_references: [
        {
          source_name: 'cve',
          external_id: cve.id,
          url: `https://nvd.nist.gov/vuln/detail/${cve.id}`
        }
      ]
    });
  });

  return {
    type: 'bundle',
    id: bundleId,
    spec_version: '2.1',
    objects: objects
  };
}

export function downloadStixBundle(threatData) {
  const bundle = generateStixBundle(threatData);
  if (!bundle) return;
  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (threatData?.threat_actor?.name || 'threat_intel').toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.href = url;
  a.download = `stix21_${safeName}_bundle.json`;
  a.click();
  URL.revokeObjectURL(url);
}
