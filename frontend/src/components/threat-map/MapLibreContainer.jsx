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
        mapRef.current.flyTo({
          center: [15, 25],
          zoom: 1.45,
          pitch: 0,
          bearing: 0,
          duration: 900
        });
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

    const originFeatures = allFeatures.filter(f => f.properties?.nodeType !== 'TARGET');
    const targetFeatures = allFeatures.filter(f => f.properties?.nodeType === 'TARGET');

    return {
      origins: { type: 'FeatureCollection', features: originFeatures },
      targets: { type: 'FeatureCollection', features: targetFeatures }
    };
  };

  const getRoutesData = () => {
    if (routesGeoJson && routesGeoJson.features) {
      return routesGeoJson;
    }
    return buildAttackRoutesGeoJson(filteredEvents);
  };

  const getDensityData = () => {
    if (densityGeoJson && densityGeoJson.features) {
      return densityGeoJson;
    }
    // Fallback: build density points from origin events
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

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
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
          'line-color': 'rgba(56, 189, 248, 0.22)',
          'line-width': 0.8,
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

      // Outer Glowing Path
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
            ['get', 'severity'],
            'critical', SEVERITY_COLORS.critical,
            'high', SEVERITY_COLORS.high,
            'medium', SEVERITY_COLORS.medium,
            'low', SEVERITY_COLORS.low,
            SEVERITY_COLORS.info
          ],
          'line-width': 4.5,
          'line-opacity': 0.38,
          'line-blur': 2.2
        }
      });

      // Inner Core Line
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
          'line-color': [
            'match',
            ['get', 'severity'],
            'critical', SEVERITY_COLORS.critical,
            'high', SEVERITY_COLORS.high,
            'medium', SEVERITY_COLORS.medium,
            'low', SEVERITY_COLORS.low,
            SEVERITY_COLORS.info
          ],
          'line-width': 1.8,
          'line-opacity': 0.9
        }
      });

      // 4. Threat Origin Nodes (Clustered Source)
      map.addSource('threat-origin-nodes', {
        type: 'geojson',
        data: initialNodes.origins,
        cluster: true,
        clusterMaxZoom: 4,
        clusterRadius: 35
      });

      // Cluster Circle Layer
      map.addLayer({
        id: 'threat-clusters',
        type: 'circle',
        source: 'threat-origin-nodes',
        filter: ['has', 'point_count'],
        layout: {
          visibility: visibleLayers.markers !== false ? 'visible' : 'none'
        },
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            'rgba(249, 115, 22, 0.85)',
            4, 'rgba(244, 63, 94, 0.9)',
            8, 'rgba(225, 29, 72, 0.95)'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            15,
            4, 20,
            8, 25
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#06090f'
        }
      });

      // Cluster Count Text
      map.addLayer({
        id: 'threat-cluster-count',
        type: 'symbol',
        source: 'threat-origin-nodes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 11,
          visibility: visibleLayers.markers !== false ? 'visible' : 'none'
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Unclustered Origin Node Outer Halo Ping
      map.addLayer({
        id: 'threat-origin-halo',
        type: 'circle',
        source: 'threat-origin-nodes',
        filter: ['!', ['has', 'point_count']],
        layout: {
          visibility: visibleLayers.markers !== false ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': 11,
          'circle-color': [
            'match',
            ['get', 'severity'],
            'critical', SEVERITY_COLORS.critical,
            'high', SEVERITY_COLORS.high,
            'medium', SEVERITY_COLORS.medium,
            'low', SEVERITY_COLORS.low,
            SEVERITY_COLORS.info
          ],
          'circle-opacity': 0.25,
          'circle-stroke-width': 1,
          'circle-stroke-color': [
            'match',
            ['get', 'severity'],
            'critical', SEVERITY_COLORS.critical,
            'high', SEVERITY_COLORS.high,
            'medium', SEVERITY_COLORS.medium,
            'low', SEVERITY_COLORS.low,
            SEVERITY_COLORS.info
          ]
        }
      });

      // Unclustered Origin Node Center Circle
      map.addLayer({
        id: 'threat-origin-center',
        type: 'circle',
        source: 'threat-origin-nodes',
        filter: ['!', ['has', 'point_count']],
        layout: {
          visibility: visibleLayers.markers !== false ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': 5.5,
          'circle-color': [
            'match',
            ['get', 'severity'],
            'critical', SEVERITY_COLORS.critical,
            'high', SEVERITY_COLORS.high,
            'medium', SEVERITY_COLORS.medium,
            'low', SEVERITY_COLORS.low,
            SEVERITY_COLORS.info
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#06090f'
        }
      });

      // 5. Target Infrastructure Nodes Source & Layer
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
          'circle-radius': 9,
          'circle-color': '#00e5ff',
          'circle-opacity': 0.22,
          'circle-stroke-width': 1,
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
          'circle-radius': 4.5,
          'circle-color': '#00e5ff',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#06090f'
        }
      });

      // 6. Reference Labels Layer (Subtle country/city names over the dark map)
      map.addLayer({
        id: 'esri-dark-ref-tiles',
        type: 'raster',
        source: 'esri-dark-ref',
        minzoom: 0,
        maxzoom: 16,
        paint: {
          'raster-opacity': 0.72
        }
      });

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

      // B. Cluster Click: Smoothly zoom in to expand
      map.on('click', 'threat-clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['threat-clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('threat-origin-nodes').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom + 0.5
          });
        });
      });

      // C. Threat Node Click: Show rich popup with 3-tier attribution distinction
      const handleNodeClick = (e) => {
        if (!e.features || e.features.length === 0) return;
        const p = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        // Ensure popup appears over the targeted point during multi-world wrap
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const sev = p.severity || 'info';
        const sevColor = SEVERITY_COLORS[sev.toLowerCase()] || '#00e5ff';
        const isTarget = p.nodeType === 'TARGET';

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

            ${p.threatActor ? `
            <div style="margin-bottom: 4px;">
              <strong style="color: #94a3b8;">Verified Actor:</strong>
              <span style="color: #fca5a5; font-weight: 700;">${p.threatActor}</span>
            </div>` : ''}

            ${p.malware ? `
            <div style="margin-bottom: 4px;">
              <strong style="color: #94a3b8;">Malware:</strong>
              <span style="color: #fde047;">${p.malware}</span>
            </div>` : ''}

            <div style="margin-bottom: 4px;">
              <strong style="color: #94a3b8;">First/Last Observed:</strong>
              <span style="color: #94a3b8; font-size: 10px;">${p.firstObserved || '2026-11-01 10:00 UTC'} &rarr; ${p.lastObserved || 'Active'}</span>
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

        // Notify parent event selection
        const matchedEvt = events.find(ev => ev.id === p.eventId);
        if (matchedEvt && onSelectEvent) {
          onSelectEvent(matchedEvt);
        }
      };

      map.on('click', 'threat-origin-center', handleNodeClick);
      map.on('click', 'threat-target-center', handleNodeClick);

      // D. Attack Route Click: Show vector intelligence popup
      map.on('click', 'attack-routes-glow', (e) => {
        if (!e.features || e.features.length === 0) return;
        const p = e.features[0].properties;
        const sev = p.severity || 'critical';
        const sevColor = SEVERITY_COLORS[sev.toLowerCase()] || '#f43f5e';

        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; color: #f8fafc; line-height: 1.45; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-weight: 800; font-size: 12px; color: #00e5ff;">
                ⚡ Active Attack Vector Route
              </span>
              <span style="background: ${sevColor}26; color: ${sevColor}; border: 1px solid ${sevColor}55; padding: 2px 7px; border-radius: 4px; font-weight: 800; font-size: 9.5px; text-transform: uppercase;">
                ${sev}
              </span>
            </div>

            <div style="margin-bottom: 5px;">
              <strong style="color: #94a3b8;">Vector:</strong>
              <span style="color: #f8fafc; font-weight: 700;">${p.attackCategory || p.name || 'Adversary Command & Control'}</span>
            </div>

            <div style="margin-bottom: 4px; font-size: 10.5px;">
              <span style="color: #f43f5e; font-weight: 700;">Origin:</span> ${p.sourceCity || 'Origin'}, ${p.sourceCountry || ''}
              <code style="background: rgba(0,0,0,0.3); padding: 1px 4px; border-radius: 3px; color: #fda4af;">(${p.sourceIp || 'N/A'})</code>
            </div>

            <div style="margin-bottom: 4px; font-size: 10.5px;">
              <span style="color: #00e5ff; font-weight: 700;">Target:</span> ${p.destCity || 'Target'}, ${p.destCountry || ''}
              <code style="background: rgba(0,0,0,0.3); padding: 1px 4px; border-radius: 3px; color: #a5f3fc;">(${p.destIp || 'N/A'})</code>
            </div>

            ${p.protocol ? `
            <div style="margin-bottom: 4px;">
              <strong style="color: #94a3b8;">Protocol & Port:</strong>
              <span style="color: #cbd5e1;">${p.protocol} / Port ${p.port || 443}</span>
            </div>` : ''}

            ${p.evidence ? `
            <div style="margin-top: 6px; padding: 5px; background: rgba(0,0,0,0.3); border-radius: 4px; border-left: 2px solid #f43f5e; font-size: 10px; color: #cbd5e1;">
              <strong>Evidence:</strong> ${p.evidence}
            </div>` : ''}

            <div style="margin-top: 6px; font-size: 9.5px; color: #94a3b8;">
              <span>Timestamp: ${p.timestamp || 'Real-time telemetry'}</span>
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
      });

      // Cursor pointer styling
      const cursorLayers = [
        'countries-fill',
        'threat-clusters',
        'threat-origin-center',
        'threat-target-center',
        'attack-routes-glow'
      ];
      cursorLayers.forEach(l => {
        map.on('mouseenter', l, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', l, () => { map.getCanvas().style.cursor = ''; });
      });

      setMapLoaded(true);
    });

    return () => {
      if (popupRef.current) popupRef.current.remove();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
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
    toggleVis('threat-clusters', visibleLayers.markers !== false);
    toggleVis('threat-cluster-count', visibleLayers.markers !== false);
    toggleVis('threat-origin-halo', visibleLayers.markers !== false);
    toggleVis('threat-origin-center', visibleLayers.markers !== false);
    toggleVis('threat-target-halo', visibleLayers.targets !== false);
    toggleVis('threat-target-center', visibleLayers.targets !== false);
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
