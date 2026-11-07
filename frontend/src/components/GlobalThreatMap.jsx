import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Globe,
  Radio,
  ShieldAlert,
  Flame,
  Info,
  Layers,
  Activity,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Zap,
  Database,
  ArrowRight
} from 'lucide-react';
import MapLibreContainer from './threat-map/MapLibreContainer';
import ThreatMapBottomToolbar from './threat-map/ThreatMapBottomToolbar';
import CountryIntelligencePanel from './threat-map/CountryIntelligencePanel';
import ThreatOriginRanking from './threat-map/ThreatOriginRanking';
import DataTransferPanel from './threat-map/DataTransferPanel';
import {
  VERIFIED_THREAT_EVENTS,
  VERIFIED_COUNTRY_PROFILES,
  SEVERITY_COLORS
} from './threat-map/threatData';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function GlobalThreatMap({ onSelectCountry: parentOnSelectCountry }) {
  const mapRef = useRef(null);
  const containerWrapperRef = useRef(null);

  // States
  const [selectedCountry, setSelectedCountry] = useState(VERIFIED_COUNTRY_PROFILES['RUS']); // Default: Russia
  const [selectedEvent, setSelectedEvent] = useState(VERIFIED_THREAT_EVENTS[0]); // Default: Volt Typhoon
  const [activeSeverity, setActiveSeverity] = useState('ALL');
  const [timeRange, setTimeRange] = useState('24H');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveCounter, setLiveCounter] = useState(14820);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendLive, setIsBackendLive] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState('data_transfer'); // 'data_transfer' | 'country_intel'

  // GeoJSON & Telemetry state from backend
  const [nodesGeoJson, setNodesGeoJson] = useState(null);
  const [routesGeoJson, setRoutesGeoJson] = useState(null);
  const [densityGeoJson, setDensityGeoJson] = useState(null);
  const [countryProfiles, setCountryProfiles] = useState(VERIFIED_COUNTRY_PROFILES);
  const [threatEvents, setThreatEvents] = useState(VERIFIED_THREAT_EVENTS);

  // Visible Layers toggle state
  const [visibleLayers, setVisibleLayers] = useState({
    routes: true,
    markers: true,
    targets: true,
    borders: true,
    heatmap: false
  });

  // Fetch Threat Map Intelligence from Backend
  const fetchThreatMapData = useCallback(async () => {
    setIsLoading(true);
    try {
      const qParams = `time_range=${encodeURIComponent(timeRange)}&severity=${encodeURIComponent(activeSeverity)}`;
      
      const [overviewRes, nodesRes, routesRes, countriesRes, densityRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/threat-map/overview?${qParams}`),
        fetch(`${API_BASE}/api/threat-map/nodes?${qParams}`),
        fetch(`${API_BASE}/api/threat-map/routes?${qParams}`),
        fetch(`${API_BASE}/api/threat-map/countries`),
        fetch(`${API_BASE}/api/threat-map/density?${qParams}`)
      ]);

      let backendOperational = false;

      // Overview Telemetry
      if (overviewRes.status === 'fulfilled' && overviewRes.value.ok) {
        const overview = await overviewRes.value.json();
        if (overview.total_events_observed) {
          setLiveCounter(overview.total_events_observed);
        }
        backendOperational = true;
      }

      // Nodes GeoJSON
      if (nodesRes.status === 'fulfilled' && nodesRes.value.ok) {
        const nodesData = await nodesRes.value.json();
        if (nodesData && nodesData.features) {
          setNodesGeoJson(nodesData);
          backendOperational = true;
        }
      }

      // Routes GeoJSON
      if (routesRes.status === 'fulfilled' && routesRes.value.ok) {
        const routesData = await routesRes.value.json();
        if (routesData && routesData.features) {
          setRoutesGeoJson(routesData);
          backendOperational = true;
        }
      }

      // Country Profiles
      if (countriesRes.status === 'fulfilled' && countriesRes.value.ok) {
        const countriesData = await countriesRes.value.json();
        const rawMap = countriesData.countries || countriesData;
        if (rawMap && typeof rawMap === 'object') {
          const normalized = {};
          Object.entries(rawMap).forEach(([k, c]) => {
            if (c && typeof c === 'object' && (c.name || c.iso3)) {
              normalized[k] = {
                ...c,
                threatLevel: c.threatLevel || c.threat_level || 'Monitored Region',
                threatScore: c.threatScore ?? c.threat_score ?? 50,
                observedEvents: c.observedEvents ?? c.observed_events ?? 1,
                primaryVectors: c.primaryVectors || c.primary_vectors || [],
                verifiedActors: c.verifiedActors || c.verified_actors || [],
                malwareFamilies: c.malwareFamilies || c.malware_families || [],
                mitreTechniques: c.mitreTechniques || c.mitre_techniques || [],
                affectedSectors: c.affectedSectors || c.affected_sectors || [],
                evidenceAttribution: c.evidenceAttribution || c.evidence_attribution || '',
                sources: c.sources || []
              };
            }
          });
          if (Object.keys(normalized).length > 0) {
            setCountryProfiles(normalized);
            if (selectedCountry && normalized[selectedCountry.iso3]) {
              setSelectedCountry(normalized[selectedCountry.iso3]);
            }
            backendOperational = true;
          }
        }
      }

      // Density Heatmap GeoJSON
      if (densityRes.status === 'fulfilled' && densityRes.value.ok) {
        const densityData = await densityRes.value.json();
        if (densityData && densityData.features) {
          setDensityGeoJson(densityData);
        }
      }

      setIsBackendLive(backendOperational);
    } catch (err) {
      console.warn('Threat Map backend fetch fallback to verified static dataset:', err);
      setIsBackendLive(false);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, activeSeverity]);

  // Initial and reactive fetch on filter change
  useEffect(() => {
    fetchThreatMapData();
  }, [fetchThreatMapData]);

  // Periodic heartbeat telemetry counter increment
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen Handlers
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
    const iso3 = evt.sourceGeo?.iso3;
    if (iso3 && countryProfiles[iso3]) {
      setSelectedCountry(countryProfiles[iso3]);
    }
    if (mapRef.current && evt.sourceGeo) {
      mapRef.current.flyToCoords(evt.sourceGeo.lng, evt.sourceGeo.lat, 3.8);
    }
  };

  // Trace Data Flow on Globe
  const handleTraceRoute = (evt) => {
    setSelectedEvent(evt);
    const srcGeo = evt.sourceGeo || evt.source_geo;
    const dstGeo = evt.destGeo || evt.dest_geo;
    const iso3 = srcGeo?.iso3;
    if (iso3 && countryProfiles[iso3]) {
      setSelectedCountry(countryProfiles[iso3]);
    }
    if (mapRef.current && srcGeo && dstGeo) {
      const minLng = Math.min(srcGeo.lng, dstGeo.lng);
      const maxLng = Math.max(srcGeo.lng, dstGeo.lng);
      const minLat = Math.min(srcGeo.lat, dstGeo.lat);
      const maxLat = Math.max(srcGeo.lat, dstGeo.lat);

      if (maxLng - minLng > 180) {
        // Trans-pacific or wide trajectory: frame globally
        if (mapRef.current.resetView) {
          mapRef.current.resetView();
        } else if (mapRef.current.flyToCoords) {
          mapRef.current.flyToCoords(0, 30, 1.8);
        }
      } else if (mapRef.current.fitBoundsCoords) {
        mapRef.current.fitBoundsCoords([[minLng, minLat], [maxLng, maxLat]]);
      } else if (mapRef.current.flyToCoords) {
        const midLng = (srcGeo.lng + dstGeo.lng) / 2;
        const midLat = (srcGeo.lat + dstGeo.lat) / 2;
        mapRef.current.flyToCoords(midLng, midLat, 2.8);
      }
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Global Cyber Threat Intelligence & Geospatial Attack Map
              </h2>
              <span style={{
                background: 'rgba(0, 229, 255, 0.15)',
                color: '#00e5ff',
                border: '1px solid rgba(0, 229, 255, 0.35)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10.5px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Flame size={12} />
                LIVE CYBER ATTACK MAP
              </span>

              {isBackendLive ? (
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  FASTAPI LIVE API
                </span>
              ) : (
                <span style={{
                  background: 'rgba(234, 179, 8, 0.15)',
                  color: '#eab308',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <AlertTriangle size={11} />
                  STATIC TELEMETRY FALLBACK
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
              Real-world dark GIS cartography, geodesic attack routes, node clustering, and evidence-verified threat attribution.
            </p>
          </div>
        </div>

        {/* Live SOC Telemetry Status & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchThreatMapData}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              cursor: isLoading ? 'wait' : 'pointer'
            }}
            title="Refresh Threat Intelligence Telemetry"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} color="var(--accent)" />
            <span>Sync Live Telemetry</span>
          </button>

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
            <span>Global Telemetry Feed:</span>
            <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              {liveCounter.toLocaleString()} Events
            </strong>
          </div>
        </div>
      </div>

      {/* ─── Global Data Transfer KPI Ribbon ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px'
      }}>
        <div style={{
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Database size={16} color="#f43f5e" />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Exfiltrated Volume
            </div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#fca5a5', fontFamily: 'var(--font-mono)' }}>
              280.6 MB
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 229, 255, 0.08)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'rgba(0, 229, 255, 0.15)', border: '1px solid rgba(0, 229, 255, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={16} color="#00e5ff" />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Transfer Pipelines
            </div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              8 Streaming Routes
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Defended & Sinkholed
            </div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              1 Blocked (18 Gbps)
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(234, 179, 8, 0.08)',
          border: '1px solid rgba(234, 179, 8, 0.25)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={16} color="#eab308" />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Peak Exfiltration Speed
            </div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#fde047', fontFamily: 'var(--font-mono)' }}>
              4.5 MB/s (LockBit)
            </div>
          </div>
        </div>
      </div>

      {/* ─── 70% / 30% Main Visualization Split Layout ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 390px',
        gap: '16px',
        alignItems: 'stretch',
        height: isFullscreen ? 'calc(100vh - 170px)' : '620px',
        minHeight: '560px'
      }}>
        {/* LEFT COLUMN: ~70% Interactive Map Canvas */}
        <div style={{
          position: 'relative',
          borderRadius: '14px',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.8), 0 8px 30px rgba(0, 0, 0, 0.5)',
          background: '#070b14',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0
        }}>
          {/* Main Map Container (100% Unobstructed Full View) */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', height: '100%' }}>
            <MapLibreContainer
              ref={mapRef}
              selectedCountry={selectedCountry}
              onSelectCountry={handleCountrySelect}
              selectedEvent={selectedEvent}
              onSelectEvent={handleEventSelect}
              activeSeverity={activeSeverity}
              visibleLayers={visibleLayers}
              events={threatEvents}
              nodesGeoJson={nodesGeoJson}
              routesGeoJson={routesGeoJson}
              densityGeoJson={densityGeoJson}
            />
          </div>

          {/* Docked Options Toolbar - Placed Below the Map (Keela) */}
          <ThreatMapBottomToolbar
            onZoomIn={() => mapRef.current?.zoomIn()}
            onZoomOut={() => mapRef.current?.zoomOut()}
            onResetView={() => mapRef.current?.resetView()}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            activeTimeRange={timeRange}
            onChangeTimeRange={setTimeRange}
            visibleLayers={visibleLayers}
            onToggleLayer={handleToggleLayer}
            activeSeverity={activeSeverity}
            onSelectSeverity={setActiveSeverity}
          />
        </div>

        {/* RIGHT COLUMN: ~30% Dual-Mode Panel (Data Transfer vs Country Intel) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          gap: '10px',
          overflow: 'hidden'
        }}>
          {/* Sub-tab switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '4px',
            gap: '4px'
          }}>
            <button
              type="button"
              onClick={() => setActiveRightTab('data_transfer')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '7px 10px',
                borderRadius: '7px',
                border: 'none',
                background: activeRightTab === 'data_transfer' ? 'rgba(0, 229, 255, 0.16)' : 'transparent',
                color: activeRightTab === 'data_transfer' ? '#00e5ff' : 'var(--text-secondary)',
                fontSize: '11.5px',
                fontWeight: activeRightTab === 'data_transfer' ? '700' : '500',
                cursor: 'pointer',
                outline: activeRightTab === 'data_transfer' ? '1px solid rgba(0, 229, 255, 0.4)' : 'none'
              }}
            >
              <Zap size={13} color={activeRightTab === 'data_transfer' ? '#00e5ff' : 'currentColor'} />
              <span>Data Transfers ({threatEvents.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRightTab('country_intel')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '7px 10px',
                borderRadius: '7px',
                border: 'none',
                background: activeRightTab === 'country_intel' ? 'rgba(0, 229, 255, 0.16)' : 'transparent',
                color: activeRightTab === 'country_intel' ? '#00e5ff' : 'var(--text-secondary)',
                fontSize: '11.5px',
                fontWeight: activeRightTab === 'country_intel' ? '700' : '500',
                cursor: 'pointer',
                outline: activeRightTab === 'country_intel' ? '1px solid rgba(0, 229, 255, 0.4)' : 'none'
              }}
            >
              <Globe size={13} color={activeRightTab === 'country_intel' ? '#00e5ff' : 'currentColor'} />
              <span>Country Intel</span>
            </button>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            {activeRightTab === 'data_transfer' ? (
              <DataTransferPanel
                events={threatEvents}
                selectedEvent={selectedEvent}
                onSelectRoute={handleTraceRoute}
              />
            ) : (
              <CountryIntelligencePanel
                selectedCountry={selectedCountry}
                selectedEvent={selectedEvent}
                onSelectEvent={handleEventSelect}
                allEvents={threatEvents}
              />
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: Top Threat Origin Hubs & Infrastructure Density ─── */}
      <ThreatOriginRanking
        countryProfiles={countryProfiles}
        selectedCountry={selectedCountry}
        onSelectCountry={handleCountrySelect}
        timeRange={timeRange}
      />
    </div>
  );
}
