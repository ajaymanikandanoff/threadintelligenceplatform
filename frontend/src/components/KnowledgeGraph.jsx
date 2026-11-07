import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Maximize2,
  Minimize2,
  Search,
  MessageSquare,
  Copy,
  Check,
  Layers,
  Activity,
  Workflow,
  Share2,
  Cpu,
  Target,
  Shield,
  Radio,
  ExternalLink
} from 'lucide-react';

const NODE_TYPES = {
  actor:       { label: 'Attacker',       color: '#f43f5e', bg: 'rgba(244,63,94,0.18)', ring: '#f43f5e', defaultR: 24 },
  pdf:         { label: 'Dossier',        color: '#eab308', bg: 'rgba(234,179,8,0.18)',  ring: '#eab308', defaultR: 22 },
  malware:     { label: 'Malware/Tool',   color: '#818cf8', bg: 'rgba(129,140,248,0.18)', ring: '#818cf8', defaultR: 20 },
  cve:         { label: 'Vulnerability',  color: '#f97316', bg: 'rgba(249,115,22,0.18)', ring: '#f97316', defaultR: 18 },
  technique:   { label: 'MITRE TTP',      color: '#00e5ff', bg: 'rgba(0,229,255,0.18)',  ring: '#00e5ff', defaultR: 17 },
  ip:          { label: 'IP Address',     color: '#10b981', bg: 'rgba(16,185,129,0.18)', ring: '#10b981', defaultR: 16 },
  domain:      { label: 'Domain/URL',     color: '#38bdf8', bg: 'rgba(56,189,248,0.18)', ring: '#38bdf8', defaultR: 16 },
  nameserver:  { label: 'DNS Server',     color: '#14b8a6', bg: 'rgba(20,184,166,0.18)', ring: '#14b8a6', defaultR: 15 },
  mail_server: { label: 'Mail Server',    color: '#06b6d4', bg: 'rgba(6,182,212,0.18)',  ring: '#06b6d4', defaultR: 15 },
  asn:         { label: 'ASN Network',    color: '#a855f7', bg: 'rgba(168,85,247,0.18)', ring: '#a855f7', defaultR: 16 },
  port:        { label: 'Port/Service',   color: '#6366f1', bg: 'rgba(99,102,241,0.18)', ring: '#6366f1', defaultR: 14 },
  location:    { label: 'Target Geo',     color: '#ec4899', bg: 'rgba(236,72,153,0.18)', ring: '#ec4899', defaultR: 18 },
  target:      { label: 'Target Asset',   color: '#ec4899', bg: 'rgba(236,72,153,0.18)', ring: '#ec4899', defaultR: 18 },
  default:     { label: 'Entity',         color: '#94a3b8', bg: 'rgba(148,163,184,0.18)', ring: '#94a3b8', defaultR: 15 }
};

