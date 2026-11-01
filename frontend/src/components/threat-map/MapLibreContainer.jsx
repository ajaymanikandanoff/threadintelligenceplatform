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

const MapLibreContainer = forwardRef(function MapLibreContainer({
  selectedCountry,
  onSelectCountry,
  selectedEvent,
  onSelectEvent,
  activeSeverity = 'ALL',
  visibleLayers = { routes: true, markers: true, borders: true },
  events = VERIFIED_THREAT_EVENTS
}, ref) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const animFrameRef = useRef(null);
  const dashOffsetRef = useRef(0);

  // Filter events based on active severity
  const filteredEvents = events.filter(e => {
    if (activeSeverity === 'ALL') return true;
    return e.severity.toLowerCase() === activeSeverity.toLowerCase();
  });

  // Expose imperative map controls (Zoom, Reset View, FlyTo)
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
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom,
          duration: 1200
        });
      }
    }
  }));

  // Initialize MapLibre GL instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
          }
        },
        layers: [
          {
            id: 'carto-dark-tiles',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 19
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
      // 1. Add GeoJSON Countries Source
      map.addSource('world-countries', {
        type: 'geojson',
        data: '/countries.geojson'
      });

      // Country Fills Layer (for interactive click and hover highlight)
      map.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: 'world-countries',
        paint: {
          'fill-color': '#00e5ff',
          'fill-opacity': 0.0
        }
      });

      // Country Boundaries Layer
      map.addLayer({
        id: 'countries-boundary',
        type: 'line',
        source: 'world-countries',
        paint: {
          'line-color': 'rgba(56, 189, 248, 0.22)',
          'line-width': 0.75,
          'line-opacity': 0.8
        }
      });

      // Country Selected Highlight Layer
      map.addLayer({
        id: 'countries-highlight',
        type: 'line',
        source: 'world-countries',
        paint: {
          'line-color': '#00e5ff',
          'line-width': 2.2,
          'line-opacity': 0.95
        },
        filter: ['==', 'id', ''] // initially empty
      });

      // 2. Add Attack Routes GeoJSON Source
      map.addSource('attack-routes', {
        type: 'geojson',
        data: buildAttackRoutesGeoJson(filteredEvents)
      });

      // Attack Routes Outer Glow
      map.addLayer({
        id: 'attack-routes-glow',
        type: 'line',
        source: 'attack-routes',
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
          'line-opacity': 0.35,
          'line-blur': 2
        }
      });

      // Attack Routes Inner Core Line
      map.addLayer({
        id: 'attack-routes-core',
        type: 'line',
        source: 'attack-routes',
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
          'line-opacity': 0.85
        }
      });

      // 3. Add Threat Markers GeoJSON Source
      map.addSource('threat-markers', {
        type: 'geojson',
        data: buildThreatMarkersGeoJson(filteredEvents)
      });

      // Outer Ping Halo for Origin Nodes
      map.addLayer({
        id: 'threat-markers-halo',
        type: 'circle',
        source: 'threat-markers',
        paint: {
          'circle-radius': 11,
          'circle-color': [
            'match',
            ['get', 'nodeType'],
            'ORIGIN', SEVERITY_COLORS.critical,
            '#00e5ff'
          ],
          'circle-opacity': 0.22,
          'circle-stroke-width': 1,
          'circle-stroke-color': [
            'match',
            ['get', 'nodeType'],
            'ORIGIN', SEVERITY_COLORS.critical,
            '#00e5ff'
          ]
        }
      });

      // Center Node Circle
      map.addLayer({
        id: 'threat-markers-center',
        type: 'circle',
        source: 'threat-markers',
        paint: {
          'circle-radius': [
            'match',
            ['get', 'nodeType'],
            'ORIGIN', 5.5,
            4.5
          ],
          'circle-color': [
            'match',
            ['get', 'nodeType'],
            'ORIGIN', SEVERITY_COLORS.critical,
            '#00e5ff'
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#06090f'
        }
      });

      // 4. Click Handler for Countries
      map.on('click', 'countries-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const countryName = feature.properties?.name || 'Unknown Region';
        const iso3 = feature.id || feature.properties?.id;

        // Find or build profile
        const profile = VERIFIED_COUNTRY_PROFILES[iso3] || {
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

      // 5. Click Handler for Attack Routes
      map.on('click', 'attack-routes-glow', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        const matchedEvt = events.find(ev => ev.id === props.id);
        if (matchedEvt && onSelectEvent) {
          onSelectEvent(matchedEvt);
        }
      });

      // 6. Click Handler for Markers
      map.on('click', 'threat-markers-center', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        const matchedEvt = events.find(ev => ev.id === props.eventId);
        if (matchedEvt && onSelectEvent) {
          onSelectEvent(matchedEvt);
        }
      });

      // Cursor pointer effects
      map.on('mouseenter', 'countries-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'countries-fill', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'attack-routes-glow', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'attack-routes-glow', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'threat-markers-center', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'threat-markers-center', () => { map.getCanvas().style.cursor = ''; });

      setMapLoaded(true);
    });

    return () => {
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

  // Update Attack Routes and Markers when severity filter or events change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const routesSrc = map.getSource('attack-routes');
    if (routesSrc) {
      routesSrc.setData(buildAttackRoutesGeoJson(filteredEvents));
    }

    const markersSrc = map.getSource('threat-markers');
    if (markersSrc) {
      markersSrc.setData(buildThreatMarkersGeoJson(filteredEvents));
    }
  }, [filteredEvents, mapLoaded]);

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
    toggleVis('threat-markers-halo', visibleLayers.markers !== false);
    toggleVis('threat-markers-center', visibleLayers.markers !== false);
    toggleVis('countries-boundary', visibleLayers.borders !== false);
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
