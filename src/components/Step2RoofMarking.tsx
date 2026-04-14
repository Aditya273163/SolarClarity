import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents, Marker } from 'react-leaflet';
import { ArrowLeft, ChevronRight, Map as MapIcon, Maximize2, Info, Ruler, Trash2, Search, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  onConfirm: (area: number) => void;
  onBack: () => void;
  key?: string;
}

function MapEvents({ onAddPoint }: { onAddPoint: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng);
    },
  });
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMapEvents({});
  map.setView(center, 19);
  return null;
}

export default function Step2RoofMarking({ onConfirm, onBack }: Props) {
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const [useManual, setUseManual] = useState(false);
  const [manualDimensions, setManualDimensions] = useState({ length: 0, width: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([26.8467, 80.9462]); // Lucknow
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Uttar Pradesh, India')}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateArea = (pts: L.LatLng[]) => {
    if (pts.length < 3) return 0;
    // Simple Shoelace formula for area in square meters
    // Note: This is an approximation for small areas on Earth
    let area = 0;
    const R = 6378137; // Earth radius in meters
    
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      
      const x1 = (p1.lng * Math.PI / 180) * R * Math.cos(p1.lat * Math.PI / 180);
      const y1 = (p1.lat * Math.PI / 180) * R;
      const x2 = (p2.lng * Math.PI / 180) * R * Math.cos(p2.lat * Math.PI / 180);
      const y2 = (p2.lat * Math.PI / 180) * R;
      
      area += (x1 * y2 - x2 * y1);
    }
    
    const areaSqM = Math.abs(area) / 2;
    const areaSqFt = areaSqM * 10.7639;
    return Math.round(areaSqFt);
  };

  const areaSqFt = useMemo(() => {
    if (useManual) {
      return manualDimensions.length * manualDimensions.width;
    }
    return calculateArea(points);
  }, [points, useManual, manualDimensions]);

  const handleAddPoint = (latlng: L.LatLng) => {
    setPoints(prev => [...prev, latlng]);
  };

  const clearPoints = () => {
    setPoints([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto w-full px-6 py-12"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to bill details
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Controls */}
        <div className="w-full md:w-80 p-8 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Mark Rooftop</h2>
          <p className="text-sm text-slate-500 mb-8">Tell us how much space you have for solar panels.</p>

          <div className="space-y-6">
            <div className="flex p-1 bg-slate-200 rounded-xl">
              <button 
                onClick={() => setUseManual(false)}
                className={cn(
                  "flex-grow py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                  !useManual ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <MapIcon className="w-3 h-3" />
                Map Tool
              </button>
              <button 
                onClick={() => setUseManual(true)}
                className={cn(
                  "flex-grow py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                  useManual ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Maximize2 className="w-3 h-3" />
                Manual Input
              </button>
            </div>

            {!useManual ? (
              <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    Click on the map to mark the corners of your rooftop. Connect at least 3 points.
                  </p>
                </div>
                <button 
                  onClick={clearPoints}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear Points
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Length (ft)</label>
                  <input 
                    type="number" 
                    value={manualDimensions.length || ''}
                    onChange={(e) => setManualDimensions(prev => ({ ...prev, length: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Width (ft)</label>
                  <input 
                    type="number" 
                    value={manualDimensions.width || ''}
                    onChange={(e) => setManualDimensions(prev => ({ ...prev, width: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 15"
                  />
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-end justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Area</span>
                <span className="text-3xl font-black text-amber-600">{areaSqFt}</span>
              </div>
              <div className="text-xs text-slate-400 text-right font-medium">sq. ft.</div>
            </div>

            <button
              disabled={areaSqFt < 50}
              onClick={() => onConfirm(areaSqFt)}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Calculate Solar Size
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Side: Map or Sketch */}
        <div className="flex-grow h-[400px] md:h-auto relative bg-slate-100">
          {!useManual ? (
            <>
              <form 
                onSubmit={handleSearch}
                className="absolute top-4 left-4 right-4 md:left-auto md:right-4 z-[1000] flex gap-2"
              >
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your address in UP..."
                  className="flex-grow md:w-64 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm shadow-lg outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="bg-slate-900 text-white p-2 rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
              </form>

              <MapContainer 
                center={mapCenter} 
                zoom={19} 
                className="w-full h-full"
                maxZoom={22}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <ChangeView center={mapCenter} />
                <MapEvents onAddPoint={handleAddPoint} />
                {points.length > 0 && (
                  <>
                    {points.map((p, i) => (
                      <Marker key={i} position={p} />
                    ))}
                    {points.length >= 2 && (
                      <Polygon 
                        positions={points} 
                        pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.3 }} 
                      />
                    )}
                  </>
                )}
              </MapContainer>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-64 h-48 bg-white border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center relative shadow-inner">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 text-slate-400">
                  <Ruler className="w-4 h-4" />
                  <span className="text-xs font-bold">{manualDimensions.length || 0} ft</span>
                </div>
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 rotate-90 origin-right">
                  <Ruler className="w-4 h-4" />
                  <span className="text-xs font-bold">{manualDimensions.width || 0} ft</span>
                </div>
                <div className="text-slate-200">
                  <Maximize2 className="w-16 h-16" />
                </div>
              </div>
              <p className="mt-8 text-slate-500 text-sm max-w-xs">
                Enter your roof dimensions to calculate the usable area for solar panels.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
