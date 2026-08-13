import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin, Key, CheckCircle, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import type { VisitorLocation } from '../lib/visitorTracker';

interface VisitorMapProps {
  locations: VisitorLocation[];
  timeframe: string;
}

const DEFAULT_MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export const VisitorMap: React.FC<VisitorMapProps> = ({ locations, timeframe }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem('spet_mapbox_token') || DEFAULT_MAPBOX_TOKEN;
  });
  const [tokenInput, setTokenInput] = useState<string>(mapboxToken);
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<VisitorLocation | null>(null);

  // Inject Mapbox CSS dynamically if not present
  useEffect(() => {
    if (!document.getElementById('mapbox-gl-css')) {
      const link = document.createElement('link');
      link.id = 'mapbox-gl-css';
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.css';
      document.head.appendChild(link);
    }
  }, []);

  const initMap = () => {
    if (!mapContainerRef.current) return;
    setMapError(null);
    setMapLoaded(false);

    try {
      const activeToken = mapboxToken.trim() || DEFAULT_MAPBOX_TOKEN;
      mapboxgl.accessToken = activeToken;

      // Clean up previous map if exists
      if (mapRef.current) {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [24.0, -29.0], // Centered over South Africa
        zoom: 4.8,
        pitch: 35,
        attributionControl: false
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');

      map.on('error', (e) => {
        console.warn('Mapbox GL error:', e);
        if (e.error?.message?.includes('Unauthorized') || e.error?.message?.includes('Forbidden') || e.error?.message?.includes('access token')) {
          setMapError('Invalid or restricted Mapbox Access Token. Please provide a valid Mapbox Public Key.');
        }
      });

      map.on('load', () => {
        setMapLoaded(true);

        // Add 3D building terrain effect layer for extra flair
        const layers = map.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
        )?.id;

        if (!map.getLayer('3d-buildings')) {
          map.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 12,
              paint: {
                'fill-extrusion-color': '#0d283c',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.6
              }
            },
            labelLayerId
          );
        }

        renderMarkers(map);
      });

      mapRef.current = map;
    } catch (err: any) {
      console.error('Failed to initialize Mapbox:', err);
      setMapError(err.message || 'Could not load Mapbox map.');
    }
  };

  const renderMarkers = (map: mapboxgl.Map) => {
    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    locations.forEach((loc) => {
      // Create custom DOM element for pin
      const el = document.createElement('div');
      el.className = 'relative group cursor-pointer';
      
      const isTop = loc.percentage >= 15;
      const sizeClass = isTop ? 'w-6 h-6' : 'w-4 h-4';
      const colorClass = isTop ? 'bg-accent-orange shadow-[0_0_15px_#f97316]' : 'bg-accent-cyan shadow-[0_0_10px_#06b6d4]';

      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-75 animate-ping"></span>
          <span class="relative inline-flex rounded-full ${sizeClass} ${colorClass} border-2 border-white"></span>
          <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-lago-900 border border-lago-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
            ${loc.city} (${loc.visitsCount.toLocaleString()})
          </div>
        </div>
      `;

      // Popup
      const popupHtml = `
        <div class="p-2 bg-[#0a141d] text-white rounded-lg min-w-[200px]">
          <div class="flex items-center justify-between border-b border-lago-700 pb-1.5 mb-2">
            <span class="font-bold text-sm text-white">${loc.city}</span>
            <span class="text-[10px] font-bold uppercase tracking-wider text-accent-orange px-1.5 py-0.5 rounded bg-lago-800">${loc.province}</span>
          </div>
          <p class="text-xs text-lago-300 mb-1">Visits (${timeframe}): <strong class="text-white font-mono">${loc.visitsCount.toLocaleString()}</strong> (${loc.percentage}%)</p>
          <p class="text-xs text-lago-300 mb-2">Top Interest: <strong class="text-accent-cyan">${loc.topInterest}</strong></p>
          <div class="text-[10px] text-lago-400">
            <div class="flex justify-between mb-0.5">
              <span>Desktop ${loc.deviceSplit.desktop}%</span>
              <span>Mobile ${loc.deviceSplit.mobile}%</span>
            </div>
            <div class="w-full h-1.5 bg-lago-800 rounded-full overflow-hidden flex">
              <div style="width: ${loc.deviceSplit.desktop}%" class="bg-accent-cyan h-full"></div>
              <div style="width: ${loc.deviceSplit.mobile}%" class="bg-accent-orange h-full"></div>
            </div>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 15, closeButton: false }).setHTML(popupHtml);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', () => {
        setSelectedLocation(loc);
        map.flyTo({ center: [loc.lng, loc.lat], zoom: 7.5, duration: 1500 });
      });

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        markersRef.current.forEach((m) => m.remove());
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      renderMarkers(mapRef.current);
    }
  }, [locations, timeframe, mapLoaded]);

  const handleSaveToken = () => {
    const newToken = tokenInput.trim();
    if (newToken) {
      localStorage.setItem('spet_mapbox_token', newToken);
      setMapboxToken(newToken);
      setShowTokenModal(false);
    }
  };

  const handleFlyToSA = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [24.0, -29.0], zoom: 4.8, pitch: 35, duration: 1500 });
      setSelectedLocation(null);
    }
  };

  return (
    <div className="bg-lago-900 border border-lago-800 rounded-2xl p-5 shadow-xl relative overflow-hidden mb-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-lago-800">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent-cyan" /> Geographic Visitor Map
          </h2>
          <p className="text-xs text-lago-300">
            Real-time live connections powered by Mapbox GL API
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedLocation && (
            <button
              onClick={handleFlyToSA}
              className="px-3 py-1.5 rounded-xl bg-lago-800 hover:bg-lago-700 text-lago-200 text-xs font-semibold border border-lago-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset View
            </button>
          )}

          <button
            onClick={() => setShowTokenModal(true)}
            className="px-3 py-1.5 rounded-xl bg-lago-800 hover:bg-lago-700 text-white text-xs font-semibold border border-lago-600 transition-colors flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5 text-accent-orange" /> Mapbox API Key
          </button>
        </div>
      </div>

      {/* Mapbox Canvas Container */}
      <div className="relative w-full h-[440px] rounded-xl overflow-hidden border border-lago-700 bg-[#0a141d]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map error overlay */}
        {mapError && (
          <div className="absolute inset-0 bg-[#0a141d]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <AlertCircle className="w-12 h-12 text-accent-orange mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Mapbox API Connection Notice</h3>
            <p className="text-sm text-lago-300 max-w-md mb-4">{mapError}</p>
            <button
              onClick={() => setShowTokenModal(true)}
              className="px-5 py-2 rounded-xl bg-accent-orange hover:bg-orange-600 text-white text-sm font-bold transition-colors shadow-lg"
            >
              Configure Mapbox Token
            </button>
          </div>
        )}

        {/* Floating map legend */}
        <div className="absolute top-3 left-3 bg-[#0a141d]/90 backdrop-blur-md border border-lago-700 rounded-xl p-3 text-xs text-lago-200 z-10 hidden sm:block shadow-xl">
          <div className="font-bold text-white mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-accent-cyan" /> Visitor Concentration
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-accent-orange shadow-[0_0_8px_#f97316]"></span>
            <span>Primary Hotspot (&gt; 15%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan shadow-[0_0_8px_#06b6d4]"></span>
            <span>Secondary Hotspot (&lt; 15%)</span>
          </div>
        </div>

        {/* Selected location overlay badge */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 bg-lago-900/95 border border-accent-cyan/40 backdrop-blur-md rounded-xl p-3 text-xs z-10 max-w-xs shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between text-white font-bold mb-1">
              <span>{selectedLocation.city}, {selectedLocation.country}</span>
              <span className="text-[10px] text-accent-cyan uppercase">{selectedLocation.province}</span>
            </div>
            <p className="text-lago-300 text-[11px] mb-1">
              Traffic: <strong className="text-white font-mono">{selectedLocation.visitsCount.toLocaleString()}</strong> ({selectedLocation.percentage}%)
            </p>
            <p className="text-lago-300 text-[11px]">
              Top Buying Interest: <strong className="text-accent-orange">{selectedLocation.topInterest}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Mapbox Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lago-900 border border-lago-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-accent-orange" /> Configure Mapbox API Token
              </h3>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-lago-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-lago-200 mb-4 leading-relaxed">
              SPET Admin uses Mapbox GL for smooth 3D vector maps. Enter your Mapbox Public Access Key (<code className="text-accent-cyan font-mono">pk.eyJ1...</code>). You can also define this in your Netlify deployment settings as <code className="text-accent-cyan font-mono">VITE_MAPBOX_TOKEN</code>.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-lago-400 uppercase tracking-wide mb-1.5">
                Mapbox Public Key
              </label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="pk.eyJ1Ijo..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a141d] border border-lago-700 text-white font-mono text-xs focus:outline-none focus:border-lago-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowTokenModal(false)}
                className="px-4 py-2 rounded-xl bg-lago-800 hover:bg-lago-700 text-lago-200 text-xs font-semibold transition-colors border border-lago-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToken}
                className="px-5 py-2 rounded-xl bg-accent-orange hover:bg-orange-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg"
              >
                <CheckCircle className="w-4 h-4" /> Save &amp; Reload Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
