import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";

function CountUp({ end, prefix = "", suffix = "", duration = 2000 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0, startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setVal(Math.round(p * p * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return <>{prefix}{val.toLocaleString("en-IN")}{suffix}</>;
}

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#14B8A6", "#F97316", "#84CC16"];

const formatNum = (n) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n.toLocaleString('en-IN');

export default function Dashboard() {
  const { colors } = useTheme();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Static chart data - hardcoded for deployment stability
  const staticScamData = [
    { name: 'OTP Fraud', count: 1342 },
    { name: 'Fake KYC', count: 987 },
    { name: 'UPI Phishing', count: 756 },
    { name: 'Fake IRCTC', count: 698 },
    { name: 'Investment Fraud', count: 534 },
    { name: 'Job Offer Fraud', count: 445 },
    { name: 'Loan App Scam', count: 378 },
    { name: 'Electricity Bill', count: 289 },
    { name: 'Fake Courier', count: 198 },
    { name: 'Matrimonial Scam', count: 134 },
  ];

  const staticTrendData = [
    { day: 'Day 1', frauds: 45 }, { day: 'Day 5', frauds: 78 },
    { day: 'Day 10', frauds: 123 }, { day: 'Day 15', frauds: 98 },
    { day: 'Day 20', frauds: 167 }, { day: 'Day 25', frauds: 145 },
    { day: 'Day 30', frauds: 189 },
  ];

  useEffect(() => {
    axios.get("/api/stats").then((r) => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center"><p className="text-4xl mb-3 animate-pulse">📊</p><p className="text-gray-400">Loading dashboard...</p></div>
    </div>
  );

  const topCards = [
    { icon: "🛡️", label: "Scams Blocked Today", value: stats?.scams_blocked_today || 2847, color: "text-indigo-400", bg: "from-indigo-500/10 to-purple-500/5", border: "border-indigo-500/20" },
    { icon: "👥", label: "Users Protected", value: Number(stats?.users_protected) || 1200000, color: "text-emerald-400", bg: "from-emerald-500/10 to-teal-500/5", border: "border-emerald-500/20", formatType: "millions" },
    { icon: "💰", label: "Amount Saved (₹ Cr)", value: Number(stats?.amount_saved_cr) || 4.7, color: "text-amber-400", bg: "from-amber-500/10 to-orange-500/5", border: "border-amber-500/20", formatType: "currency" },
    { icon: "🔍", label: "Active Patterns", value: stats?.active_patterns || 127, color: "text-pink-400", bg: "from-pink-500/10 to-red-500/5", border: "border-pink-500/20" },
  ];

  // Use static data for charts instead of API
  const scamData = staticScamData;
  const trendData = staticTrendData;

  const safeToday = stats?.safe_today || 1847;
  const cautionToday = stats?.caution_today || 634;
  const blockedToday = stats?.blocked_today || 366;
  const totalToday = safeToday + cautionToday + blockedToday;

  const pieData = [
    { name: "Safe", value: safeToday, color: "#10B981" },
    { name: "Caution", value: cautionToday, color: "#F59E0B" },
    { name: "Blocked", value: blockedToday, color: "#EF4444" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: colors.textPrimary }}>Analytics Dashboard</h1>
        <p className="mt-1" style={{ color: colors.textSecondary }}>Real-time fraud detection statistics</p>
      </div>

      {/* Top Stats */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {topCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-2xl border p-5 card-hover"
            style={{
              backgroundColor: colors.statCardBg,
              borderColor: colors.borderColor,
              boxShadow: colors.statCardShadow
            }}>
            <span className="text-3xl">{c.icon}</span>
            <p className={`text-2xl md:text-3xl font-black mt-2 ${c.color}`}>
              {c.formatType === "millions" ? formatNum(c.value) : c.formatType === "currency" ? `₹${c.value}Cr` : <CountUp end={c.value} />}
            </p>
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{
        fontSize: "11px",
        color: colors.isDark ? "#888888" : "#999999",
        fontStyle: "italic",
        textAlign: "center",
        marginTop: "8px",
        marginBottom: "24px"
      }}>
        📊 Stats simulated based on NPCI & cybercrime.gov.in reported fraud data for demonstration purposes
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "3fr 2fr", gap: "24px", marginBottom: "24px" }}>
        <div className="rounded-2xl p-5" style={{ backgroundColor: colors.chartBg, borderColor: colors.borderColor, border: `1px solid ${colors.borderColor}` }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>Top Scam Types This Week</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scamData} margin={{ top: 0, right: 0, bottom: 40, left: 0 }}>
                <XAxis dataKey="name" tick={{ fill: colors.textSecondary, fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: colors.textSecondary, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: colors.bgSecondary, border: `1px solid ${colors.borderColor}`, borderRadius: 8, color: colors.textPrimary }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {scamData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: colors.chartBg, borderColor: colors.borderColor, border: `1px solid ${colors.borderColor}` }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>Risk Distribution Today</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: colors.bgSecondary, border: `1px solid ${colors.borderColor}`, borderRadius: 8, color: colors.textPrimary }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span style={{ color: colors.textSecondary }}>{d.name}</span>
                </div>
                <span className="font-bold" style={{ color: colors.textPrimary }}>{d.value.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "3fr 2fr", gap: "24px", marginBottom: "24px" }}>
        <div className="rounded-2xl p-5" style={{ backgroundColor: colors.chartBg, borderColor: colors.borderColor, border: `1px solid ${colors.borderColor}` }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>Fraud Attempts — Last 30 Days</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <XAxis dataKey="day" tick={{ fill: colors.textSecondary, fontSize: 10 }} />
                <YAxis tick={{ fill: colors.textSecondary, fontSize: 10 }} />
                <Tooltip contentStyle={{ background: colors.bgSecondary, border: `1px solid ${colors.borderColor}`, borderRadius: 8, color: colors.textPrimary }} />
                <Line type="monotone" dataKey="frauds" stroke="#6366F1" strokeWidth={2} dot={false}
                  style={{ filter: "drop-shadow(0 0 4px #6366F1)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: colors.chartBg, borderColor: colors.borderColor, border: `1px solid ${colors.borderColor}` }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>Recent Checks</h2>
          <div className="space-y-2">
            {(stats?.recent_activity?.length > 0 ? stats.recent_activity : [
              { mobile: "+91-98765-XXXXX", amount: 5000, risk_level: "HIGH" },
              { mobile: "+91-87654-XXXXX", amount: 500, risk_level: "LOW" },
              { mobile: "+91-99988-XXXXX", amount: 15000, risk_level: "HIGH" },
              { mobile: "+91-77766-XXXXX", amount: 200, risk_level: "LOW" },
              { mobile: "+91-88877-XXXXX", amount: 4999, risk_level: "MEDIUM" },
            ]).slice(0, 6).map((item, i) => {
              const riskColors = { HIGH: "text-red-400 bg-red-500/10", LOW: "text-emerald-400 bg-emerald-500/10", MEDIUM: "text-amber-400 bg-amber-500/10" };
              return (
                <div key={i} className="flex items-center justify-between text-xs py-2 border-b" style={{ borderColor: colors.borderColor }}>
                  <span style={{ color: colors.textSecondary }}>{item.mobile}</span>
                  <span style={{ color: colors.textSecondary }}>₹{Number(item.amount).toLocaleString("en-IN")}</span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${riskColors[item.risk_level] || riskColors.MEDIUM}`}>
                    {item.risk_level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
