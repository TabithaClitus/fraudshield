import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";

// Fix Leaflet's default icon images for deployed version
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RISK_COLORS = { HIGH: "#EF4444", MEDIUM: "#F59E0B", LOW: "#10B981" };

export default function Heatmap() {
  const { colors } = useTheme();
  const isMobile = useIsMobile();
  const [cities, setCities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/heatmap").then((r) => { setCities(r.data.cities); setLoading(false); }).catch(() => setLoading(false));
    
    // Inject Leaflet popup ALWAYS dark theme CSS (regardless of light/dark mode toggle)
    if (!document.getElementById("leaflet-dark-theme")) {
      const styleSheet = document.createElement("style");
      styleSheet.id = "leaflet-dark-theme";
      styleSheet.textContent = `
        .leaflet-popup-content-wrapper {
          background: #1a1a2e !important;
          color: #ffffff !important;
          border: 1px solid #ff4444 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-tip {
          background: #1a1a2e !important;
        }
        .leaflet-popup-close-button {
          color: #ffffff !important;
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  // Force map re-render on component mount for proper Leaflet rendering
  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, []);

  const highAlert = cities.filter((c) => c.risk_level === "HIGH").map((c) => c.name);

  const getRiskColor = (level) => {
    return level === "HIGH" ? "#dc2626" : level === "MEDIUM" ? "#f59e0b" : "#22c55e";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-[calc(100vh-64px)]">
      {/* Alert Banner */}
      {highAlert.length > 0 && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center gap-2">
          <span className="text-red-400 font-bold text-sm">🔴 HIGH ALERT:</span>
          <span className="text-red-300 text-sm">{highAlert.join(", ")}</span>
          <span className="ml-auto text-red-400 text-xs font-semibold">Active now</span>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative" style={{ height: isMobile ? "400px" : "600px", width: '100%' }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400 animate-pulse">Loading map data...</p>
          </div>
        ) : (
          <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full" zoomControl={true}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {cities.map((city) => (
              <CircleMarker
                key={city.name}
                center={[city.lat, city.lng]}
                radius={Math.max(8, Math.min(30, city.scam_count / 15))}
                pathOptions={{
                  fillColor: RISK_COLORS[city.risk_level],
                  fillOpacity: 0.7,
                  color: RISK_COLORS[city.risk_level],
                  weight: 2,
                  opacity: 0.9,
                }}
              >
                <Popup minWidth={240}>
                  <div style={{
                    minWidth: "240px",
                    color: "#ffffff",
                    fontFamily: "system-ui, -apple-system, sans-serif"
                  }}>
                    {/* City Name */}
                    <div style={{
                      fontSize: "18px",
                      fontWeight: "900",
                      color: "#ffffff",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      🏙️ {city.name}
                    </div>

                    {/* Divider */}
                    <div style={{
                      borderBottom: "2px solid #444444",
                      marginBottom: "12px"
                    }} />

                    {/* Stats */}
                    <div style={{
                      fontSize: "13px",
                      color: "#d1d5db",
                      marginBottom: "4px"
                    }}>
                      🚨 <strong>Scam Reports:</strong> {city.scam_count}
                    </div>
                    <div style={{
                      fontSize: "13px",
                      color: "#d1d5db",
                      marginBottom: "4px"
                    }}>
                      📈 <strong>Trending:</strong> ↑{city.trending_pct}% this week
                    </div>
                    <div style={{
                      fontSize: "13px",
                      color: getRiskColor(city.risk_level),
                      marginBottom: "12px",
                      fontWeight: "600"
                    }}>
                      ⚠️ <strong>Risk Level:</strong> {city.risk_level}
                    </div>

                    {/* Divider */}
                    <div style={{
                      borderBottom: "1px solid #444444",
                      marginBottom: "10px"
                    }} />

                    {/* Top Scams Header */}
                    <div style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#fbbf24",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Top Scams This Week:
                    </div>

                    {/* Scam List */}
                    <div>
                      {city.top_scams.map((scam, idx) => (
                        <div key={scam.type} style={{
                          fontSize: "12px",
                          color: "#e5e7eb",
                          display: "flex",
                          justifyContent: "space-between",
                          paddingBottom: "6px",
                          marginBottom: "4px",
                          borderBottom: idx < city.top_scams.length - 1 ? "1px solid #333333" : "none"
                        }}>
                          <span style={{ fontWeight: "500" }}>
                            {idx + 1}. {scam.type}
                          </span>
                          <span style={{
                            color: getRiskColor(city.risk_level),
                            fontWeight: "600",
                            marginLeft: "8px"
                          }}>
                            {scam.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="bg-[#111827] border-t border-[#1F2937] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Object.entries(RISK_COLORS).map(([level, color]) => (
            <div key={level} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span className="text-xs text-gray-400">{level}</span>
            </div>
          ))}
          <span className="text-xs text-gray-500">Circle size = scam volume</span>
        </div>

        {/* Ticker */}
        <div className="overflow-hidden" style={{ display: isMobile ? "block" : "block", width: isMobile ? "100%" : "256px" }}>
          <div className="ticker-anim" style={{ fontSize: isMobile ? "11px" : "12px", color: "#fbbf24" }}>
            🚨 OTP Fraud rising in Delhi +47% &nbsp;&nbsp; 🚨 Fake IRCTC scam spreading in Mumbai &nbsp;&nbsp; 🚨 Job fraud alert in Bangalore &nbsp;&nbsp;
          </div>
        </div>
      </div>
    </motion.div>
  );
}