export default function KnowledgeGraph({ graphData, onAskCopilot, compact = false, height = null }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [layoutMode, setLayoutMode] = useState(compact ? 'radial' : 'pipeline'); // 'pipeline' | 'force' | 'radial'
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(null);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const svgRef = useRef(null);

  const getTypeMeta = (type) => NODE_TYPES[type] || NODE_TYPES.default;

  const fitView = useCallback((placedNodes, svgWidth, svgHeight) => {
    if (!placedNodes || placedNodes.length === 0) return;
    const padding = compact ? 20 : 50;
    const minX = Math.min(...placedNodes.map(n => n.x - (n.r || 20)));
    const maxX = Math.max(...placedNodes.map(n => n.x + (n.r || 20)));
    const minY = Math.min(...placedNodes.map(n => n.y - (n.r || 20)));
    const maxY = Math.max(...placedNodes.map(n => n.y + (n.r || 20)));

    const contentW = Math.max(maxX - minX, 100);
    const contentH = Math.max(maxY - minY, 100);

    const availW = Math.max(svgWidth - padding * 2, 100);
    const availH = Math.max(svgHeight - padding * 2, 100);

    const targetZoom = Math.min(1.2, Math.max(compact ? 0.6 : 0.45, Math.min(availW / contentW, availH / contentH)));
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const panX = (svgWidth / 2) - (midX * targetZoom);
    const panY = (svgHeight / 2) - (midY * targetZoom);

    setZoom(Number(targetZoom.toFixed(2)));
    setPan({ x: Math.round(panX), y: Math.round(panY) });
  }, [compact]);

  // ─── HIGH-PRECISION GRAPH LAYOUT ALGORITHMS ───
  const computeLayout = useCallback((rawNodes, rawEdges, mode = 'pipeline') => {
    if (!rawNodes || rawNodes.length === 0) return [];

    const isSingleEntity = !rawNodes.some(n => ['actor', 'pdf', 'malware', 'technique'].includes(n.type));

    if (compact || isSingleEntity || mode === 'radial') {
      const cx = compact ? 180 : 420;
      const cy = compact ? 120 : 260;

      let rootNode = rawNodes.find(n => ['pdf', 'domain', 'ip', 'url', 'actor'].includes(n.type)) || rawNodes[0];
      const satellites = rawNodes.filter(n => n.id !== rootNode.id);

      if (satellites.length === 0) {
        return [{ ...rootNode, x: cx, y: cy, r: getTypeMeta(rootNode.type).defaultR }];
      }

      const radius = compact
        ? Math.min(85, Math.max(55, 160 / Math.sqrt(satellites.length)))
        : Math.min(220, Math.max(120, 360 / Math.sqrt(satellites.length)));

      const placedRoot = {
        ...rootNode,
        x: cx,
        y: cy,
        r: (getTypeMeta(rootNode.type).defaultR || 18) * (compact ? 1.05 : 1.2)
      };

      const placedSatellites = satellites.map((n, idx) => {
        const angle = (idx / satellites.length) * 2 * Math.PI - Math.PI / 2;
        return {
          ...n,
          x: Math.round(cx + radius * Math.cos(angle)),
          y: Math.round(cy + radius * Math.sin(angle)),
          r: getTypeMeta(n.type).defaultR || 16
        };
      });

      return [placedRoot, ...placedSatellites];
    }

    // Helper map of node degree and connected parents
    const adjacency = {};
    rawNodes.forEach(n => { adjacency[n.id] = []; });
    rawEdges.forEach(e => {
      if (adjacency[e.source]) adjacency[e.source].push(e.target);
      if (adjacency[e.target]) adjacency[e.target].push(e.source);
    });

    let layoutNodes = [];

    if (mode === 'pipeline') {
      // ─── 1. KILL-CHAIN HIERARCHICAL PIPELINE LAYOUT ───
      // Strict semantic tier columns from left to right:
      // Col 0: Dossier / PDF
      // Col 1: Threat Actors
      // Col 2: Malware & C2
      // Col 3: CVEs & Vulnerabilities
      // Col 4: MITRE ATT&CK Techniques
      // Col 5: Network IOC Infrastructure (IP, Domain, Nameserver, ASN)
      // Col 6: Target Geographies / Assets
      const tiers = {
        0: [], // dossier / pdf
        1: [], // actor
        2: [], // malware
        3: [], // cve
        4: [], // technique
        5: [], // ip, domain, nameserver, mail_server, asn, port
        6: []  // target, location, other
      };

      rawNodes.forEach(n => {
        const t = n.type || 'default';
        if (t === 'pdf') tiers[0].push(n);
        else if (t === 'actor') tiers[1].push(n);
        else if (t === 'malware') tiers[2].push(n);
        else if (t === 'cve') tiers[3].push(n);
        else if (t === 'technique') tiers[4].push(n);
        else if (['ip', 'domain', 'nameserver', 'mail_server', 'asn', 'port'].includes(t)) tiers[5].push(n);
        else tiers[6].push(n);
      });

      const startX = 90;
      const colWidth = 195;
      const baseCenterY = 280;

      layoutNodes = rawNodes.map(n => {
        let colIdx = 6;
        const t = n.type || 'default';
        if (t === 'pdf') colIdx = 0;
        else if (t === 'actor') colIdx = 1;
        else if (t === 'malware') colIdx = 2;
        else if (t === 'cve') colIdx = 3;
        else if (t === 'technique') colIdx = 4;
        else if (['ip', 'domain', 'nameserver', 'mail_server', 'asn', 'port'].includes(t)) colIdx = 5;

        const colNodes = tiers[colIdx];
        const itemIdx = colNodes.findIndex(cn => cn.id === n.id);
        const count = colNodes.length;

        // Vertical spacing: adapt nicely to column size
        const spacing = Math.max(52, Math.min(84, 520 / Math.max(count, 1)));
        const totalHeight = (count - 1) * spacing;
        const startY = baseCenterY - (totalHeight / 2);

        const x = startX + colIdx * colWidth;
        const y = startY + (itemIdx * spacing);
        const meta = getTypeMeta(t);

        return {
          ...n,
          x,
          y,
          r: meta.defaultR
        };
      });

    } else if (mode === 'radial') {
      // ─── 2. RADIAL ORBITAL LAYOUT ───
      // Center: Threat Actors and Dossiers
      // Orbit 1 (r=160): Malware and Exploits
      // Orbit 2 (r=270): MITRE Techniques
      // Orbit 3 (r=390): Infrastructure IOCs
      const cx = 520, cy = 300;

      const orbits = {
        center: rawNodes.filter(n => n.type === 'actor' || n.type === 'pdf'),
        orbit1: rawNodes.filter(n => n.type === 'malware' || n.type === 'cve'),
        orbit2: rawNodes.filter(n => n.type === 'technique'),
        orbit3: rawNodes.filter(n => !['actor', 'pdf', 'malware', 'cve', 'technique'].includes(n.type))
      };

      const placeOrbitalRing = (ringNodes, radius) => {
        const count = ringNodes.length;
        return ringNodes.map((n, idx) => {
          if (radius === 0) {
            // If multiple center nodes, space them around center
            if (count === 1) return { ...n, x: cx, y: cy, r: getTypeMeta(n.type).defaultR };
            const angle = (idx / count) * 2 * Math.PI;
            return {
              ...n,
              x: cx + 45 * Math.cos(angle),
              y: cy + 45 * Math.sin(angle),
              r: getTypeMeta(n.type).defaultR
            };
          }
          const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
          return {
            ...n,
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle),
            r: getTypeMeta(n.type).defaultR
          };
        });
      };

      layoutNodes = [
        ...placeOrbitalRing(orbits.center, 0),
        ...placeOrbitalRing(orbits.orbit1, 160),
        ...placeOrbitalRing(orbits.orbit2, 275),
        ...placeOrbitalRing(orbits.orbit3, 395)
      ];

    } else {
      // ─── 3. FORCE-DIRECTED PHYSICS LAYOUT ───
      // Start with hierarchically partitioned seeds, then run 60 physics relaxation passes
      const baseNodes = computeLayout(rawNodes, rawEdges, 'pipeline');
      const nodeMap = {};
      baseNodes.forEach(n => { nodeMap[n.id] = { ...n }; });

      // Run 60 physics relaxation iterations
      const iterations = 60;
      const cx = 560, cy = 300;

      for (let iter = 0; iter < iterations; iter++) {
        const alpha = Math.max(0.1, 1 - iter / iterations);

        // Repulsion between every pair
        const nodeArr = Object.values(nodeMap);
        for (let i = 0; i < nodeArr.length; i++) {
          for (let j = i + 1; j < nodeArr.length; j++) {
            const na = nodeArr[i], nb = nodeArr[j];
            let dx = nb.x - na.x;
            let dy = nb.y - na.y;
            let d = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = (na.r + nb.r + 32);

            if (d < minDist * 2.5) {
              const force = (minDist * minDist) / (d * d) * 12 * alpha;
              const fx = (dx / d) * Math.min(force, 30);
              const fy = (dy / d) * Math.min(force, 30);
              na.x -= fx;
              na.y -= fy;
              nb.x += fx;
              nb.y += fy;
            }
          }
        }

        // Attraction along edges
        rawEdges.forEach(e => {
          const s = nodeMap[e.source];
          const t = nodeMap[e.target];
          if (!s || !t) return;
          let dx = t.x - s.x;
          let dy = t.y - s.y;
          let d = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 135;
          const spring = (d - targetDist) * 0.08 * alpha;
          const fx = (dx / d) * spring;
          const fy = (dy / d) * spring;
          s.x += fx;
          s.y += fy;
          t.x -= fx;
          t.y -= fy;
        });

        // Center pull (weak gravity)
        nodeArr.forEach(n => {
          n.x += (cx - n.x) * 0.015 * alpha;
          n.y += (cy - n.y) * 0.015 * alpha;
        });
      }

      layoutNodes = Object.values(nodeMap);
    }

    return layoutNodes;
  }, []);

  // Update layout when graphData or layoutMode changes
  useEffect(() => {
    if (!graphData?.nodes || graphData.nodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const placed = computeLayout(graphData.nodes, graphData.edges || [], layoutMode);
    setNodes(placed);
    setEdges(graphData.edges || []);
    setSelected(placed.find(n => n.type === 'actor') || placed[0] || null);

    const w = compact ? 380 : 880;
    const h = compact ? 240 : 540;
    fitView(placed, w, h);
  }, [graphData, layoutMode, computeLayout, compact, fitView]);

  const onNodeMouseDown = (e, id) => {
    e.stopPropagation();
    setDragging(id);
  };

  const onBgDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.dataset.bg) {
      setPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const onMove = (e) => {
    if (dragging) {
      const rect = svgRef.current.getBoundingClientRect();
      const mx = (e.clientX - rect.left - pan.x) / zoom;
      const my = (e.clientY - rect.top - pan.y) / zoom;
      setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x: mx, y: my } : n));
    } else if (panning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const onUp = () => {
    setDragging(null);
    setPanning(false);
  };

  // Connected nodes map for selection halo and relation highlighting
  const connectedIds = useMemo(() => {
    if (!selected) return new Set();
    const set = new Set([selected.id]);
    edges.forEach(e => {
      if (e.source === selected.id) set.add(e.target);
      if (e.target === selected.id) set.add(e.source);
    });
    return set;
  }, [selected, edges]);

  const filteredNodes = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    return nodes.filter(n => {
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;
      if (!q) return true;
      return (n.label || n.id).toLowerCase().includes(q) || (n.type || '').toLowerCase().includes(q);
    });
  }, [nodes, searchFilter, typeFilter]);

  const copyNodeLabel = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.label || selected.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const graphHeight = isFullscreen ? 'calc(100vh - 120px)' : (height || '580px');

  if (compact) {
    const activeMeta = selected ? getTypeMeta(selected.type) : null;
    return (
      <div style={{ position: 'relative', width: '100%', height: height || '240px', background: '#050811', borderRadius: '10px', overflow: 'hidden' }}>
        {/* Floating Mini Controls */}
        <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px', zIndex: 10 }}>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(2.5, Number((z + 0.2).toFixed(2))))}
            style={{ padding: '4px 6px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-secondary)', cursor: 'pointer' }}
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.2).toFixed(2))))}
            style={{ padding: '4px 6px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-secondary)', cursor: 'pointer' }}
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (svgRef.current) {
                const rect = svgRef.current.getBoundingClientRect();
                fitView(nodes, rect.width || 380, rect.height || 240);
              }
            }}
            style={{ padding: '4px 6px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-secondary)', cursor: 'pointer' }}
            title="Reset & Center"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Floating Node Info Bar on Click */}
        {selected && (
          <div style={{
            position: 'absolute', bottom: '8px', left: '8px', right: '8px',
            background: 'rgba(10, 15, 29, 0.94)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '8px',
            padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            zIndex: 10, fontSize: '11.5px', gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeMeta?.color || '#38bdf8', flexShrink: 0 }} />
              <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selected.label || selected.id}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', background: 'var(--bg-overlay)', padding: '1px 6px', borderRadius: '4px', flexShrink: 0 }}>
                {selected.type}
              </span>
            </div>
            {selected.details && (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                {selected.details}
              </span>
            )}
          </div>
        )}

        {/* SVG Viewport */}
        <div
          style={{ width: '100%', height: '100%', cursor: panning ? 'grabbing' : 'grab' }}
          onMouseDown={onBgDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
        >
          <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}>
            <defs>
              <pattern id="compact-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.06)" />
              </pattern>
              <marker id="compact-arrow" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(56, 189, 248, 0.6)" />
              </marker>
            </defs>
            <rect data-bg="true" width="100%" height="100%" fill="url(#compact-grid)" />

            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {edges.map((e, i) => {
                const s = nodes.find(n => n.id === e.source);
                const t = nodes.find(n => n.id === e.target);
                if (!s || !t) return null;
                const isSel = selected && (selected.id === s.id || selected.id === t.id);
                return (
                  <g key={`compact-edge-${i}`}>
                    <line
                      x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                      stroke={isSel ? '#38bdf8' : 'rgba(148, 163, 184, 0.25)'}
                      strokeWidth={isSel ? 2 : 1.2}
                      markerEnd="url(#compact-arrow)"
                    />
                    {e.label && (
                      <text
                        x={(s.x + t.x) / 2}
                        y={(s.y + t.y) / 2 - 3}
                        fill={isSel ? '#38bdf8' : 'var(--text-tertiary)'}
                        fontSize="8.5"
                        fontFamily="var(--font-mono)"
                        textAnchor="middle"
                      >
                        {e.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {nodes.map(n => {
                const meta = getTypeMeta(n.type);
                const isSel = selected?.id === n.id;
                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x},${n.y})`}
                    style={{ cursor: 'pointer' }}
                    onMouseDown={e => onNodeMouseDown(e, n.id)}
                    onClick={e => { e.stopPropagation(); setSelected(n); }}
                  >
                    {isSel && (
                      <circle r={n.r + 6} fill="none" stroke={meta.color} strokeWidth="2" strokeDasharray="3 2" opacity="0.9" />
                    )}
                    <circle r={n.r} fill={meta.bg} stroke={meta.color} strokeWidth={isSel ? 2.2 : 1.4} />
                    <circle r={n.r * 0.4} fill={meta.color} />
                    <text
                      y={n.r + 11}
                      fill="var(--text-primary)"
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      fontWeight={isSel ? '700' : '500'}
                      textAnchor="middle"
                      style={{ pointerEvents: 'none' }}
                    >
                      {n.label.length > 14 ? `${n.label.slice(0, 12)}…` : n.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>

      {/* ─── Toolbar: Layout Mode Selector & Quick Filters ─── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px', background: 'var(--bg-elevated)',
        padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border)'
      }}>
        {/* Left: Layout Modes (Pipeline / Force / Radial) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Layout Mode:
          </div>
          <div style={{ display: 'flex', background: 'var(--bg-base)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {[
              { id: 'pipeline', label: 'Kill-Chain Pipeline', icon: Workflow },
              { id: 'force',    label: 'Force Physics',       icon: Activity },
              { id: 'radial',   label: 'Radial Orbital',      icon: Radio }
            ].map(m => {
              const Icon = m.icon;
              const active = layoutMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setLayoutMode(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: active ? '700' : '500',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    border: 'none',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <Icon size={12} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              const placed = computeLayout(graphData.nodes || [], graphData.edges || [], layoutMode);
              setNodes(placed);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
              background: 'var(--bg-overlay)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer'
            }}
            title="Auto-organize node layout"
          >
            <RotateCcw size={12} />
            <span>Re-align</span>
          </button>
        </div>

        {/* Right: Search & HUD Zoom Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--bg-base)', border: '1px solid var(--border)',
            borderRadius: '6px', padding: '5px 10px', width: '180px'
          }}>
            <Search size={13} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search graph node…"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '11px', width: '100%',
                fontFamily: 'var(--font-sans)'
              }}
            />
          </div>

          <button className="btn-ghost" onClick={() => setZoom(z => Math.min(2.5, z + 0.15))} title="Zoom In" style={{ padding: '6px 8px' }}>
            <ZoomIn size={14} />
          </button>
          <button className="btn-ghost" onClick={() => setZoom(z => Math.max(0.3, z - 0.15))} title="Zoom Out" style={{ padding: '6px 8px' }}>
            <ZoomOut size={14} />
          </button>
          <button className="btn-ghost" onClick={() => { setZoom(1); setPan({ x: 50, y: 50 }); }} title="Reset View" style={{ padding: '6px 8px' }}>
            <RotateCcw size={14} />
          </button>
          <button className="btn-ghost" onClick={() => setIsFullscreen(!isFullscreen)} title="Toggle Fullscreen" style={{ padding: '6px 8px' }}>
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ─── Type Filter Chips ─── */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', padding: '0 4px' }}>
        <button
          onClick={() => setTypeFilter('all')}
          style={{
            padding: '4px 10px', borderRadius: '5px', fontSize: '10.5px', fontWeight: '700',
            background: typeFilter === 'all' ? 'var(--bg-overlay)' : 'transparent',
            border: `1px solid ${typeFilter === 'all' ? 'var(--border-accent)' : 'transparent'}`,
            color: typeFilter === 'all' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            cursor: 'pointer', fontFamily: 'var(--font-mono)'
          }}
        >
          ALL ENTITIES ({nodes.length})
        </button>
        {Object.entries(NODE_TYPES).filter(([k]) => k !== 'default').map(([key, meta]) => {
          const count = nodes.filter(n => n.type === key).length;
          if (count === 0) return null;
          const active = typeFilter === key;
          return (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '4px 9px', borderRadius: '5px', fontSize: '10.5px', fontWeight: '700',
                background: active ? meta.bg : 'transparent',
                border: `1px solid ${active ? meta.ring : 'transparent'}`,
                color: active ? meta.color : 'var(--text-tertiary)',
                cursor: 'pointer', fontFamily: 'var(--font-mono)'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.color }} />
              <span>{meta.label.toUpperCase()} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* ─── Main SVG Canvas + Inspector Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: '14px', alignItems: 'stretch' }}>
        {/* SVG Canvas */}
        <div
          style={{
            height: graphHeight,
            background: '#070b14',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            overflow: 'hidden',
            cursor: panning ? 'grabbing' : 'grab',
            position: 'relative',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.7)'
          }}
          onMouseDown={onBgDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
        >
          <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}>
            <defs>
              <pattern id="graph-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.06)" />
              </pattern>
              <marker id="arrow-threat" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(0,229,255,0.65)" />
              </marker>
              <marker id="arrow-selected" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#00e5ff" />
              </marker>
            </defs>
            <rect data-bg="true" width="100%" height="100%" fill="url(#graph-grid)" />

            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {edges.map((e, i) => {
                const s = nodes.find(n => n.id === e.source);
                const t = nodes.find(n => n.id === e.target);
                if (!s || !t) return null;
                const isConnected = selected && (selected.id === s.id || selected.id === t.id);

                return (
                  <g key={`edge-${i}`}>
                    <line
                      x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                      stroke={isConnected ? '#00e5ff' : 'rgba(148,163,184,0.2)'}
                      strokeWidth={isConnected ? 2.2 : 1.2}
                      markerEnd={isConnected ? 'url(#arrow-selected)' : 'url(#arrow-threat)'}
                    />
                    {e.label && (
                      <text
                        x={(s.x + t.x) / 2}
                        y={(s.y + t.y) / 2 - 4}
                        fill={isConnected ? '#00e5ff' : 'var(--text-tertiary)'}
                        fontSize="9"
                        fontFamily="var(--font-mono)"
                        textAnchor="middle"
                        fontWeight={isConnected ? '700' : '400'}
                      >
                        {e.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map(n => {
                const meta = getTypeMeta(n.type);
                const isSel = selected?.id === n.id;
                const isConnected = connectedIds.has(n.id);
                const isMatched = filteredNodes.some(fn => fn.id === n.id);
                const opacity = (filteredNodes.length === nodes.length || isMatched) ? (selected ? (isConnected ? 1 : 0.28) : 1) : 0.15;

                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x},${n.y})`}
                    style={{ cursor: 'pointer', transition: 'opacity 0.15s ease' }}
                    opacity={opacity}
                    onMouseDown={e => onNodeMouseDown(e, n.id)}
                    onClick={e => { e.stopPropagation(); setSelected(n); }}
                  >
                    {/* Glowing Selection Halo */}
                    {isSel && (
                      <circle r={n.r + 8} fill="none" stroke={meta.color} strokeWidth="2.5" opacity="0.8" strokeDasharray="4 2" />
                    )}

                    {/* Outer Ring */}
                    <circle r={n.r} fill={meta.bg} stroke={meta.color} strokeWidth={isSel ? 2.5 : 1.5} />

                    {/* Inner core */}
                    <circle r={n.r * 0.42} fill={meta.color} />

                    {/* Label below node */}
                    <text
                      y={n.r + 14}
                      fill={isSel ? '#ffffff' : 'var(--text-secondary)'}
                      fontSize="10"
                      fontFamily="var(--font-mono)"
                      fontWeight={isSel ? '800' : '600'}
                      textAnchor="middle"
                    >
                      {(n.label || n.id).length > 22 ? (n.label || n.id).slice(0, 20) + '…' : (n.label || n.id)}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* ─── Selected Node Intelligence Inspector ─── */}
        {selected && (
          <div style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
            maxHeight: graphHeight,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  padding: '3px 8px', borderRadius: '4px', fontSize: '10px',
                  fontWeight: '800', textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
                  background: getTypeMeta(selected.type).bg, color: getTypeMeta(selected.type).color,
                  border: `1px solid ${getTypeMeta(selected.type).ring}`
                }}>
                  {getTypeMeta(selected.type).label}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 0', wordBreak: 'break-word' }}>
                  {selected.label || selected.id}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Entity Attributes */}
            <div style={{
              background: 'var(--bg-base)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Node Identifier</div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', wordBreak: 'break-all' }}>{selected.id}</div>
              </div>

              {(selected.details || selected.description) && (
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Extracted Telemetry</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>{selected.details || selected.description}</div>
                </div>
              )}

              {selected.evidence && (
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Verified Evidence</div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '4px' }}>
                    {selected.evidence}
                  </div>
                </div>
              )}
            </div>

            {/* Connected Relations */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Connected Relationships ({edges.filter(e => e.source === selected.id || e.target === selected.id).length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                {edges.filter(e => e.source === selected.id || e.target === selected.id).map((edge, i) => {
                  const otherId = edge.source === selected.id ? edge.target : edge.source;
                  const otherNode = nodes.find(n => n.id === otherId);
                  const isOutbound = edge.source === selected.id;

                  return (
                    <div
                      key={i}
                      onClick={() => otherNode && setSelected(otherNode)}
                      style={{
                        padding: '7px 10px', borderRadius: '6px', background: 'var(--bg-base)',
                        border: '1px solid var(--border)', fontSize: '11.5px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'all 0.12s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {isOutbound ? `→ ${edge.label || 'targets'} ` : `← ${edge.label || 'targeted by'} `}
                        <strong style={{ color: 'var(--text-primary)' }}>{otherNode?.label || otherId}</strong>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="btn-ghost"
                onClick={copyNodeLabel}
                style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '12px' }}
              >
                {copied ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Name'}</span>
              </button>

              <button
                className="btn-primary"
                onClick={() => onAskCopilot?.(`Analyze the role of ${selected.label || selected.id} (${selected.type}) in this cyber attack campaign and provide mitigation steps.`)}
                style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '12px' }}
              >
                <MessageSquare size={14} />
                <span>Ask AI Copilot</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
