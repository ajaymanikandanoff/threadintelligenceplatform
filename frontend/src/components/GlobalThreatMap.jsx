import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Radio,
  ShieldAlert,
  Flame,
  Info,
  Layers,
  Activity,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import MapLibreContainer from './threat-map/MapLibreContainer';
import ThreatMapLegend from './threat-map/ThreatMapLegend';
import ThreatMapControls from './threat-map/ThreatMapControls';
import CountryIntelligencePanel from './threat-map/CountryIntelligencePanel';
import ThreatOriginRanking from './threat-map/ThreatOriginRanking';
import {
  VERIFIED_THREAT_EVENTS,
  VERIFIED_COUNTRY_PROFILES,
  SEVERITY_COLORS
} from './threat-map/threatData';

export default function GlobalThreatMap({ onSelectCountry: parentOnSelectCountry }) {
  // Map Container Ref for Controls (Zoom In/Out, Reset, FlyTo)
  const mapRef = useRef(null);
  const containerWrapperRef = useRef(null);

  // States
  const [selectedCountry, setSelectedCountry] = useState(VERIFIED_COUNTRY_PROFILES['RUS']); // Default: Russia
  const [selectedEvent, setSelectedEvent] = useState(VERIFIED_THREAT_EVENTS[0]); // Default: Volt Typhoon event
  const [activeSeverity, setActiveSeverity] = useState('ALL');
  const [timeRange, setTimeRange] = useState('24H');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveCounter, setLiveCounter] = useState(14820);
  const [visibleLayers, setVisibleLayers] = useState({
    routes: true,
    markers: true,
    borders: true
  });

  // Simulated live event feed increment
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 4) + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!containerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      containerWrapperRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Handle Layer Toggle
  const handleToggleLayer = (layerKey) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  // Country Selection
  const handleCountrySelect = (countryProfile) => {
    setSelectedCountry(countryProfile);
    if (countryProfile.centroid && mapRef.current) {
      mapRef.current.flyToCoords(countryProfile.centroid[0], countryProfile.centroid[1], 3.8);
    }
    if (parentOnSelectCountry) {
      parentOnSelectCountry(countryProfile);
    }
  };

  // Event Selection
  const handleEventSelect = (evt) => {
    setSelectedEvent(evt);
    // Find country profile if available
    const iso3 = evt.sourceGeo?.iso3;
    if (iso3 && VERIFIED_COUNTRY_PROFILES[iso3]) {
      setSelectedCountry(VERIFIED_COUNTRY_PROFILES[iso3]);
    }
    if (mapRef.current && evt.sourceGeo) {
      mapRef.current.flyToCoords(evt.sourceGeo.lng, evt.sourceGeo.lat, 3.5);
    }
  };

  return (
    <div
      ref={containerWrapperRef}
      style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: isFullscreen ? '24px' : '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* ─── Top SOC Header Row ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Globe size={22} color="var(--accent)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Global Cyber Threat Intelligence & Geospatial Attack Map
              </h2>
              <span style={{
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#f43f5e',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10.5px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Flame size={12} />
                REAL WORLD MAPLIBRE GL
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
              Real-world OpenStreetMap cartography, geodesic attack routes, and evidence-verified threat actor attribution.
            </p>
          </div>
        </div>

        {/* Live SOC Telemetry Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-overlay)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '5px 14px', fontSize: '11.5px', color: 'var(--text-secondary)'
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981'
            }} />
            <span>Telemetry Feed:</span>
            <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              {liveCounter.toLocaleString()} Events Analyzed
            </strong>
          </div>
        </div>
      </div>

      {/* ─── 70% / 30% Main Visualization Split Layout ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)',
        gap: '18px',
        alignItems: 'stretch',
        minHeight: isFullscreen ? 'calc(100vh - 180px)' : '540px'
      }}>
        {/* LEFT COLUMN: ~70% Interactive MapLibre GL World Map */}
        <div style={{
          position: 'relative',
          borderRadius: '14px',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.8), 0 8px 30px rgba(0, 0, 0, 0.5)',
          background: '#06090f',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Map Controls (Zoom In/Out, Reset, Fullscreen, Layers, Time Range) */}
          <ThreatMapControls
            onZoomIn={() => mapRef.current?.zoomIn()}
            onZoomOut={() => mapRef.current?.zoomOut()}
            onResetView={() => mapRef.current?.resetView()}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            activeTimeRange={timeRange}
            onChangeTimeRange={setTimeRange}
            visibleLayers={visibleLayers}
            onToggleLayer={handleToggleLayer}
          />

          {/* MapLibre GL Canvas Container */}
          <MapLibreContainer
            ref={mapRef}
            selectedCountry={selectedCountry}
            onSelectCountry={handleCountrySelect}
            selectedEvent={selectedEvent}
            onSelectEvent={handleEventSelect}
            activeSeverity={activeSeverity}
            visibleLayers={visibleLayers}
            events={VERIFIED_THREAT_EVENTS}
          />

          {/* On-Map Severity & Marker Legend */}
          <ThreatMapLegend
            activeSeverity={activeSeverity}
            onSelectSeverity={setActiveSeverity}
          />
        </div>

        {/* RIGHT COLUMN: ~30% Redesigned Intelligence Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CountryIntelligencePanel
            selectedCountry={selectedCountry}
            selectedEvent={selectedEvent}
            onSelectEvent={handleEventSelect}
            allEvents={VERIFIED_THREAT_EVENTS}
          />
        </div>
      </div>

      {/* ─── Bottom Section: Top Threat Origin Hubs & Infrastructure Ranking ─── */}
      <ThreatOriginRanking
        countryProfiles={VERIFIED_COUNTRY_PROFILES}
        selectedCountry={selectedCountry}
        onSelectCountry={handleCountrySelect}
        timeRange={timeRange}
      />
    </div>
  );
}
