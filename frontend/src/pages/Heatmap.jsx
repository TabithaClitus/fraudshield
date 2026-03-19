import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";
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

// Static cities data - hardcoded for deployment stability
const STATIC_CITIES = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, scams: 487, risk: 'HIGH', trending: 147, topScams: ['OTP Fraud', 'Fake KYC', 'UPI Phishing'] },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, scams: 423, risk: 'HIGH', trending: 132, topScams: ['Fake IRCTC Refund', 'Investment Fraud', 'OTP Fraud'] },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946, scams: 356, risk: 'HIGH', trending: 118, topScams: ['Job Offer Fraud', 'Loan App Scams', 'Fake KYC'] },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, scams: 298, risk: 'HIGH', trending: 95, topScams: ['Investment Fraud', 'OTP Fraud', 'Fake KYC'] },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, scams: 187, risk: 'MEDIUM', trending: 67, topScams: ['UPI Phishing', 'Fake KYC', 'Job Offer Fraud'] },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, scams: 234, risk: 'HIGH', trending: 89, topScams: ['Fake IRCTC Refund', 'OTP Fraud', 'Prize Scam'] },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, scams: 198, risk: 'HIGH', trending: 76, topScams: ['Investment Fraud', 'Loan App Scams', 'OTP Fraud'] },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, scams: 167, risk: 'HIGH', trending: 54, topScams: ['Fake KYC', 'OTP Fraud', 'Prize Scam'] },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, scams: 134, risk: 'MEDIUM', trending: 43, topScams: ['OTP Fraud', 'Fake KYC', 'Investment Fraud'] },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462, scams: 112, risk: 'MEDIUM', trending: 38, topScams: ['Fake KYC', 'Prize Scam', 'OTP Fraud'] },
  { name: 'Surat', lat: 21.1702, lng: 72.8311, scams: 98, risk: 'MEDIUM', trending: 31, topScams: ['Investment Fraud', 'OTP Fraud', 'Fake KYC'] },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673, scams: 76, risk: 'LOW', trending: 22, topScams: ['OTP Fraud', 'Fake KYC', 'Job Offer Fraud'] },
];

export default function Heatmap() {
  const { colors } = useTheme();
  const isMobile = useIsMobile();
  const [cities, setCities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize with static data and inject Leaflet styles
  useEffect(() => {
    // Use static data instead of API call
    setCities(STATIC_CITIES);
    setLoading(false);
    
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

  // Safe filter with null check
  const highAlert = cities && cities.length > 0 ? cities.filter((c) => c.risk === "HIGH").map((c) => c.name) : [];

  const getRiskColor = (level) => {
    return level === "HIGH" ? "#dc2626" : level === "MEDIUM" ? "#f59e0b" : "#22c55e";
  };

  // Guard: don't render map if no cities data
  if (!cities || cities.length === 0) return null;

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
                radius={Math.max(8, Math.min(30, city.scams / 15))}
                pathOptions={{
                  fillColor: RISK_COLORS[city.risk],
                  fillOpacity: 0.7,
                  color: RISK_COLORS[city.risk],
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
                      🚨 <strong>Scam Reports:</strong> {city.scams}
                    </div>
                    <div style={{
                      fontSize: "13px",
                      color: "#d1d5db",
                      marginBottom: "4px"
                    }}>
                      📈 <strong>Trending:</strong> ↑{city.trending}% this week
                    </div>
                    <div style={{
                      fontSize: "13px",
                      color: getRiskColor(city.risk),
                      marginBottom: "12px",
                      fontWeight: "600"
                    }}>
                      ⚠️ <strong>Risk Level:</strong> {city.risk}
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
                      {city.topScams && city.topScams.length > 0 ? city.topScams.map((scam, idx) => (
                        <div key={idx} style={{
                          fontSize: "12px",
                          color: "#e5e7eb",
                          display: "flex",
                          justifyContent: "space-between",
                          paddingBottom: "6px",
                          marginBottom: "4px",
                          borderBottom: idx < city.topScams.length - 1 ? "1px solid #333333" : "none"
                        }}>
                          <span style={{ fontWeight: "500" }}>
                            {idx + 1}. {scam}
                          </span>
                        </div>
                      )) : <div style={{ color: "#999", fontSize: "12px" }}>No scam data</div>}
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
