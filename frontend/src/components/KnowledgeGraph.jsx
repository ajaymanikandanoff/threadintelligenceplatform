import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X, Terminal, Maximize2, Minimize2 } from 'lucide-react';

const NODE_COLORS = {
  actor:     { bg: '#fc8181', ring: '#feb2b2' },
  malware:   { bg: '#b794f4', ring: '#d6bcfa' },
  cve:       { bg: '#f6ad55', ring: '#fbd38d' },
  technique: { bg: '#63b3ed', ring: '#90cdf4' },
  ioc:       { bg: '#4fd1c5', ring: '#81e6d9' },
  target:    { bg: '#68d391', ring: '#9ae6b4' },
  default:   { bg: '#a0aec0', ring: '#cbd5e0' }
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
  const svgRef = useRef(null);

  useEffect(() => {
    if (!graphData?.nodes) return;
    const cx = 480, cy = 320;
    const placed = graphData.nodes.map((n, i) => {
      let r = n.type === 'actor' ? 0 : n.type === 'malware' || n.type === 'cve' ? 130 : n.type === 'target' ? 170 : 260;
      const angle = (i / Math.max(1, graphData.nodes.length - 1)) * 2 * Math.PI - Math.PI / 2;
      return { ...n, x: r === 0 ? cx : cx + r * Math.cos(angle), y: r === 0 ? cy : cy + r * Math.sin(angle), r: n.type === 'actor' ? 24 : n.type === 'malware' || n.type === 'cve' ? 18 : 14 };
    });
    setNodes(placed);
    setEdges(graphData.edges || []);
    setSelected(placed.find(n => n.type === 'actor') || placed[0] || null);
  }, [graphData]);

  const onNodeMouseDown = (e, id) => { e.stopPropagation(); setDragging(id); };
  const onBgDown = (e) => { if (e.target.tagName === 'svg' || e.target.dataset.bg) { setPanning(true); setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); } };
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

  const col = (type) => NODE_COLORS[type] || NODE_COLORS.default;

  const graphHeight = isFullscreen ? 'calc(100vh - 120px)' : '560px';

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
          {nodes.length} nodes · {edges.length} edges · {(zoom * 100).toFixed(0)}%
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn-ghost" onClick={() => setZoom(z => Math.min(2, z + 0.15))} style={{ padding: '5px 8px' }}><ZoomIn size={15} /></button>
          <button className="btn-ghost" onClick={() => setZoom(z => Math.max(0.4, z - 0.15))} style={{ padding: '5px 8px' }}><ZoomOut size={15} /></button>
          <button className="btn-ghost" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} style={{ padding: '5px 8px' }}><RotateCcw size={15} /></button>
          <button className="btn-ghost" onClick={() => setIsFullscreen(!isFullscreen)} style={{ padding: '5px 8px' }}>
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Canvas + Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 300px' : '1fr', gap: '12px' }}>
        <div className="surface" style={{ height: graphHeight, overflow: 'hidden', cursor: panning ? 'grabbing' : 'grab', position: 'relative' }}
          onMouseDown={onBgDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
          <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(99,179,237,0.5)" />
              </marker>
            </defs>
            <rect data-bg="true" width="100%" height="100%" fill="transparent" />
            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {edges.map((e, i) => {
                const s = nodes.find(n => n.id === e.source), t = nodes.find(n => n.id === e.target);
                if (!s || !t) return null;
                return (
                  <g key={`e-${i}`}>
                    <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="rgba(99,179,237,0.18)" strokeWidth="1.5" markerEnd="url(#arrow)" />
                    {e.label && <text x={(s.x + t.x) / 2} y={(s.y + t.y) / 2 - 5} fill="var(--text-3)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle">{e.label}</text>}
                  </g>
                );
              })}
              {nodes.map(n => {
                const c = col(n.type);
                const isSel = selected?.id === n.id;
                return (
                  <g key={n.id} transform={`translate(${n.x},${n.y})`} style={{ cursor: 'pointer' }}
                    onMouseDown={e => onNodeMouseDown(e, n.id)} onClick={e => { e.stopPropagation(); setSelected(n); }}>
                    {isSel && <circle r={n.r + 6} fill="none" stroke={c.ring} strokeWidth="1.5" opacity="0.5" />}
                    <circle r={n.r} fill={c.bg} opacity={0.9} />
                    <text y={n.r + 13} fill="var(--text-1)" fontSize="9" fontWeight="600" fontFamily="var(--font-sans)" textAnchor="middle" style={{ pointerEvents: 'none' }}>
                      {n.label.length > 22 ? n.label.substring(0, 20) + '…' : n.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Inspector */}
        {selected && (
          <div className="surface" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', height: graphHeight, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className={`tag ${selected.type === 'actor' ? 'tag-red' : selected.type === 'malware' ? 'tag-purple' : selected.type === 'cve' ? 'tag-amber' : 'tag-cyan'}`}>
                  {selected.category || selected.type}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-0)', marginTop: '6px', lineHeight: '1.3' }}>{selected.label}</h3>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: '6px', fontWeight: '600' }}>Details</div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: '1.5' }}>{selected.details || 'No additional details available.'}</p>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: '8px', fontWeight: '600' }}>Relations</div>
              {edges.filter(e => e.source === selected.id || e.target === selected.id).map((e, i) => {
                const other = nodes.find(n => n.id === (e.source === selected.id ? e.target : e.source));
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{e.label}</span>
                    <span style={{ color: 'var(--text-1)' }}>{other?.label || '?'}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => onAskCopilot(`Explain the threat impact of ${selected.label} and how to detect or block it.`)}>
                <Terminal size={14} />
                <span>Ask Copilot</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
