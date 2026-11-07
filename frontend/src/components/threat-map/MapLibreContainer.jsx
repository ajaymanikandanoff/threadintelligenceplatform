import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  buildAttackRoutesGeoJson,
  buildThreatMarkersGeoJson,
  VERIFIED_THREAT_EVENTS,
  VERIFIED_COUNTRY_PROFILES,
  SEVERITY_COLORS
} from './threatData';

const BASE_TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const REF_TILE_URL = import.meta.env.VITE_MAP_REF_URL || 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}';
const MAP_ATTRIBUTION = import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; Esri &copy; OpenStreetMap contributors';

const MapLibreContainer = forwardRef(function MapLibreContainer({
  selectedCountry,
  onSelectCountry,
  selectedEvent,
  onSelectEvent,
  activeSeverity = 'ALL',
  visibleLayers = { routes: true, markers: true, targets: true, borders: true, heatmap: false },
  events = VERIFIED_THREAT_EVENTS,
  nodesGeoJson = null,
  routesGeoJson = null,
  densityGeoJson = null
}, ref) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(performance.now());
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter fallback events if custom GeoJSON is not provided
  const filteredEvents = events.filter(e => {
    if (activeSeverity === 'ALL') return true;
    return e.severity?.toLowerCase() === activeSeverity.toLowerCase();
  });

  // Imperative handle for controls
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (mapRef.current) mapRef.current.zoomIn({ duration: 300 });
    },
    zoomOut: () => {
      if (mapRef.current) mapRef.current.zoomOut({ duration: 300 });
    },
    resetView: () => {
      if (mapRef.current) {
        try {
          mapRef.current.fitBounds([[-125, -35], [152, 62]], {
            padding: 40,
            duration: 800
          });
        } catch (e) {
          mapRef.current.flyTo({
            center: [15, 25],
            zoom: 1.45,
            pitch: 0,
            bearing: 0,
            duration: 800
          });
        }
      }
    },
    fitBoundsCoords: (bounds) => {
      if (mapRef.current && bounds) {
        try {
          mapRef.current.fitBounds(bounds, {
            padding: 90,
            maxZoom: 4,
            duration: 1000
          });
        } catch (err) {
          console.warn('fitBounds error:', err);
        }
      }
    },
    flyToCoords: (lng, lat, zoom = 4) => {
      if (mapRef.current && lng != null && lat != null) {
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom,
          duration: 1200
        });
      }
    }
  }));

  // Helper to split markers GeoJSON into Origin Nodes and Target Infrastructure
  const getPartitionedNodes = () => {
    let allFeatures = [];
    if (nodesGeoJson && nodesGeoJson.features) {
      allFeatures = nodesGeoJson.features;
    } else {
      const generated = buildThreatMarkersGeoJson(filteredEvents);
      allFeatures = generated.features;
    }

    const originFeatures = allFeatures.filter(f => {
      const t = f.properties?.nodeType || f.properties?.node_type;
      return t !== 'TARGET';
    });
    const targetFeatures = allFeatures.filter(f => {
      const t = f.properties?.nodeType || f.properties?.node_type;
      return t === 'TARGET';
    });

    return {
      origins: { type: 'FeatureCollection', features: originFeatures },
      targets: { type: 'FeatureCollection', features: targetFeatures }
    };
  };

  const getRoutesData = () => {
    if (routesGeoJson && routesGeoJson.features && routesGeoJson.features.length > 0) {
      return routesGeoJson;
    }
    return buildAttackRoutesGeoJson(filteredEvents);
  };

  const getDensityData = () => {
    if (densityGeoJson && densityGeoJson.features) {
      return densityGeoJson;
    }
    return {
      type: 'FeatureCollection',
      features: filteredEvents.map(e => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [e.sourceGeo?.lng || 0, e.sourceGeo?.lat || 0]
        },
        properties: {
          weight: e.severity === 'critical' ? 1.0 : e.severity === 'high' ? 0.75 : 0.4
        }
      }))
    };
  };

  // Initialize MapLibre instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialNodes = getPartitionedNodes();
    const initialRoutes = getRoutesData();
    const initialDensity = getDensityData();

    // MapLibre instance with BOTH base raster and reference raster inside the background style!
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          'esri-dark-base': {
            type: 'raster',
            tiles: [BASE_TILE_URL],
            tileSize: 256,
            attribution: MAP_ATTRIBUTION
          },
          'esri-dark-ref': {
            type: 'raster',
            tiles: [REF_TILE_URL],
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'esri-dark-base-tiles',
            type: 'raster',
            source: 'esri-dark-base',
            minzoom: 0,
            maxzoom: 16
          },
          {
            id: 'esri-dark-ref-tiles',
            type: 'raster',
            source: 'esri-dark-ref',
            minzoom: 0,
            maxzoom: 16,
            paint: {
              'raster-opacity': 0.65
            }
          }
        ]
      },
      center: [15, 25],
      zoom: 1.45,
      minZoom: 1,
      maxZoom: 14,
      pitchWithRotate: false,
      attributionControl: false
    });

    mapRef.current = map;

    map.on('load', () => {
      // 1. World Country Boundaries GeoJSON Source
      map.addSource('world-countries', {
        type: 'geojson',
        data: '/countries.geojson'
      });

      // Country Fills Layer (Transparent for hover & click detection)
      map.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: 'world-countries',
        paint: {
          'fill-color': '#00e5ff',
          'fill-opacity': 0.01
        }
      });

      // Country Boundaries Layer (Dark SOC styling)
      map.addLayer({
        id: 'countries-boundary',
        type: 'line',
        source: 'world-countries',
        paint: {
          'line-color': 'rgba(56, 189, 248, 0.25)',
          'line-width': 0.85,
          'line-opacity': 0.85
        }
      });

      // Country Highlight Outline
      map.addLayer({
        id: 'countries-highlight',
        type: 'line',
        source: 'world-countries',
        paint: {
          'line-color': '#00e5ff',
          'line-width': 2.2,
          'line-opacity': 0.95
        },
        filter: ['==', 'id', '']
      });

      // 2. Threat Density Heatmap Source & Layer
      map.addSource('threat-density', {
        type: 'geojson',
        data: initialDensity
      });

      map.addLayer({
        id: 'threat-density-heatmap',
        type: 'heatmap',
        source: 'threat-density',
        layout: {
          visibility: visibleLayers.heatmap ? 'visible' : 'none'
        },
        paint: {
          'heatmap-weight': ['coalesce', ['get', 'weight'], 0.5],
          'heatmap-intensity': 1.2,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 229, 255, 0)',
            0.2, 'rgba(0, 229, 255, 0.25)',
            0.4, 'rgba(234, 179, 8, 0.45)',
            0.7, 'rgba(249, 115, 22, 0.75)',
            1.0, 'rgba(244, 63, 94, 0.95)'
          ],
          'heatmap-radius': 35,
          'heatmap-opacity': 0.75
        }
      });

      // 3. Attack Routes Source & Layers (Curved Geodesic LineStrings)
      map.addSource('attack-routes', {
        type: 'geojson',
        data: initialRoutes
      });

      // Outer Glowing Path (Vivid and wide for high visibility)
      map.addLayer({
        id: 'attack-routes-glow',
        type: 'line',
        source: 'attack-routes',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          visibility: visibleLayers.routes !== false ? 'visible' : 'none'
        },
        paint: {
          'line-color': [
            'match',
            ['downcase', ['coalesce', ['get', 'severity'], 'critical']],
            'critical', '#ff3366',
            'high', '#f97316',
            'medium', '#eab308',
            'low', '#00e5ff',
            '#00e5ff'
          ],
          'line-width': 7.5,
          'line-opacity': 0.85,
          'line-blur': 2.0
        }
      });

      // Inner Core Line (Sharp, bright white/neon)
      map.addLayer({
        id: 'attack-routes-core',
        type: 'line',
        source: 'attack-routes',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          visibility: visibleLayers.routes !== false ? 'visible' : 'none'
        },
        paint: {
          'line-color': '#ffffff',
          'line-width': 2.6,
          'line-opacity': 0.95
        }
      });

      // 4. ANIMATED ATTACK FLOW BEACONS (Missiles / Packets traveling along the trajectory!)
      map.addSource('attack-flow-beacons', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Moving Aura
      map.addLayer({
        id: 'attack-flow-aura',
        type: 'circle',
        source: 'attack-flow-beacons',
        layout: {
          visibility: visibleLayers.routes !== false ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': 10,
          'circle-color': ['coalesce', ['get', 'color'], '#00e5ff'],
          'circle-opacity': 0.7,
          'circle-blur': 0.7
        }
      });

      // Moving Core Missile Head
      map.addLayer({
        id: 'attack-flow-core',
        type: 'circle',
        source: 'attack-flow-beacons',
        layout: {
          visibility: visibleLayers.routes !== false ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': 4.5,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-stroke-color': ['coalesce', ['get', 'color'], '#00e5ff']
        }
      });

      // 5. Threat Origin Nodes (Unclustered for 100% individual visibility)
      map.addSource('threat-origin-nodes', {
        type: 'geojson',
        data: initialNodes.origins
      });

      // Origin Node Outer Pulsing Halo
      map.addLayer({
        id: 'threat-origin-halo',
        type: 'circle',
        source: 'threat-origin-nodes',
        layout: {
          visibility: visibleLayers.markers !== false ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': 14,
          'circle-color': [
            'match',
            ['downcase', ['coalesce', ['get', 'severity'], 'critical']],
            'critical', '#f43f5e',
            'high', '#f97316',
            'medium', '#eab308',
            'low', '#00e5ff',
            '#00e5ff'
          ],
          'circle-opacity': 0.35,
          'circle-stroke-width': 1.8,
          'circle-stroke-color': [
            'match',
            ['downcase', ['coalesce', ['get', 'severity'], 'critical']],
            'critical', '#f43f5e',
            'high', '#f97316',
            'medium', '#eab308',
            'low', '#00e5ff',
            '#00e5ff'
          ]
        }
      });

      // Origin Node Center Circle (Neon core with white border)
      map.addLayer({
        id: 'threat-origin-center',
        type: 'circle',
        source: 'threat-origin-nodes',
        layout: {
          visibility: visibleLayers.markers !== false ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': 6.5,
          'circle-color': [
            'match',
            ['downcase', ['coalesce', ['get', 'severity'], 'critical']],
            'critical', '#f43f5e',
            'high', '#f97316',
            'medium', '#eab308',
            'low', '#00e5ff',
            '#00e5ff'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Origin Node Text Label (City name)
      map.addLayer({
        id: 'threat-origin-labels',
        type: 'symbol',
        source: 'threat-origin-nodes',
        layout: {
          'text-field': ['coalesce', ['get', 'city'], ['get', 'name']],
          'text-size': 11,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 1.3],
          'text-anchor': 'top',
          visibility: visibleLayers.markers !== false ? 'visible' : 'none'
        },
        paint: {
          'text-color': '#fca5a5',
          'text-halo-color': '#06090f',
          'text-halo-width': 2
        }
      });

      // 6. Target Infrastructure Nodes Source & Layers
      map.addSource('threat-target-nodes', {
        type: 'geojson',
        data: initialNodes.targets
      });

      map.addLayer({
        id: 'threat-target-halo',
        type: 'circle',
        source: 'threat-target-nodes',
        layout: {
          visibility: visibleLayers.targets !== false ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': 13,
          'circle-color': '#00e5ff',
          'circle-opacity': 0.35,
          'circle-stroke-width': 1.6,
          'circle-stroke-color': '#00e5ff'
        }
      });

      map.addLayer({
        id: 'threat-target-center',
        type: 'circle',
        source: 'threat-target-nodes',
        layout: {
          visibility: visibleLayers.targets !== false ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': 6,
          'circle-color': '#00e5ff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Target Bastion Text Label (City name)
      map.addLayer({
        id: 'threat-target-labels',
        type: 'symbol',
        source: 'threat-target-nodes',
        layout: {
          'text-field': ['coalesce', ['get', 'city'], ['get', 'name']],
          'text-size': 11,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 1.3],
          'text-anchor': 'top',
          visibility: visibleLayers.targets !== false ? 'visible' : 'none'
        },
        paint: {
          'text-color': '#67e8f9',
          'text-halo-color': '#06090f',
          'text-halo-width': 2
        }
      });

      // ─── START ATTACK FLOW ANIMATION LOOP ───
      const animateAttackFlow = (time) => {
        if (!mapRef.current) return;
        const elapsed = (time - startTimeRef.current) / 1000.0;
        const routes = getRoutesData();
        const beaconFeatures = [];

        if (routes && routes.features && routes.features.length > 0) {
          routes.features.forEach((feature, idx) => {
            const coords = feature.geometry?.coordinates;
            if (!coords || coords.length < 2) return;

            let dt = feature.properties?.data_transfer || feature.properties?.dataTransfer;
            if (typeof dt === 'string') {
              try { dt = JSON.parse(dt); } catch (e) { dt = null; }
            }
            const isExfil = (dt?.flow_type || dt?.flowType) === 'exfiltration';
            const isBlocked = (dt?.flow_type || dt?.flowType) === 'ddos_flood';
            const sev = (feature.properties?.severity || 'critical').toLowerCase();
            const color = isExfil ? '#f43f5e' : (isBlocked ? '#a855f7' : (sev === 'critical' ? '#ff3366' : (SEVERITY_COLORS[sev] || '#00e5ff')));

            // Loop duration (seconds for full trajectory from source to target)
            const cycleDuration = 3.8;
            const phaseOffset = (idx * 0.35) % 1.0;
            const numPackets = 3; // 3 streaming data packets per route

            for (let pIdx = 0; pIdx < numPackets; pIdx++) {
              const offset = pIdx / numPackets;
              const progress = ((elapsed / cycleDuration) + phaseOffset + offset) % 1.0;

              const totalPoints = coords.length - 1;
              const exactIndex = progress * totalPoints;
              const baseIndex = Math.floor(exactIndex);
              const nextIndex = Math.min(baseIndex + 1, totalPoints);
              const subProgress = exactIndex - baseIndex;

              const p1 = coords[baseIndex];
              const p2 = coords[nextIndex];
              const lng = p1[0] + (p2[0] - p1[0]) * subProgress;
              const lat = p1[1] + (p2[1] - p1[1]) * subProgress;

              beaconFeatures.push({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [lng, lat]
                },
                properties: {
                  id: `beacon-${feature.id || idx}-${pIdx}`,
                  color,
                  severity: sev,
                  isExfil
                }
              });
            }
          });
        }

        const beaconSrc = mapRef.current.getSource('attack-flow-beacons');
        if (beaconSrc) {
          beaconSrc.setData({
            type: 'FeatureCollection',
            features: beaconFeatures
          });
        }

        animFrameRef.current = requestAnimationFrame(animateAttackFlow);
      };

      animFrameRef.current = requestAnimationFrame(animateAttackFlow);

      // ─── INTERACTIVE EVENT HANDLERS ───

      // A. Country Click
      map.on('click', 'countries-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const countryName = feature.properties?.name || 'Monitored Region';
        const iso3 = feature.id || feature.properties?.id;

        const profile = (VERIFIED_COUNTRY_PROFILES && VERIFIED_COUNTRY_PROFILES[iso3]) || {
          iso3,
          name: countryName,
          code: iso3 ? iso3.slice(0, 2) : 'XX',
          centroid: [e.lngLat.lng, e.lngLat.lat],
          threatLevel: 'Monitored Region',
          threatScore: 50,
          observedEvents: 1,
          primaryVectors: ['Perimeter Network Scans'],
          verifiedActors: ['Under Analysis'],
          malwareFamilies: [],
          mitreTechniques: ['T1046'],
          affectedSectors: ['General Enterprise'],
          evidenceAttribution: 'No direct hostile campaigns attributed at this timestamp.',
          sources: ['IntelOwl Honeynet Telemetry']
        };

        if (onSelectCountry) onSelectCountry(profile);
      });

      // C. Threat Node Click: Show rich popup with 3-tier attribution distinction
      const handleNodeClick = (e) => {
        if (!e.features || e.features.length === 0) return;
        const p = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const sev = (p.severity || 'info').toLowerCase();
        const sevColor = SEVERITY_COLORS[sev] || '#00e5ff';
        const isTarget = p.nodeType === 'TARGET' || p.node_type === 'TARGET';

        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; color: #f8fafc; line-height: 1.45; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-weight: 800; font-size: 12.5px; color: ${isTarget ? '#00e5ff' : '#f43f5e'};">
                ${isTarget ? '🛡️ Target Infrastructure Bastion' : '⚠️ Threat Origin Node'}
              </span>
              <span style="background: ${sevColor}26; color: ${sevColor}; border: 1px solid ${sevColor}55; padding: 2px 7px; border-radius: 4px; font-weight: 800; font-size: 9.5px; text-transform: uppercase;">
                ${sev}
              </span>
            </div>

            <div style="margin-bottom: 4px;">
              <strong style="color: #94a3b8;">IP Address:</strong>
              <code style="background: rgba(0,0,0,0.4); padding: 1px 5px; border-radius: 3px; color: #00e5ff; font-weight: 700;">${p.ip || 'Unknown'}</code>
            </div>

            <div style="margin-bottom: 4px;">
              <strong style="color: #94a3b8;">Location:</strong>
              <span style="color: #e2e8f0;">${p.city || 'Unknown'}, ${p.country || 'Unknown'}</span>
            </div>

            ${p.asn ? `
            <div style="margin-bottom: 4px;">
              <strong style="color: #94a3b8;">ASN / ISP:</strong>
              <span style="color: #cbd5e1;">${p.asn}</span>
            </div>` : ''}

            ${p.threatActor || p.threat_actor ? `
            <div style="margin-bottom: 4px;">
              <strong style="color: #94a3b8;">Verified Actor:</strong>
              <span style="color: #fca5a5; font-weight: 700;">${p.threatActor || p.threat_actor}</span>
            </div>` : ''}

            ${p.malware || p.malware_family ? `
            <div style="margin-bottom: 4px;">
              <strong style="color: #94a3b8;">Malware:</strong>
              <span style="color: #fde047;">${p.malware || p.malware_family}</span>
            </div>` : ''}

            <div style="margin-bottom: 4px;">
              <strong style="color: #94a3b8;">First/Last Observed:</strong>
              <span style="color: #94a3b8; font-size: 10px;">${p.firstObserved || p.first_observed || '2026-10-28 08:14 UTC'} &rarr; ${p.lastObserved || p.last_observed || 'Active'}</span>
            </div>

            ${p.evidence ? `
            <div style="margin-top: 6px; padding: 5px; background: rgba(0,0,0,0.3); border-radius: 4px; border-left: 2px solid #00e5ff; font-size: 10px; color: #cbd5e1;">
              <strong>Evidence:</strong> ${p.evidence}
            </div>` : ''}

            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 9px; color: #64748b; font-style: italic;">
              Attribution Distinction: 1. Geolocation is routing infrastructure. 2. Threat actor attribution is based on verified analytical indicators.
            </div>
          </div>
        `;

        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: true,
          maxWidth: '320px',
          className: 'threat-intel-soc-popup'
        })
          .setLngLat(coordinates)
          .setHTML(popupContent)
          .addTo(map);

        const matchedEvt = events.find(ev => ev.id === p.eventId || ev.id === p.event_id);
        if (matchedEvt && onSelectEvent) {
          onSelectEvent(matchedEvt);
        }
      };

      map.on('click', 'threat-origin-center', handleNodeClick);
      map.on('click', 'threat-origin-halo', handleNodeClick);
      map.on('click', 'threat-target-center', handleNodeClick);
      map.on('click', 'threat-target-halo', handleNodeClick);

      // D. Attack Route Click: Show vector and data transfer telemetry popup
      const handleRouteClick = (e) => {
        if (!e.features || e.features.length === 0) return;
        const p = e.features[0].properties;
        const sev = (p.severity || 'critical').toLowerCase();
        const sevColor = SEVERITY_COLORS[sev] || '#f43f5e';

        let dt = p.data_transfer || p.dataTransfer;
        if (typeof dt === 'string') {
          try { dt = JSON.parse(dt); } catch (err) { dt = null; }
        }

        const isExfil = (dt?.flow_type || dt?.flowType) === 'exfiltration';
        const isBlocked = (dt?.flow_type || dt?.flowType) === 'ddos_flood';
        const transferBadge = isExfil ? '🔴 Active Data Exfiltration' : (isBlocked ? '🟢 Mitigated & Filtered' : '🟡 C2 Command Tunnel');

        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; color: #f8fafc; line-height: 1.45; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-weight: 800; font-size: 12px; color: #00e5ff; display: flex; align-items: center; gap: 4px;">
                📡 Global Data Transfer Flow
              </span>
              <span style="background: ${sevColor}26; color: ${sevColor}; border: 1px solid ${sevColor}55; padding: 2px 7px; border-radius: 4px; font-weight: 800; font-size: 9.5px; text-transform: uppercase;">
                ${sev}
              </span>
            </div>

            <div style="margin-bottom: 6px; background: rgba(0, 229, 255, 0.08); border: 1px solid rgba(0, 229, 255, 0.2); border-radius: 6px; padding: 6px 8px;">
              <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Data Transfer Channel</div>
              <div style="color: #38bdf8; font-weight: 700; font-size: 11px; display: flex; align-items: center; justify-content: space-between;">
                <span>${p.sourceCity || p.source_city || 'Origin'} (${p.sourceCountry || p.source_country || ''})</span>
                <span style="color: #f43f5e; margin: 0 4px;">➔</span>
                <span>${p.destCity || p.dest_city || 'Target'} (${p.destCountry || p.dest_country || ''})</span>
              </div>
            </div>

            ${dt ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
              <div style="background: rgba(0,0,0,0.3); padding: 5px 7px; border-radius: 4px;">
                <div style="font-size: 9.5px; color: #94a3b8;">Data Transferred</div>
                <div style="font-size: 12px; font-weight: 800; color: #f43f5e; font-family: monospace;">
                  ${dt.bytes_transferred || dt.bytesTransferred || 'Live Stream'}
                </div>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 5px 7px; border-radius: 4px;">
                <div style="font-size: 9.5px; color: #94a3b8;">Transfer Rate</div>
                <div style="font-size: 12px; font-weight: 800; color: #38bdf8; font-family: monospace;">
                  ${dt.transfer_rate || dt.transferRate || 'Continuous'}
                </div>
              </div>
            </div>

            <div style="margin-bottom: 5px; font-size: 10.5px;">
              <strong style="color: #94a3b8;">Status:</strong>
              <span style="color: ${isExfil ? '#fca5a5' : '#86efac'}; font-weight: 700; margin-left: 4px;">${transferBadge}</span>
            </div>

            <div style="margin-bottom: 5px; font-size: 10.5px;">
              <strong style="color: #94a3b8;">Protocol:</strong>
              <code style="background: rgba(0,0,0,0.4); padding: 1px 5px; border-radius: 3px; color: #00e5ff; font-weight: 700; margin-left: 4px;">${dt.protocol || 'TCP 443'}</code>
            </div>

            <div style="margin-bottom: 5px; font-size: 10.5px;">
              <strong style="color: #94a3b8;">Intercepted Payload:</strong>
              <div style="color: #fde047; font-size: 10px; margin-top: 2px;">${dt.payload_type || dt.payloadType || 'Adversary telemetry'}</div>
            </div>
            ` : ''}

            <div style="margin-bottom: 5px;">
              <strong style="color: #94a3b8;">Attributed Actor:</strong>
              <span style="color: #fca5a5; font-weight: 700; margin-left: 4px;">${p.threat_actor || p.threatActor || 'Advanced Threat'}</span>
            </div>

            <div style="margin-top: 6px; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 9.5px; color: #94a3b8; display: flex; justify-content: space-between;">
              <span>Source IP: <code style="color: #fda4af;">${p.source_ip || p.sourceIp || 'N/A'}</code></span>
              <span>Target IP: <code style="color: #a5f3fc;">${p.dest_ip || p.destIp || 'N/A'}</code></span>
            </div>
          </div>
        `;

        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: true,
          maxWidth: '330px',
          className: 'threat-intel-soc-popup'
        })
          .setLngLat(e.lngLat)
          .setHTML(popupContent)
          .addTo(map);

        const matchedEvt = events.find(ev => ev.id === p.id);
        if (matchedEvt && onSelectEvent) {
          onSelectEvent(matchedEvt);
        }
      };

      map.on('click', 'attack-routes-glow', handleRouteClick);
      map.on('click', 'attack-routes-core', handleRouteClick);

      // Cursor pointer styling
      const cursorLayers = [
        'countries-fill',
        'threat-origin-halo',
        'threat-origin-center',
        'threat-target-halo',
        'threat-target-center',
        'attack-routes-glow',
        'attack-routes-core'
      ];
      cursorLayers.forEach(l => {
        map.on('mouseenter', l, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', l, () => { map.getCanvas().style.cursor = ''; });
      });

      // Fit view to frame global threat activity on initial load
      try {
        map.fitBounds([[-125, -35], [152, 62]], {
          padding: 40,
          duration: 0
        });
      } catch (err) {
        // Fallback default
      }

      setMapLoaded(true);
    });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (popupRef.current) popupRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Country Highlight Filter when selectedCountry changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    if (map.getLayer('countries-highlight')) {
      if (selectedCountry && selectedCountry.iso3) {
        map.setFilter('countries-highlight', ['==', 'id', selectedCountry.iso3]);
      } else {
        map.setFilter('countries-highlight', ['==', 'id', '']);
      }
    }
  }, [selectedCountry, mapLoaded]);

  // Update Sources when data changes (Backend GeoJSON or filtered events)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    // 1. Attack Routes Source
    const routesSrc = map.getSource('attack-routes');
    if (routesSrc) {
      routesSrc.setData(getRoutesData());
    }

    // 2. Nodes Sources (Origin & Target)
    const { origins, targets } = getPartitionedNodes();
    const originsSrc = map.getSource('threat-origin-nodes');
    if (originsSrc) {
      originsSrc.setData(origins);
    }
    const targetsSrc = map.getSource('threat-target-nodes');
    if (targetsSrc) {
      targetsSrc.setData(targets);
    }

    // 3. Density Heatmap Source
    const densitySrc = map.getSource('threat-density');
    if (densitySrc) {
      densitySrc.setData(getDensityData());
    }
  }, [events, nodesGeoJson, routesGeoJson, densityGeoJson, activeSeverity, mapLoaded]);

  // Update Layer Visibility when toggled
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const toggleVis = (layerId, isVis) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', isVis ? 'visible' : 'none');
      }
    };

    toggleVis('attack-routes-glow', visibleLayers.routes !== false);
    toggleVis('attack-routes-core', visibleLayers.routes !== false);
    toggleVis('attack-flow-aura', visibleLayers.routes !== false);
    toggleVis('attack-flow-core', visibleLayers.routes !== false);
    toggleVis('threat-origin-halo', visibleLayers.markers !== false);
    toggleVis('threat-origin-center', visibleLayers.markers !== false);
    toggleVis('threat-origin-labels', visibleLayers.markers !== false);
    toggleVis('threat-target-halo', visibleLayers.targets !== false);
    toggleVis('threat-target-center', visibleLayers.targets !== false);
    toggleVis('threat-target-labels', visibleLayers.targets !== false);
    toggleVis('countries-boundary', visibleLayers.borders !== false);
    toggleVis('threat-density-heatmap', !!visibleLayers.heatmap);
  }, [visibleLayers, mapLoaded]);

  // Handle Window Resizing cleanly
  useEffect(() => {
    if (!mapRef.current) return;
    const handleResize = () => mapRef.current && mapRef.current.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '440px',
        position: 'relative',
        background: '#06090f',
        overflow: 'hidden'
      }}
    />
  );
});

export default MapLibreContainer;
