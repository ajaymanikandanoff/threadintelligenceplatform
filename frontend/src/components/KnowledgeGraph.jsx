import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X, Terminal, Maximize2, Minimize2, Search, Filter, MessageSquare, Copy, Check, ShieldAlert } from 'lucide-react';

const NODE_TYPES = {
  actor:     { label: 'Attacker',   color: '#f87171', bg: 'rgba(248,113,113,0.18)', ring: '#f87171' },
  malware:   { label: 'Malware',    color: '#c084fc', bg: 'rgba(192,132,252,0.18)', ring: '#c084fc' },
  cve:       { label: 'CVE Flaw',   color: '#fbbf24', bg: 'rgba(251,191,36,0.18)',  ring: '#fbbf24' },
  technique: { label: 'Technique',  color: '#38bdf8', bg: 'rgba(56,189,248,0.18)',  ring: '#38bdf8' },
  ioc:       { label: 'Indicator',  color: '#34d399', bg: 'rgba(52,211,153,0.18)',  ring: '#34d399' },
  target:    { label: 'Target',     color: '#f472b6', bg: 'rgba(244,114,182,0.18)', ring: '#f472b6' },
  default:   { label: 'Entity',     color: '#94a3b8', bg: 'rgba(148,163,184,0.18)', ring: '#94a3b8' }
};

