import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext.jsx";
import RiskMeter from "./RiskMeter.jsx";

const UPI_LINKS = {
  gpay: (mobile, amount) => `tez://upi/pay?pa=${mobile}@upi&am=${amount}&cu=INR`,
  phonepe: (mobile, amount) => `phonepe://pay?pa=${mobile}@upi&am=${amount}&cu=INR`,
  paytm: (mobile, amount) => `paytmmp://pay?pa=${mobile}@upi&am=${amount}`,
  bhim: (mobile, amount) => `upi://pay?pa=${mobile}@upi&am=${amount}&cu=INR`,
};

export default function ResultCard({ result, onReset, onBlock }) {
  const { colors } = useTheme();
  const { risk_score, risk_level, explanation, scam_type, reports_count, last_seen_cities, recommendation, red_flags, source, mobile, amount } = result;

  const isSafe = risk_level === "LOW";
  const isDanger = risk_level === "HIGH";
  const isCaution = risk_level === "MEDIUM";

  const configs = {
    LOW: {
      bg: "from-emerald-900/30 to-emerald-800/10",
      border: "border-emerald-500/30",
      icon: "✅",
      title: "SAFE TO PAY",
      titleColor: "text-emerald-400",
      glow: "safe-glow",
    },
    HIGH: {
      bg: "from-red-900/40 to-red-800/10",
      border: "border-red-500/40",
      icon: "🚨",
      title: "DANGER — DO NOT PAY",
      titleColor: "text-red-400",
      glow: "danger-pulse",
    },
    MEDIUM: {
      bg: "from-amber-900/30 to-amber-800/10",
      border: "border-amber-500/30",
      icon: "⚠️",
      title: "PROCEED WITH CAUTION",
      titleColor: "text-amber-400",
      glow: "",
    },
  };

  const cfg = configs[risk_level] || configs.MEDIUM;

  const handleUPIOpen = (app) => {
    const url = UPI_LINKS[app]?.(mobile, amount);
    if (url) window.open(url, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className={`rounded-2xl border bg-gradient-to-b ${cfg.bg} ${cfg.border} p-6 ${cfg.glow}`}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-4xl">{cfg.icon}</span>
        <h2 className={`text-2xl font-black mt-2 tracking-wide ${cfg.titleColor}`}>
          {cfg.title}
        </h2>
        {scam_type && (
          <div className="text-center">
            <span style={{
              display: "inline-block",
              marginTop: "8px",
              padding: "6px 12px",
              borderRadius: "9999px",
              backgroundColor: isCaution ? "#b45000" : "#cc0000",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              {scam_type}
            </span>
            {/* Red Flags Pills */}
            {red_flags && red_flags.length > 0 && (
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "8px",
                marginTop: "12px"
              }}>
                {red_flags.map((flag, idx) => (
                  <span key={idx} style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    backgroundColor: "#3d0000",
                    border: "1px solid #ff4444",
                    color: "#ff6666",
                    fontSize: "11px",
                    fontWeight: "500"
                  }}>
                    🚩 {flag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Risk Meter */}
      <div className="flex justify-center mb-6">
        <RiskMeter score={risk_score} size={180} />
      </div>

      {/* Details */}
      <div className="space-y-4 mb-6">
        {/* Explanation */}
        <div style={{
          backgroundColor: colors.isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
          borderRadius: "12px",
          padding: "16px"
        }}>
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-2">
            🤖 Claude AI Analysis
          </p>
          <p style={{ color: colors.isDark ? '#cccccc' : '#333333' }} className="text-sm leading-relaxed">{explanation}</p>
        </div>

        {/* Source Badge */}
        {/* Show fraud database badge only for HIGH/MEDIUM risks */}
        {source === "fraud_database" && risk_level !== "LOW" && (
          <div style={{
            backgroundColor: colors.isDark ? 'rgba(255,68,68,0.15)' : 'rgba(180,0,0,0.08)',
            border: `1px solid ${colors.isDark ? '#ff4444' : '#cc0000'}`,
            borderRadius: "8px",
            padding: "10px 12px",
            textAlign: "center"
          }}>
            <p style={{
              fontSize: "13px",
              fontWeight: "500",
              color: colors.isDark ? '#ff6666' : '#990000',
              margin: "0"
            }}>
              ⚠️ Found in fraud database
            </p>
          </div>
        )}

        {/* Show "No reports found" for LOW risk or transaction_analysis source */}
        {(source === "transaction_analysis" || risk_level === "LOW") && (
          <div style={{
            backgroundColor: colors.isDark ? 'rgba(0,255,136,0.15)' : 'rgba(0,180,80,0.12)',
            border: `1px solid ${colors.isDark ? '#00ff88' : '#00a050'}`,
            borderRadius: "8px",
            padding: "10px 12px",
            textAlign: "center"
          }}>
            <p style={{
              fontSize: "13px",
              fontWeight: "500",
              color: colors.isDark ? '#00ff88' : '#006830',
              margin: "0"
            }}>
              ✅ No reports found — Transaction analyzed
            </p>
          </div>
        )}

        {/* Stats */}
        {(reports_count > 0 || (last_seen_cities && last_seen_cities.length > 0)) && (
          <div className="grid grid-cols-2 gap-3">
            {reports_count > 0 && (
              <div style={{
                backgroundColor: colors.isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                borderRadius: "12px",
                padding: "12px",
                textAlign: "center"
              }}>
                <p className="text-2xl font-black text-red-400">{reports_count}</p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>Fraud Reports</p>
              </div>
            )}
            {last_seen_cities && last_seen_cities.length > 0 && (
              <div style={{
                backgroundColor: colors.isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                borderRadius: "12px",
                padding: "12px",
                textAlign: "center"
              }}>
                <p className="text-sm font-bold text-orange-400">
                  {last_seen_cities.join(", ")}
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>Last seen</p>
              </div>
            )}
          </div>
        )}

        {/* Recommendation */}
        <div style={{
          backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
          borderLeft: isSafe ? '4px solid #00aa55' : (isCaution ? '4px solid #f5a623' : '4px solid #cc0000'),
          borderRadius: "8px",
          padding: "12px 16px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            width: "100%"
          }}>
            <p style={{
              fontSize: "10px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: colors.isDark ? "#999999" : "#666666",
              margin: "0"
            }}>
              AI RECOMMENDATION
            </p>
            <p style={{
              fontSize: "14px",
              color: colors.isDark ? "#ffffff" : "#1a1a2e",
              margin: "0",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              ✅ {recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {isSafe && (
          <>
            <p style={{ color: colors.isDark ? '#aaaaaa' : '#555555', textAlign: 'center', fontSize: '14px', fontWeight: 500, margin: 0 }}>Choose payment app:</p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px"
            }}>
              {[
                { 
                  key: "gpay", 
                  label: "GPay", 
                  logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg"
                },
                { 
                  key: "phonepe", 
                  label: "PhonePe", 
                  logo: "https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg"
                },
                { 
                  key: "paytm", 
                  label: "Paytm", 
                  logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Paytm_logo.png"
                },
                { 
                  key: "bhim", 
                  label: "BHIM", 
                  logo: "https://www.bhimupi.org.in/sites/default/files/BHIM%20Logo.png"
                },
              ].map((app) => (
                <button key={app.key} onClick={() => handleUPIOpen(app.key)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 8px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    transition: "all 0.2s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px"
                  }}>
                    {app.key === "bhim" ? (
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        background: "linear-gradient(135deg, #00b9f1 0%, #0066cc 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                      }}>
                        BHIM
                      </span>
                    ) : (
                      <img 
                        src={app.logo} 
                        alt={app.label}
                        style={{
                          width: "32px",
                          height: "32px",
                          objectFit: "contain"
                        }}
                      />
                    )}
                  </div>
                  <span style={{
                    fontSize: "12px",
                    color: colors.isDark ? '#aaaaaa' : '#333333',
                    fontWeight: "500"
                  }}>
                    {app.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {isCaution && (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleUPIOpen("gpay")}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #f5a623',
                backgroundColor: colors.isDark ? 'rgba(255,165,0,0.2)' : '#f5a623',
                color: colors.isDark ? '#ffaa00' : '#ffffff',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}>
              Proceed Anyway →
            </button>
          </div>
        )}

        {isDanger && (
          <button onClick={onBlock}
            className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2">
            🚫 BLOCK &amp; REPORT
          </button>
        )}

        <button onClick={onReset}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : '#cccccc'}`,
            backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0',
            color: colors.isDark ? '#ffffff' : '#1a1a2e',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.isDark ? 'rgba(255,255,255,0.08)' : '#e6e6e6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0';
          }}>
          ← Check Another Number
        </button>
      </div>
    </motion.div>
  );
}
