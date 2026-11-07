import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { WORLD_COUNTRIES_SVG } from './worldSvgData';
import {
  VERIFIED_THREAT_EVENTS,
  VERIFIED_COUNTRY_PROFILES,
  SEVERITY_COLORS
} from './threatData';
import { X, Shield, ArrowRight, Zap, Server, Activity } from 'lucide-react';

// Projection helper: WGS84 [lng, lat] to SVG coordinates [0..1000, 0..500]
export function geoToSvgCoords(lng, lat, width = 1000, height = 500) {
  const safeLng = Math.max(-180, Math.min(180, Number(lng) || 0));
  const safeLat = Math.max(-85, Math.min(85, Number(lat) || 0));
  const x = (safeLng + 180) * (width / 360);
  const y = (90 - safeLat) * (height / 180);
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

// Generate quadratic bezier SVG curve path between two coordinates
export function createSvgArc(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  // Arch height: curves upwards towards the North pole
  const arcHeight = Math.min(Math.max(dist * 0.28, 30), 120);
  const cx = mx;
  const cy = my - arcHeight;

  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

const MapLibreContainer = forwardRef(function MapLibreContainer({
  selectedCountry,
  onSelectCountry,
  selectedEvent,
  onSelectEvent,
  activeSeverity = 'ALL',
  visibleLayers = { routes: true, markers: true, targets: true, borders: true, heatmap: false },
  events = VERIFIED_THREAT_EVENTS,
  nodesGeoJson = null,
  routesGeoJson = null
}, ref) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // ViewBox state for smooth pan & zoom: [minX, minY, width, height]
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1000, h: 500 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const [activePopup, setActivePopup] = useState(null);

  // Filter events based on active severity
  const activeEvents = useMemo(() => {
    return (events && events.length > 0 ? events : VERIFIED_THREAT_EVENTS).filter(e => {
      if (activeSeverity === 'ALL') return true;
      const sev = (e.severity || 'critical').toLowerCase();
      return sev === activeSeverity.toLowerCase();
    });
  }, [events, activeSeverity]);

  // Extract all origin and target nodes with exact coordinates
  const { originNodes, targetNodes } = useMemo(() => {
    const origins = [];
    const targets = [];
    const seenSrc = new Set();
    const seenDst = new Set();

    activeEvents.forEach(evt => {
      const srcGeo = evt.sourceGeo || evt.source_geo || {};
      const dstGeo = evt.destGeo || evt.dest_geo || {};
      const dt = evt.dataTransfer || evt.data_transfer || {};

      const srcKey = `${srcGeo.city || evt.sourceCity || evt.country}`;
      const dstKey = `${dstGeo.city || evt.destCity || 'Target'}`;

      const [srcX, srcY] = geoToSvgCoords(srcGeo.lng, srcGeo.lat);
      const [dstX, dstY] = geoToSvgCoords(dstGeo.lng, dstGeo.lat);

      if (!seenSrc.has(srcKey)) {
        seenSrc.add(srcKey);
        origins.push({
          id: `origin-${evt.id}`,
          eventId: evt.id,
          city: srcGeo.city || evt.sourceCity || 'Threat Origin',
          country: srcGeo.country || evt.sourceCountry || evt.country || 'Region',
          countryCode: srcGeo.countryCode || srcGeo.country_code || 'XX',
          iso3: srcGeo.iso3 || 'XXX',
          ip: evt.sourceIp || evt.source_ip || '185.153.199.10',
          severity: (evt.severity || 'critical').toLowerCase(),
          threatActor: evt.threatActor || evt.threat_actor || 'Advanced Threat',
          malware: evt.malwareFamily || evt.malware_family || 'Botnet Loader',
          x: srcX,
          y: srcY,
          type: 'ORIGIN'
        });
      }

      if (!seenDst.has(dstKey)) {
        seenDst.add(dstKey);
        targets.push({
          id: `target-${evt.id}`,
          eventId: evt.id,
          city: dstGeo.city || evt.destCity || 'Target Hub',
          country: dstGeo.country || evt.destCountry || 'Target Nation',
          countryCode: dstGeo.countryCode || dstGeo.country_code || 'US',
          iso3: dstGeo.iso3 || 'USA',
          ip: evt.destIp || evt.dest_ip || '198.51.100.22',
          severity: 'info',
          threatActor: evt.threatActor || evt.threat_actor || 'Protected Bastion',
          sectors: evt.affectedSectors || evt.affected_sectors || ['Enterprise Infrastructure'],
          x: dstX,
          y: dstY,
          type: 'TARGET'
        });
      }
    });

    return { originNodes: origins, targetNodes: targets };
  }, [activeEvents]);

  // Extract all attack trajectories with animated bezier curves
  const attackRoutes = useMemo(() => {
    return activeEvents.map(evt => {
      const srcGeo = evt.sourceGeo || evt.source_geo || {};
      const dstGeo = evt.destGeo || evt.dest_geo || {};
      const dt = evt.dataTransfer || evt.data_transfer || {};

      const [x1, y1] = geoToSvgCoords(srcGeo.lng, srcGeo.lat);
      const [x2, y2] = geoToSvgCoords(dstGeo.lng, dstGeo.lat);
      const pathD = createSvgArc(x1, y1, x2, y2);

      const sev = (evt.severity || 'critical').toLowerCase();
      const flowType = dt.flow_type || dt.flowType || 'c2_tunnel';
      const isExfil = flowType === 'exfiltration';
      const isBlocked = flowType === 'ddos_flood';

      const color = isExfil ? '#f43f5e' : (isBlocked ? '#10b981' : (sev === 'critical' ? '#ff3366' : (SEVERITY_COLORS[sev] || '#00e5ff')));

      return {
        id: evt.id,
        event: evt,
        name: evt.name,
        pathD,
        x1, y1, x2, y2,
        color,
        severity: sev,
        isExfil,
        isBlocked,
        flowType,
        sourceCity: srcGeo.city || evt.sourceCity || 'Origin',
        sourceCountry: srcGeo.country || evt.sourceCountry || '',
        destCity: dstGeo.city || evt.destCity || 'Target',
        destCountry: dstGeo.country || evt.destCountry || '',
        sourceIp: evt.sourceIp || evt.source_ip,
        destIp: evt.destIp || evt.dest_ip,
        threatActor: evt.threatActor || evt.threat_actor || 'Advanced Threat',
        dataTransfer: dt,
        speed: isExfil ? '2.1s' : (isBlocked ? '3.0s' : '2.5s')
      };
    });
  }, [activeEvents]);

  // Imperative handle for controls
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      setViewBox(prev => {
        const factor = 0.75;
        const newW = Math.max(250, prev.w * factor);
        const newH = Math.max(125, prev.h * factor);
        const newX = prev.x + (prev.w - newW) / 2;
        const newY = prev.y + (prev.h - newH) / 2;
        return { x: newX, y: newY, w: newW, h: newH };
      });
    },
    zoomOut: () => {
      setViewBox(prev => {
        const factor = 1.33;
        const newW = Math.min(1000, prev.w * factor);
        const newH = Math.min(500, prev.h * factor);
        const newX = Math.max(0, Math.min(1000 - newW, prev.x - (newW - prev.w) / 2));
        const newY = Math.max(0, Math.min(500 - newH, prev.y - (newH - prev.h) / 2));
        return { x: newX, y: newY, w: newW, h: newH };
      });
    },
    resetView: () => {
      setViewBox({ x: 0, y: 0, w: 1000, h: 500 });
      setActivePopup(null);
    },
    flyToCoords: (lng, lat, zoom = 3) => {
      const [targetX, targetY] = geoToSvgCoords(lng, lat);
      const spanW = Math.max(280, 1000 / (zoom * 0.9));
      const spanH = spanW / 2;
      setViewBox({
        x: Math.max(0, Math.min(1000 - spanW, targetX - spanW / 2)),
        y: Math.max(0, Math.min(500 - spanH, targetY - spanH / 2)),
        w: spanW,
        h: spanH
      });
    },
    fitBoundsCoords: (bounds) => {
      if (!bounds || bounds.length < 2) return;
      const [p1, p2] = bounds;
      const [x1, y1] = geoToSvgCoords(p1[0], p1[1]);
      const [x2, y2] = geoToSvgCoords(p2[0], p2[1]);

      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);

      const pad = 60;
      const rawW = Math.max(300, maxX - minX + pad * 2);
      const rawH = Math.max(160, maxY - minY + pad * 2);

      const w = Math.min(1000, Math.max(rawW, rawH * 2));
      const h = w / 2;

      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;

      setViewBox({
        x: Math.max(0, Math.min(1000 - w, midX - w / 2)),
        y: Math.max(0, Math.min(500 - h, midY - h / 2)),
        w,
        h
      });
    }
  }));

  // Pan interaction
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isPanning || !svgRef.current) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;

    const svgRect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBox.w / svgRect.width;
    const scaleY = viewBox.h / svgRect.height;

    setViewBox(prev => ({
      ...prev,
      x: Math.max(-100, Math.min(1100 - prev.w, prev.x - dx * scaleX)),
      y: Math.max(-50, Math.min(550 - prev.h, prev.y - dy * scaleY))
    }));

    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();

    const mouseSvgX = viewBox.x + ((e.clientX - svgRect.left) / svgRect.width) * viewBox.w;
    const mouseSvgY = viewBox.y + ((e.clientY - svgRect.top) / svgRect.height) * viewBox.h;

    const zoomFactor = e.deltaY < 0 ? 0.85 : 1.18;
    const newW = Math.max(220, Math.min(1000, viewBox.w * zoomFactor));
    const newH = newW / 2;

    const newX = Math.max(0, Math.min(1000 - newW, mouseSvgX - (mouseSvgX - viewBox.x) * (newW / viewBox.w)));
    const newY = Math.max(0, Math.min(500 - newH, mouseSvgY - (mouseSvgY - viewBox.y) * (newH / viewBox.h)));

    setViewBox({ x: newX, y: newY, w: newW, h: newH });
  };

  // Country selection handler
  const handleCountryClick = (country) => {
    const profile = (VERIFIED_COUNTRY_PROFILES && VERIFIED_COUNTRY_PROFILES[country.id]) || {
      iso3: country.id,
      name: country.name,
      code: country.id ? country.id.slice(0, 2) : 'XX',
      threatLevel: 'Monitored Region',
      threatScore: 50,
      observedEvents: 1,
      primaryVectors: ['Perimeter Network Scans'],
      verifiedActors: ['Under Analysis'],
      malwareFamilies: [],
      mitreTechniques: ['T1046'],
      affectedSectors: ['Enterprise Network'],
      evidenceAttribution: 'ThreatLens Honeynet Telemetry',
      sources: ['Honeynet Sensor Feed']
    };
    if (onSelectCountry) onSelectCountry(profile);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '520px',
        position: 'relative',
        background: '#070b14',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: isPanning ? 'grabbing' : 'grab'
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      >
        <defs>
          {/* Neon Route Glow Filter */}
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Intense Particle Core Glow Filter */}
          <filter id="core-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Bastion Cyan Glow */}
          <filter id="cyan-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Text Shadow for High-Contrast Labels */}
          <filter id="text-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.95" />
          </filter>

          {/* Ocean Radial Glow */}
          <radialGradient id="ocean-glow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0b1329" />
            <stop offset="100%" stopColor="#060911" />
          </radialGradient>
        </defs>

        {/* 1. Deep Ocean Background Canvas */}
        <rect x="-100" y="-50" width="1200" height="600" fill="url(#ocean-glow)" />

        {/* 2. Cyber Longitude / Latitude Coordinate Grid */}
        <g stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.6" strokeDasharray="3 4">
          {/* Latitude Lines */}
          <line x1="0" y1="100" x2="1000" y2="100" />
          <line x1="0" y1="180" x2="1000" y2="180" />
          <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.9" /> {/* Equator */}
          <line x1="0" y1="320" x2="1000" y2="320" />
          <line x1="0" y1="400" x2="1000" y2="400" />

          {/* Longitude Lines */}
          <line x1="166" y1="0" x2="166" y2="500" />
          <line x1="333" y1="0" x2="333" y2="500" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.9" /> {/* Prime Meridian */}
          <line x1="666" y1="0" x2="666" y2="500" />
          <line x1="833" y1="0" x2="833" y2="500" />
        </g>

        {/* 3. Global Country Vector Landmasses */}
        {visibleLayers.borders !== false && (
          <g id="world-countries-layer">
            {WORLD_COUNTRIES_SVG.map(c => {
              const isSelected = selectedCountry?.iso3 === c.id;
              return (
                <path
                  key={c.id}
                  d={c.d}
                  fill={isSelected ? 'rgba(0, 229, 255, 0.22)' : 'rgba(21, 32, 54, 0.88)'}
                  stroke={isSelected ? '#00e5ff' : 'rgba(71, 85, 105, 0.45)'}
                  strokeWidth={isSelected ? 1.6 : 0.65}
                  style={{
                    transition: 'fill 0.2s ease, stroke 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCountryClick(c);
                  }}
                >
                  <title>{c.name}</title>
                </path>
              );
            })}
          </g>
        )}

        {/* 4. Attack Routes (Curved Geodesic Neon Paths) */}
        {visibleLayers.routes !== false && (
          <g id="attack-routes-layer">
            {attackRoutes.map(route => {
              const isHovered = hoveredEntity?.id === route.id;
              const isSelected = selectedEvent?.id === route.id;

              return (
                <g
                  key={route.id}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePopup({ type: 'route', data: route, x: (route.x1 + route.x2) / 2, y: (route.y1 + route.y2) / 2 - 25 });
                    if (onSelectEvent) onSelectEvent(route.event);
                  }}
                >
                  {/* Broad Glowing Neon Aura */}
                  <path
                    d={route.pathD}
                    fill="none"
                    stroke={route.color}
                    strokeWidth={isSelected ? 7.5 : 5.0}
                    strokeOpacity={isSelected ? 0.75 : 0.4}
                    strokeLinecap="round"
                    filter="url(#neon-glow)"
                  />

                  {/* Sharp Bright Core Trajectory Line */}
                  <path
                    d={route.pathD}
                    fill="none"
                    stroke={route.color}
                    strokeWidth={isSelected ? 2.8 : 2.0}
                    strokeOpacity={0.95}
                    strokeLinecap="round"
                  />

                  {/* Streaming Data Packet Pulses along Path (Dashed Dasharray) */}
                  <path
                    d={route.pathD}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 3.0 : 2.2}
                    strokeLinecap="round"
                    strokeDasharray="9 22"
                    strokeOpacity="0.85"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="62"
                      to="0"
                      dur={route.speed}
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Animated Missile Particle 1 */}
                  <circle r="4.0" fill="#ffffff" filter="url(#core-glow)">
                    <animateMotion
                      path={route.pathD}
                      dur={route.speed}
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Animated Missile Particle 2 (Offset by 50%) */}
                  <circle r="3.2" fill={route.color} filter="url(#core-glow)">
                    <animateMotion
                      path={route.pathD}
                      dur={route.speed}
                      begin={`${parseFloat(route.speed) * 0.5}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
          </g>
        )}

        {/* 5. Target Infrastructure Bastions (Teal / Cyan Shield Rings) */}
        {visibleLayers.targets !== false && (
          <g id="target-nodes-layer">
            {targetNodes.map(target => (
              <g
                key={target.id}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePopup({ type: 'target', data: target, x: target.x, y: target.y });
                }}
              >
                {/* Outer Defense Halo Animation */}
                <circle
                  cx={target.x}
                  cy={target.y}
                  r="9"
                  fill="rgba(0, 229, 255, 0.18)"
                  stroke="#00e5ff"
                  strokeWidth="1.5"
                  filter="url(#cyan-glow)"
                >
                  <animate attributeName="r" values="7;15;7" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.9;0.15;0.9" dur="2.4s" repeatCount="indefinite" />
                </circle>

                {/* Solid Bastion Core Dot */}
                <circle
                  cx={target.x}
                  cy={target.y}
                  r="4.2"
                  fill="#00e5ff"
                  stroke="#ffffff"
                  strokeWidth="1.6"
                />

                {/* Target Hub City Label */}
                <text
                  x={target.x}
                  y={target.y + 15}
                  textAnchor="middle"
                  fill="#67e8f9"
                  fontSize="8.5"
                  fontWeight="800"
                  filter="url(#text-shadow)"
                  letterSpacing="0.02em"
                >
                  {target.city}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* 6. Threat Origin Beacons (Red / Amber Pulsing Threat Blips) */}
        {visibleLayers.markers !== false && (
          <g id="origin-nodes-layer">
            {originNodes.map(origin => {
              const sevColor = origin.severity === 'critical' ? '#ff3366' : (SEVERITY_COLORS[origin.severity] || '#f97316');

              return (
                <g
                  key={origin.id}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePopup({ type: 'origin', data: origin, x: origin.x, y: origin.y });
                  }}
                >
                  {/* Pulsing Radar Aura */}
                  <circle
                    cx={origin.x}
                    cy={origin.y}
                    r="10"
                    fill={`${sevColor}26`}
                    stroke={sevColor}
                    strokeWidth="1.6"
                    filter="url(#neon-glow)"
                  >
                    <animate attributeName="r" values="6;16;6" dur="1.9s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.95;0.1;0.95" dur="1.9s" repeatCount="indefinite" />
                  </circle>

                  {/* Origin Beacon Core */}
                  <circle
                    cx={origin.x}
                    cy={origin.y}
                    r="4.5"
                    fill={sevColor}
                    stroke="#ffffff"
                    strokeWidth="1.6"
                  />

                  {/* Threat City Label */}
                  <text
                    x={origin.x}
                    y={origin.y - 9}
                    textAnchor="middle"
                    fill="#fca5a5"
                    fontSize="9.0"
                    fontWeight="800"
                    filter="url(#text-shadow)"
                    letterSpacing="0.02em"
                  >
                    {origin.city}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {/* ─── Interactive Telemetry Popup Card ─── */}
      {activePopup && (
        <div
          style={{
            position: 'absolute',
            left: `${((activePopup.x - viewBox.x) / viewBox.w) * 100}%`,
            top: `${((activePopup.y - viewBox.y) / viewBox.h) * 100}%`,
            transform: 'translate(-50%, -105%)',
            background: 'rgba(10, 16, 32, 0.95)',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 229, 255, 0.25)',
            borderRadius: '10px',
            padding: '12px 14px',
            minWidth: '270px',
            maxWidth: '320px',
            zIndex: 40,
            backdropFilter: 'blur(8px)',
            color: '#f8fafc',
            fontSize: '11px',
            lineHeight: 1.4
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
            <span style={{
              fontWeight: '800',
              fontSize: '12px',
              color: activePopup.type === 'target' ? '#00e5ff' : '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              {activePopup.type === 'route' ? '📡 Active Data Transfer Stream' : (activePopup.type === 'target' ? '🛡️ Target Bastion Hub' : '⚠️ Threat Origin Beacon')}
            </span>
            <button
              type="button"
              onClick={() => setActivePopup(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Route Popup Content */}
          {activePopup.type === 'route' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 229, 255, 0.08)', padding: '5px 8px', borderRadius: '6px', marginBottom: '6px', fontWeight: '700', fontSize: '11.5px', color: '#38bdf8' }}>
                <span>{activePopup.data.sourceCity} ({activePopup.data.sourceCountry})</span>
                <span style={{ color: '#f43f5e' }}>➔</span>
                <span>{activePopup.data.destCity} ({activePopup.data.destCountry})</span>
              </div>

              {activePopup.data.dataTransfer && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '4px 6px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>Volume</div>
                    <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#fca5a5' }}>
                      {activePopup.data.dataTransfer.bytes_transferred || activePopup.data.dataTransfer.bytesTransferred || 'Live Stream'}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '4px 6px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>Transfer Rate</div>
                    <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#38bdf8' }}>
                      {activePopup.data.dataTransfer.transfer_rate || activePopup.data.dataTransfer.transferRate || 'Continuous'}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '4px', fontSize: '10.5px' }}>
                <strong style={{ color: '#94a3b8' }}>Actor:</strong> <span style={{ color: '#fde047', fontWeight: '700' }}>{activePopup.data.threatActor}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#cbd5e1', fontStyle: 'italic', background: 'rgba(0,0,0,0.25)', padding: '4px 6px', borderRadius: '4px' }}>
                "{activePopup.data.dataTransfer?.payload_type || activePopup.data.dataTransfer?.payloadType || 'Adversary Command & Control Flow'}"
              </div>
            </div>
          )}

          {/* Node Popup Content */}
          {activePopup.type !== 'route' && (
            <div>
              <div style={{ marginBottom: '4px' }}>
                <strong style={{ color: '#94a3b8' }}>Location:</strong> <span>{activePopup.data.city}, {activePopup.data.country}</span>
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong style={{ color: '#94a3b8' }}>IP Address:</strong> <code style={{ color: '#00e5ff', background: 'rgba(0,0,0,0.4)', padding: '1px 4px', borderRadius: '3px' }}>{activePopup.data.ip}</code>
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong style={{ color: '#94a3b8' }}>Affiliated Actor:</strong> <span style={{ color: '#fca5a5', fontWeight: '700' }}>{activePopup.data.threatActor}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default MapLibreContainer;