export default function KnowledgeGraph({ graphData, onAskCopilot }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(null);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!graphData?.nodes || graphData.nodes.length === 0) return;
    const cx = 460, cy = 300;
    const placed = graphData.nodes.map((n, i) => {
      let r = n.type === 'actor' ? 0 : n.type === 'malware' || n.type === 'cve' ? 140 : n.type === 'target' ? 180 : 260;
      const angle = (i / Math.max(1, graphData.nodes.length - 1)) * 2 * Math.PI - Math.PI / 2;
      return {
        ...n,
        x: r === 0 ? cx : cx + r * Math.cos(angle),
        y: r === 0 ? cy : cy + r * Math.sin(angle),
        r: n.type === 'actor' ? 26 : n.type === 'malware' || n.type === 'cve' ? 20 : 15
      };
    });
    setNodes(placed);
    setEdges(graphData.edges || []);
    setSelected(placed.find(n => n.type === 'actor') || placed[0] || null);
  }, [graphData]);

  const onNodeMouseDown = (e, id) => { e.stopPropagation(); setDragging(id); };
  const onBgDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.dataset.bg) {
      setPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  const onMove = (e) => {
    if (dragging) {
      const rect = svgRef.current.getBoundingClientRect();
      const mx = (e.clientX - rect.left - pan.x) / zoom, my = (e.clientY - rect.top - pan.y) / zoom;
      setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x: mx, y: my } : n));
    } else if (panning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };
  const onUp = () => { setDragging(null); setPanning(false); };

  const getTypeMeta = (type) => NODE_TYPES[type] || NODE_TYPES.default;

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

  const graphHeight = isFullscreen ? 'calc(100vh - 120px)' : '540px';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Toolbar & Filter Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px', background: 'var(--bg-elevated)',
        padding: '12px 18px', borderRadius: '10px', border: '1px solid var(--border)'
      }}>
        {/* Left: Node Type Quick Filters */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setTypeFilter('all')}
            style={{
              padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
              background: typeFilter === 'all' ? 'var(--bg-overlay)' : 'transparent',
              border: `1px solid ${typeFilter === 'all' ? 'var(--border-accent)' : 'transparent'}`,
              color: typeFilter === 'all' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              cursor: 'pointer'
            }}
          >
            All ({nodes.length})
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
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                  background: active ? meta.bg : 'transparent',
                  border: `1px solid ${active ? meta.ring : 'transparent'}`,
                  color: active ? meta.color : 'var(--text-tertiary)',
                  cursor: 'pointer'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.color }} />
                <span>{meta.label} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Right: Search & Zoom Controls */}
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
                color: 'var(--text-primary)', fontSize: '11px', width: '100%'
              }}
            />
          </div>

          <button className="btn-ghost" onClick={() => setZoom(z => Math.min(2.2, z + 0.15))} title="Zoom In" style={{ padding: '6px 8px' }}>
            <ZoomIn size={14} />
          </button>
          <button className="btn-ghost" onClick={() => setZoom(z => Math.max(0.4, z - 0.15))} title="Zoom Out" style={{ padding: '6px 8px' }}>
            <ZoomOut size={14} />
          </button>
          <button className="btn-ghost" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} title="Reset View" style={{ padding: '6px 8px' }}>
            <RotateCcw size={14} />
          </button>
          <button className="btn-ghost" onClick={() => setIsFullscreen(!isFullscreen)} title="Toggle Fullscreen" style={{ padding: '6px 8px' }}>
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Canvas + Inspector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '14px' }}>
        {/* SVG Canvas */}
        <div
          style={{
            height: graphHeight,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: panning ? 'grabbing' : 'grab',
            position: 'relative'
          }}
          onMouseDown={onBgDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
        >
          <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}>
            <defs>
              <pattern id="graph-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.06)" />
              </pattern>
              <marker id="arrow-threat" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(56,189,248,0.5)" />
              </marker>
            </defs>
            <rect data-bg="true" width="100%" height="100%" fill="url(#graph-grid)" />

            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {edges.map((e, i) => {
                const s = nodes.find(n => n.id === e.source), t = nodes.find(n => n.id === e.target);
                if (!s || !t) return null;
                const isConnected = selected && (selected.id === s.id || selected.id === t.id);

                return (
                  <g key={`edge-${i}`}>
                    <line
                      x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                      stroke={isConnected ? 'rgba(56,189,248,0.7)' : 'rgba(148,163,184,0.18)'}
                      strokeWidth={isConnected ? 2 : 1.2}
                      markerEnd="url(#arrow-threat)"
                    />
                    {e.label && (
                      <text
                        x={(s.x + t.x) / 2}
                        y={(s.y + t.y) / 2 - 4}
                        fill={isConnected ? 'var(--accent)' : 'var(--text-tertiary)'}
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
                const isMatched = filteredNodes.some(fn => fn.id === n.id);
                const opacity = filteredNodes.length === nodes.length || isMatched ? 1 : 0.2;

                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x},${n.y})`}
                    style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
                    opacity={opacity}
                    onMouseDown={e => onNodeMouseDown(e, n.id)}
                    onClick={e => { e.stopPropagation(); setSelected(n); }}
                  >
                    {/* Glowing Selection Halo */}
                    {isSel && (
                      <circle r={n.r + 7} fill="none" stroke={meta.color} strokeWidth="2.5" opacity="0.6" strokeDasharray="4 2" />
                    )}

                    {/* Outer Ring */}
                    <circle r={n.r} fill={meta.bg} stroke={meta.color} strokeWidth={isSel ? 2.5 : 1.5} />

                    {/* Inner core */}
                    <circle r={n.r * 0.45} fill={meta.color} />

                    {/* Label below node */}
                    <text
                      y={n.r + 13}
                      fill={isSel ? 'var(--text-primary)' : 'var(--text-secondary)'}
                      fontSize="10"
                      fontFamily="var(--font-mono)"
                      fontWeight={isSel ? '700' : '500'}
                      textAnchor="middle"
                    >
                      {(n.label || n.id).length > 20 ? (n.label || n.id).slice(0, 18) + '…' : (n.label || n.id)}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Selected Node Details Inspector */}
        {selected && (
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  padding: '2px 8px', borderRadius: '4px', fontSize: '10px',
                  fontWeight: '700', textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
                  background: getTypeMeta(selected.type).bg, color: getTypeMeta(selected.type).color,
                  border: `1px solid ${getTypeMeta(selected.type).ring}`
                }}>
                  {getTypeMeta(selected.type).label}
                </span>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: '6px 0 0' }}>
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
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Node ID</div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{selected.id}</div>
              </div>
              {selected.description && (
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Description</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{selected.description}</div>
                </div>
              )}
            </div>

            {/* Connected Relations */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Connected Relationships
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                {edges.filter(e => e.source === selected.id || e.target === selected.id).map((edge, i) => {
                  const otherId = edge.source === selected.id ? edge.target : edge.source;
                  const otherNode = nodes.find(n => n.id === otherId);
                  const isOutbound = edge.source === selected.id;

                  return (
                    <div
                      key={i}
                      onClick={() => otherNode && setSelected(otherNode)}
                      style={{
                        padding: '6px 10px', borderRadius: '6px', background: 'var(--bg-base)',
                        border: '1px solid var(--border)', fontSize: '11px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
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
