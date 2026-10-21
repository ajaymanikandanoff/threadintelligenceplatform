import React, { useState, useRef, useEffect } from 'react';
import { 
  GitCommit, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  ShieldAlert, 
  Bug, 
  Terminal, 
  Globe, 
  Target, 
  X,
  Info,
  Maximize2
} from 'lucide-react';

const NODE_COLORS = {
  actor: { fill: '#ff3366', stroke: '#ff0044', glow: 'rgba(255, 51, 102, 0.5)' },
  malware: { fill: '#a855f7', stroke: '#9333ea', glow: 'rgba(168, 85, 247, 0.5)' },
  cve: { fill: '#f59e0b', stroke: '#d97706', glow: 'rgba(245, 158, 11, 0.5)' },
  technique: { fill: '#3b82f6', stroke: '#2563eb', glow: 'rgba(59, 130, 246, 0.5)' },
  ioc: { fill: '#00f0ff', stroke: '#06b6d4', glow: 'rgba(0, 240, 255, 0.5)' },
  target: { fill: '#10b981', stroke: '#059669', glow: 'rgba(16, 185, 129, 0.5)' },
  default: { fill: '#94a3b8', stroke: '#64748b', glow: 'rgba(148, 163, 184, 0.5)' }
};

export default function KnowledgeGraph({ graphData, onAskCopilot }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const svgRef = useRef(null);

  // Initialize nodes with dynamic positions in a circular / radial cyber layout
  useEffect(() => {
    if (!graphData || !graphData.nodes) return;

    const rawNodes = graphData.nodes || [];
    const rawEdges = graphData.edges || [];

    const centerX = 500;
    const centerY = 350;

    // Arrange nodes nicely by category radius
    const initializedNodes = rawNodes.map((n, idx) => {
      let r = 240;
      if (n.type === 'actor') r = 0;
      else if (n.type === 'malware' || n.type === 'cve') r = 140;
      else if (n.type === 'technique') r = 250;
      else if (n.type === 'ioc') r = 320;
      else if (n.type === 'target') r = 180;

      const angle = (idx / Math.max(1, rawNodes.length - 1)) * 2 * Math.PI;
      const x = r === 0 ? centerX : centerX + r * Math.cos(angle);
      const y = r === 0 ? centerY : centerY + r * Math.sin(angle);

      return {
        ...n,
        x,
        y,
        radius: n.type === 'actor' ? 28 : (n.type === 'malware' || n.type === 'cve' ? 22 : 18)
      };
    });

    setNodes(initializedNodes);
    setEdges(rawEdges);
    setSelectedNode(initializedNodes.find(n => n.type === 'actor') || initializedNodes[0] || null);
  }, [graphData]);

  // Handle Dragging
  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
  };

  const handleSvgMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.id === 'graph-bg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (draggingNodeId) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: mouseX, y: mouseY } : n));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const visibleNodes = nodes.filter(n => filterType === 'ALL' || n.type === filterType);
  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));

  const getNodeColor = (type) => NODE_COLORS[type] || NODE_COLORS.default;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Controls Bar */}
      <div className="cyber-card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.04em' }}>Filter Entity:</span>
          </div>
          {['ALL', 'actor', 'malware', 'cve', 'technique', 'ioc', 'target'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                background: filterType === type ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${filterType === type ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                color: filterType === type ? 'var(--accent-cyan)' : 'var(--text-muted)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase'
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Zoom & View Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="cyber-btn-secondary" 
            onClick={() => setZoom(z => Math.min(2, z + 0.15))}
            style={{ padding: '6px 10px' }}
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button 
            className="cyber-btn-secondary" 
            onClick={() => setZoom(z => Math.max(0.5, z - 0.15))}
            style={{ padding: '6px 10px' }}
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button 
            className="cyber-btn-secondary" 
            onClick={resetView}
            style={{ padding: '6px 10px' }}
            title="Reset Graph Position"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspector Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedNode ? '1fr 340px' : '1fr', gap: '16px', position: 'relative' }}>
        {/* SVG Graph Viewport */}
        <div 
          className="cyber-card" 
          style={{ 
            height: '620px', 
            position: 'relative', 
            overflow: 'hidden',
            cursor: isPanning ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleSvgMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Subtle Grid Watermark / Info overlay */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '18px',
            pointerEvents: 'none',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)',
            zIndex: 10
          }}>
            <div>// THREAT KNOWLEDGE GRAPH // GraphRAG ONTOLOGY</div>
            <div>NODES: {visibleNodes.length} | EDGES: {visibleEdges.length} | ZOOM: {(zoom * 100).toFixed(0)}%</div>
          </div>

          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{ display: 'block' }}
          >
            <defs>
              {/* Arrow Marker for Directed Edges */}
              <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(0, 240, 255, 0.6)" />
              </marker>

              {/* Glowing filters */}
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {visibleEdges.map((edge, idx) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const midX = (sourceNode.x + targetNode.x) / 2;
                const midY = (sourceNode.y + targetNode.y) / 2;

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke="rgba(0, 240, 255, 0.25)"
                      strokeWidth="1.8"
                      strokeDasharray="4 2"
                      markerEnd="url(#arrowhead)"
                    />
                    {edge.label && (
                      <text
                        x={midX}
                        y={midY - 6}
                        fill="rgba(148, 163, 184, 0.85)"
                        fontSize="9"
                        fontFamily="var(--font-mono)"
                        textAnchor="middle"
                        style={{ pointerEvents: 'none' }}
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {visibleNodes.map((node) => {
                const colors = getNodeColor(node.type);
                const isSelected = selectedNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    style={{ cursor: 'pointer' }}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                    }}
                  >
                    {/* Node Glow Circle */}
                    <circle
                      r={node.radius + (isSelected ? 8 : 4)}
                      fill={colors.glow}
                      opacity={isSelected ? 0.9 : 0.4}
                    />

                    {/* Node Main Circle */}
                    <circle
                      r={node.radius}
                      fill={colors.fill}
                      stroke={isSelected ? '#ffffff' : colors.stroke}
                      strokeWidth={isSelected ? 3 : 2}
                    />

                    {/* Label */}
                    <text
                      y={node.radius + 14}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="var(--font-sans)"
                      textAnchor="middle"
                      style={{ pointerEvents: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
                    >
                      {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Right Node Inspector Drawer */}
        {selectedNode && (
          <div className="cyber-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', height: '620px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className={`badge ${
                  selectedNode.type === 'actor' ? 'badge-red' :
                  selectedNode.type === 'malware' ? 'badge-purple' :
                  selectedNode.type === 'cve' ? 'badge-amber' :
                  selectedNode.type === 'technique' ? 'badge-cyan' : 'badge-green'
                }`}>
                  {selectedNode.category || selectedNode.type.toUpperCase()}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff', marginTop: '8px' }}>
                  {selectedNode.label}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '6px' }}>
                Entity Intelligence
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {selectedNode.details || 'No detailed profile available for this threat entity.'}
              </p>
            </div>

            {/* Related Connections */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>
                Graph Relations
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {edges
                  .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                  .map((e, idx) => {
                    const isOutgoing = e.source === selectedNode.id;
                    const otherId = isOutgoing ? e.target : e.source;
                    const otherNode = nodes.find(n => n.id === otherId);
                    return (
                      <div key={idx} style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {e.label}
                        </span>
                        <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>
                          {otherNode?.label || otherId}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Quick Action Button for Copilot */}
            <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
              <button
                className="cyber-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => onAskCopilot(`Explain the threat impact of ${selectedNode.label} and how we can detect or block it.`)}
              >
                <Terminal size={15} />
                <span>Ask Copilot About Node</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
