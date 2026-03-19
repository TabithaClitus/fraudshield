import { useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";

const CITIES = [
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
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Only initialize map once
    if (mapInstanceRef.current) return;

    // Wait for Leaflet to be loaded from CDN
    const L = window.L;
    if (!L) {
      console.error('Leaflet library not loaded');
      return;
    }

    try {
      // Create map
      const map = L.map(mapRef.current, { 
        attributionControl: true,
        zoomControl: true 
      }).setView([20.5937, 78.9629], 5);
      
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Add dark theme CSS for popups
      if (!document.getElementById("leaflet-popup-dark-theme")) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "leaflet-popup-dark-theme";
        styleSheet.textContent = `
          .leaflet-popup-content-wrapper {
            background: #1a1a2e !important;
            color: #ffffff !important;
            border: 2px solid #ff4444 !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.8) !important;
          }
          .leaflet-popup-tip {
            background: #1a1a2e !important;
            border: 2px solid #ff4444 !important;
          }
          .leaflet-popup-close-button {
            color: #ffffff !important;
            font-size: 20px !important;
          }
          .leaflet-popup-content {
            font-family: system-ui, -apple-system, sans-serif !important;
            font-size: 13px !important;
            line-height: 1.5 !important;
          }
        `;
        document.head.appendChild(styleSheet);
      }

      // Add cities to map
      CITIES.forEach(city => {
        const color = city.risk === 'HIGH' ? '#EF4444' : city.risk === 'MEDIUM' ? '#F59E0B' : '#10B981';
        const radius = Math.min(city.scams / 5, 40);

        // Create circle marker
        const circle = L.circle([city.lat, city.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.6,
          weight: 2,
          radius: radius * 1000
        }).addTo(map);

        // Build popup content
        const popupContent = `
          <div style="min-width: 240px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="color: #ffffff; font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">🏙️ ${city.name}</h3>
            <div style="border-bottom: 2px solid #444444; margin-bottom: 8px;"></div>
            <div style="color: #d1d5db; margin-bottom: 4px;">🚨 <strong>Scam Reports:</strong> ${city.scams}</div>
            <div style="color: #d1d5db; margin-bottom: 4px;">📈 <strong>Trending:</strong> ↑${city.trending}% this week</div>
            <div style="color: ${color}; margin-bottom: 12px; font-weight: 600;">⚠️ <strong>Risk Level:</strong> ${city.risk}</div>
            <div style="border-bottom: 1px solid #444444; margin-bottom: 8px;"></div>
            <div style="color: #fbbf24; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">Top Scams This Week:</div>
            <div>
              ${city.topScams.map((scam, idx) => `
                <div style="color: #e5e7eb; font-size: 12px; padding-bottom: 4px; margin-bottom: 4px; border-bottom: ${idx < city.topScams.length - 1 ? '1px solid #333333' : 'none'};">
                  <strong>${idx + 1}. ${scam}</strong>
                </div>
              `).join('')}
            </div>
          </div>
        `;

        circle.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'leaflet-popup-dark'
        });
      });

      // Force resize
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      // Cleanup function
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  // Get high alert cities
  const highAlert = CITIES.filter(c => c.risk === 'HIGH').map(c => c.name);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="flex flex-col h-[calc(100vh-64px)]"
    >
      {/* Alert Banner */}
      {highAlert.length > 0 && (
        <div style={{
          backgroundColor: colors.isDark ? 'rgba(220, 38, 38, 0.1)' : 'rgba(255, 220, 220, 0.3)',
          borderBottom: `1px solid ${colors.isDark ? 'rgba(220, 38, 38, 0.3)' : 'rgba(255, 100, 100, 0.3)'}`,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ color: colors.isDark ? '#ff6666' : '#cc0000', fontWeight: 'bold', fontSize: '14px' }}>
            🔴 HIGH ALERT:
          </span>
          <span style={{ color: colors.isDark ? '#ff8888' : '#dd0000', fontSize: '14px' }}>
            {highAlert.join(", ")}
          </span>
          <span style={{ marginLeft: 'auto', color: colors.isDark ? '#ff6666' : '#cc0000', fontSize: '12px', fontWeight: 'bold' }}>
            Active now
          </span>
        </div>
      )}

      {/* Map Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        height: isMobile ? '400px' : '600px',
        width: '100%',
        backgroundColor: colors.isDark ? '#1a1a2e' : '#f5f5f5'
      }}>
        <div 
          ref={mapRef} 
          style={{
            height: '100%',
            width: '100%',
            borderRadius: '0'
          }}
        />
      </div>

      {/* Legend */}
      <div style={{
        backgroundColor: colors.bgSecondary,
        borderTop: `1px solid ${colors.borderColor}`,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { level: 'HIGH', color: '#EF4444' },
            { level: 'MEDIUM', color: '#F59E0B' },
            { level: 'LOW', color: '#10B981' }
          ].map(({ level, color }) => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }} />
              <span style={{ fontSize: '12px', color: colors.textSecondary }}>{level}</span>
            </div>
          ))}
          <span style={{ fontSize: '12px', color: colors.textSecondary }}>• Circle size = scam volume</span>
        </div>

        {/* Ticker */}
        <div style={{ display: isMobile ? 'none' : 'block', overflow: 'hidden', width: '256px' }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#fbbf24',
            animation: 'scroll 20s linear infinite',
            whiteSpace: 'nowrap'
          }}>
            🚨 OTP Fraud rising in Delhi +47% &nbsp;&nbsp; 🚨 Fake IRCTC scam spreading in Mumbai &nbsp;&nbsp; 🚨 Job fraud alert in Bangalore &nbsp;&nbsp;
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </motion.div>
  );
}
