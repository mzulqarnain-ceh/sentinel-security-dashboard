import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Wifi, AlertTriangle, Server, Activity,
  Search, X, ChevronRight, Terminal, Zap, Globe,
  RefreshCw, Lock, Eye, Radio, Cpu, MemoryStick,
  Clock, CheckCircle, XCircle, AlertCircle, Filter,
  Power, Unplug, RotateCcw, WifiOff, Radar,
  LayoutDashboard, ShieldAlert, Sliders, Settings,
  Plus, Trash2, Copy, EyeOff, Check, AlertOctagon, Bell, Key, Menu
} from "lucide-react";

// Injected Custom Google Fonts, Premium Scrollbars and Table Fixes
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Rajdhani:wght@500;600;700;800&display=swap');
  
  .cyber-title {
    font-family: 'Rajdhani', sans-serif !important;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 800;
  }
  
  .cyber-number {
    font-family: 'Rajdhani', sans-serif !important;
    font-weight: 700;
  }

  .cyber-body {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }

  .cyber-mono {
    font-family: 'Fira Code', monospace !important;
  }

  /* Thin premium scrollbars */
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: rgba(2, 5, 9, 0.4);
    border-radius: 8px;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.25);
    border-radius: 8px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(6, 182, 212, 0.55);
  }

  /* Responsive table scrollbar container */
  .table-responsive-container {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* Fix for dark-mode dropdown options styling */
  select option {
    background-color: #0b0f19 !important;
    color: #e2e8f0 !important;
  }
`;

const INITIAL_LOGS = [
  { id: 1, time: "14:22:04", level: "CRITICAL", msg: "Bruteforce attempt blocked from IP 192.168.1.104", ip: "192.168.1.104" },
  { id: 2, time: "14:21:58", level: "WARNING", msg: "Unusual outbound traffic spike on port 443 — Node EU-West", ip: "" },
  { id: 3, time: "14:21:44", level: "INFO", msg: "Threat database sync completed. 2,841 new signatures loaded.", ip: "" },
  { id: 4, time: "14:21:31", level: "CRITICAL", msg: "SQL injection attempt detected from IP 10.0.0.77 — blocked", ip: "10.0.0.77" },
  { id: 5, time: "14:21:19", level: "INFO", msg: "Node AS-South reconnected. Latency normalized to 18ms.", ip: "" },
  { id: 6, time: "14:20:55", level: "WARNING", msg: "Certificate expiry warning on endpoint api.sentinel.net — 7 days", ip: "" },
  { id: 7, time: "14:20:38", level: "CRITICAL", msg: "DDoS packet flood from subnet 203.0.113.0/24 — traffic throttled", ip: "203.0.113.0" },
  { id: 8, time: "14:20:17", level: "INFO", msg: "Firewall rule set v4.7.2 applied successfully across all nodes.", ip: "" },
  { id: 9, time: "14:19:52", level: "WARNING", msg: "Memory pressure at 87% on Node US-East — recommend restart", ip: "" },
  { id: 10, time: "14:19:30", level: "CRITICAL", msg: "Port scan detected from IP 172.16.0.45 — source isolated", ip: "172.16.0.45" },
];

const INITIAL_NODES = [
  { id: "us-east", label: "US-East", location: "Virginia, USA", cpu: 87, mem: 79, ping: 12, status: "HIGH_LOAD" },
  { id: "us-west", label: "US-West", location: "Oregon, USA", cpu: 34, mem: 52, ping: 8, status: "ONLINE" },
  { id: "eu-west", label: "EU-West", location: "Frankfurt, DE", cpu: 61, mem: 66, ping: 22, status: "ONLINE" },
  { id: "eu-north", label: "EU-North", location: "Stockholm, SE", cpu: 28, mem: 41, ping: 31, status: "ONLINE" },
  { id: "as-south", label: "AS-South", location: "Singapore, SG", cpu: 93, mem: 88, ping: 54, status: "UNDER_ATTACK" },
  { id: "ap-east", label: "AP-East", location: "Tokyo, JP", cpu: 45, mem: 58, ping: 67, status: "ONLINE" },
];

const NODE_LOGS = {
  "us-east": ["[WARN] Memory usage at 79% — approaching threshold", "[INFO] 847 active connections", "[WARN] CPU spike detected: 87% utilization", "[INFO] Load balancer redistributing 120 req/s", "[WARN] Disk I/O queue depth: 34"],
  "us-west": ["[INFO] All systems nominal", "[INFO] 312 active connections", "[INFO] SSL certificates valid for 89 days", "[INFO] Backup completed: 2.4GB synced", "[INFO] CDN cache hit ratio: 97.3%"],
  "eu-west": ["[INFO] 521 active connections", "[WARN] Outbound traffic anomaly — port 8080", "[INFO] Firewall rules v4.7.2 active", "[INFO] BGP routes stable — 3 peers", "[WARN] Latency variance ±6ms detected"],
  "eu-north": ["[INFO] All systems nominal", "[INFO] 189 active connections", "[INFO] Temperature sensors: 38°C nominal", "[INFO] Redundant power feed active", "[INFO] IPv6 tunnel MTU optimized"],
  "as-south": ["[CRIT] DDoS attack in progress — 2.1Gbps flood", "[CRIT] Packet loss at 23% — scrubbing active", "[CRIT] 14 malicious IPs isolated", "[WARN] Bandwidth saturation at 94%", "[CRIT] Emergency throttling engaged"],
  "ap-east": ["[INFO] 278 active connections", "[INFO] BGP session stable with 2 upstreams", "[INFO] NTP sync OK — drift < 1ms", "[INFO] Geo-block list updated: 1,204 ranges", "[WARN] Inter-DC link latency elevated: 67ms"],
};

const STATUS_CONFIG = {
  ONLINE: { label: "ONLINE", color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", shadow: "rgba(16,185,129,0.2)" },
  HIGH_LOAD: { label: "HIGH LOAD", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", shadow: "rgba(245,158,11,0.2)" },
  UNDER_ATTACK: { label: "UNDER ATTACK", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", shadow: "rgba(239,68,68,0.3)" },
  ISOLATED: { label: "ISOLATED", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)", shadow: "rgba(139,92,246,0.2)" },
  REBOOTING: { label: "REBOOTING", color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.3)", shadow: "rgba(6,182,212,0.2)" },
};

const LOG_COLORS = {
  CRITICAL: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", label: "CRIT" },
  WARNING: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", label: "WARN" },
  INFO: { color: "#06b6d4", bg: "rgba(6,182,212,0.08)", label: "INFO" },
};

function useTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

// Responsive hook to detect real-time window resizing
function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return size;
}

function Sparkline({ color = "#10b981" }) {
  const points = [18, 22, 19, 24, 21, 26, 23, 24];
  const max = Math.max(...points), min = Math.min(...points);
  const h = 36, w = 100;
  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      <polyline fill={`${color}20`} stroke="none" points={`0,${h} ${pts} ${w},${h}`} />
    </svg>
  );
}

function CircularProgress({ value, color = "#10b981", size = 80 }) {
  const r = 32, cx = 40, cy = 40;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
      <motion.circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
      <text x={cx} y={cy + 5} textAnchor="middle" fill={color} fontSize="14" fontWeight="700" className="cyber-mono">
        {value}%
      </text>
    </svg>
  );
}

function MetricCard({ icon: Icon, label, children, accentColor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      style={{
        background: "rgba(10, 15, 30, 0.7)",
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 16,
        padding: "20px 22px",
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        opacity: 0.7,
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon size={14} color={accentColor} />
        <span className="cyber-title" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{label}</span>
      </div>
      {children}
    </motion.div>
  );
}

function NodeCard({ node, onClick }) {
  const s = STATUS_CONFIG[node.status];
  return (
    <motion.div
      layout
      onClick={() => onClick(node)}
      whileHover={{
        scale: 1.02,
        borderColor: s.color,
        boxShadow: `0 0 15px ${s.shadow}`
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: "rgba(10,15,25,0.8)",
        border: `1px solid ${s.border}`,
        borderRadius: 12,
        padding: "16px 18px",
        cursor: "pointer",
        backdropFilter: "blur(8px)",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div className="cyber-mono" style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14 }}>{node.label}</div>
          <div className="cyber-body" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{node.location}</div>
        </div>
        <motion.div
          animate={node.status === "UNDER_ATTACK" ? { opacity: [1, 0.3, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.8 }}
          style={{
            fontSize: 9, fontFamily: "monospace", fontWeight: 700,
            letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 20,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
          }}
        >
          {s.label}
        </motion.div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "CPU", value: `${node.cpu}%`, color: node.cpu > 80 ? "#ef4444" : node.cpu > 60 ? "#f59e0b" : "#10b981" },
          { label: "MEM", value: `${node.mem}%`, color: node.mem > 80 ? "#ef4444" : node.mem > 60 ? "#f59e0b" : "#10b981" },
          { label: "PING", value: `${node.ping}ms`, color: node.ping > 50 ? "#f59e0b" : "#10b981" },
        ].map(m => (
          <div key={m.label} style={{ textAlign: "center" }}>
            <div className="cyber-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>{m.label}</div>
            <div className="cyber-mono" style={{ fontSize: 13, fontWeight: 700, color: m.color, marginTop: 2 }}>{m.value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function NodeDrawer({ node, onClose, onAction }) {
  if (!node) return null;
  const s = STATUS_CONFIG[node.status];
  const logs = NODE_LOGS[node.id] || [];
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(420px, 100vw)",
        background: "rgba(8,12,20,0.97)",
        borderLeft: `1px solid rgba(255,255,255,0.08)`,
        zIndex: 1000,
        display: "flex", flexDirection: "column",
        backdropFilter: "blur(20px)",
      }}
    >
      <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="cyber-mono" style={{ fontWeight: 700, fontSize: 18, color: "#e2e8f0" }}>{node.label}</div>
            <div className="cyber-body" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{node.location}</div>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#94a3b8" }}>
            <X size={16} />
          </motion.button>
        </div>
        <div style={{ marginTop: 12, display: "inline-block", fontSize: 10, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.1em", padding: "4px 10px", borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
          ● {s.label}
        </div>
      </div>

      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "CPU LOAD", value: `${node.cpu}%`, color: node.cpu > 80 ? "#ef4444" : node.cpu > 60 ? "#f59e0b" : "#10b981" },
            { label: "MEMORY", value: `${node.mem}%`, color: node.mem > 80 ? "#ef4444" : node.mem > 60 ? "#f59e0b" : "#10b981" },
            { label: "LATENCY", value: `${node.ping}ms`, color: "#06b6d4" },
          ].map(m => (
            <div key={m.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
              <div className="cyber-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{m.label}</div>
              <div className="cyber-mono" style={{ fontSize: 20, fontWeight: 700, color: m.color, marginTop: 4 }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="custom-scroll" style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
        <div className="cyber-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", marginBottom: 12 }}>// SYSTEM LOG STREAM</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {logs.map((log, i) => {
            const isCrit = log.startsWith("[CRIT");
            const isWarn = log.startsWith("[WARN");
            const c = isCrit ? "#ef4444" : isWarn ? "#f59e0b" : "#06b6d4";
            return (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="cyber-mono"
                style={{ fontSize: 12, color: c, lineHeight: 1.6, padding: "8px 12px", borderRadius: 8, background: `${c}08`, borderLeft: `2px solid ${c}40` }}>
                {log}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10 }}>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => onAction(node.id, "REBOOTING")}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", borderRadius: 10, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", fontFamily: "monospace", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" }}>
          <RotateCcw size={13} /> REBOOT NODE
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => onAction(node.id, "ISOLATED")}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", borderRadius: 10, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#8b5cf6", fontFamily: "monospace", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" }}>
          <Unplug size={13} /> ISOLATE NODE
        </motion.button>
      </div>
    </motion.div>
  );
}

function ScanModal({ progress, phase }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,5,15,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backdropFilter: "blur(12px)" }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        style={{ marginBottom: 32 }}
      >
        <Radar size={48} color="#06b6d4" style={{ filter: "drop-shadow(0 0 16px #06b6d4)" }} />
      </motion.div>
      <div style={{ position: "relative", width: 160, height: 160, marginBottom: 32 }}>
        <svg width={160} height={160} viewBox="0 0 160 160">
          <circle cx={80} cy={80} r={70} fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="8" />
          <motion.circle
            cx={80} cy={80} r={70}
            fill="none" stroke="#06b6d4" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 70}`}
            animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - progress / 100) }}
            transition={{ duration: 0.1 }}
            transform="rotate(-90 80 80)"
            style={{ filter: "drop-shadow(0 0 10px #06b6d4)" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="cyber-number" style={{ fontSize: 32, color: "#06b6d4" }}>{Math.round(progress)}%</div>
          <div className="cyber-title" style={{ fontSize: 10, color: "rgba(6,182,212,0.6)" }}>SCANNING</div>
        </div>
      </div>
      <div className="cyber-mono" style={{ fontSize: 13, color: "#06b6d4", letterSpacing: "0.08em", opacity: 0.8 }}>{phase}</div>
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
        className="cyber-mono"
        style={{ marginTop: 8, fontSize: 11, color: "rgba(6,182,212,0.5)", letterSpacing: "0.15em" }}
      >
        DO NOT INTERRUPT SCAN
      </motion.div>
    </motion.div>
  );
}

export default function SentinelDashboard() {
  const time = useTime();
  const { width } = useWindowSize();
  const isMobile = width < 1024;      // Collapses standard sidebar & stacks dashboard/grids
  const isSmallMobile = width < 640;  // Stacks header text, node cards & metrics individually

  const [activePage, setActivePage] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [logFilter, setLogFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState("");

  // Dashboard Integrity / State Values
  const [threats, setThreats] = useState(14);
  const [integrity, setIntegrity] = useState(94);
  const [latency, setLatency] = useState(24);

  // Custom Success Alert Notification State
  const [alertNotification, setAlertNotification] = useState(null);
  const triggerNotification = (message, type = "success") => {
    setAlertNotification({ message, type });
    setTimeout(() => setAlertNotification(null), 3000);
  };

  // CVE Scanner States
  const [scanningCVEs, setScanningCVEs] = useState(false);
  const [cveProgress, setCveProgress] = useState(0);
  const [cveLogs, setCveLogs] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([
    { id: "CVE-2026-1049", cve: "CVE-2026-1049", title: "OpenSSL Remote Code Execution Vulnerability", severity: "CRITICAL", score: "9.8", component: "openSSL library", status: "UNPATCHED" },
    { id: "CVE-2026-3821", cve: "CVE-2026-3821", title: "SQL Injection Vector in User Authentication API", severity: "HIGH", score: "8.4", component: "auth-router module", status: "UNPATCHED" },
    { id: "CVE-2026-4491", cve: "CVE-2026-4491", title: "Reflected XSS on Student Verification Page", severity: "MEDIUM", score: "6.1", component: "degree-verification-frontend", status: "UNPATCHED" },
    { id: "CVE-2026-7789", cve: "CVE-2026-7789", title: "Insecure Direct Object Reference (IDOR) in Settings Endpoint", severity: "LOW", score: "3.5", component: "user-controller-backend", status: "PATCHED" },
  ]);

  // Firewall CRUD states
  const [firewallRules, setFirewallRules] = useState([
    { id: 1, direction: "INBOUND", port: "443", protocol: "TCP", ip: "ANY", action: "ALLOW", active: true },
    { id: 2, direction: "INBOUND", port: "80", protocol: "TCP", ip: "ANY", action: "ALLOW", active: true },
    { id: 3, direction: "INBOUND", port: "22", protocol: "TCP", ip: "192.168.1.100", action: "ALLOW", active: true },
    { id: 4, direction: "INBOUND", port: "3389", protocol: "TCP", ip: "ANY", action: "DENY", active: true },
    { id: 5, direction: "OUTBOUND", port: "ANY", protocol: "UDP", ip: "8.8.8.8", action: "ALLOW", active: true },
  ]);
  const [newRule, setNewRule] = useState({ direction: "INBOUND", port: "", protocol: "TCP", ip: "ANY", action: "ALLOW" });

  // Settings States
  const [settingsTab, setSettingsTab] = useState("general");
  const [scanInterval, setScanInterval] = useState(15);
  const [alertsEmail, setAlertsEmail] = useState(true);
  const [alertsSlack, setAlertsSlack] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState("https://hooks.slack." + "com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX");
  const [apiKey, setApiKey] = useState("st_live_5f91e920d3ab4e9c7a72d82bb81b490f");
  const [showKey, setShowKey] = useState(false);

  const nodesOnline = nodes.filter(n => n.status !== "ISOLATED").length;

  const filteredLogs = logs.filter(log => {
    const matchFilter = logFilter === "ALL" || log.level === logFilter;
    const matchSearch = !searchQuery || log.msg.toLowerCase().includes(searchQuery.toLowerCase()) || log.ip.includes(searchQuery);
    return matchFilter && matchSearch;
  });

  const triggerScan = useCallback(() => {
    if (scanning) return;
    setScanning(true);
    setScanProgress(0);
    const phases = ["Probing firewall perimeter...", "Scanning threat signatures...", "Analyzing packet streams...", "Verifying encryption layers...", "Compiling threat report..."];
    let p = 0;
    let phaseIdx = 0;
    setScanPhase(phases[0]);
    const interval = setInterval(() => {
      p += Math.random() * 6 + 2;
      if (p > 100) p = 100;
      setScanProgress(p);
      const newIdx = Math.floor((p / 100) * phases.length);
      if (newIdx !== phaseIdx && newIdx < phases.length) {
        phaseIdx = newIdx;
        setScanPhase(phases[phaseIdx]);
      }
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setScanning(false);
          setThreats(0);
          setIntegrity(99);
          setLogs(prev => [{
            id: Date.now(), time: new Date().toTimeString().slice(0, 8),
            level: "INFO", msg: "[SYSTEM] Deep scan complete. Threat database updated. All systems clean. 0 active threats.", ip: "",
          }, ...prev]);
          triggerNotification("Threat database cleared. Systems 100% clean.");
        }, 400);
      }
    }, 80);
  }, [scanning]);

  // Run vulnerability scan simulation
  const runCveScan = () => {
    if (scanningCVEs) return;
    setScanningCVEs(true);
    setCveProgress(0);
    setCveLogs([]);

    const logMessages = [
      { t: 0, m: "[INIT] Initializing Sentinel Security Scanner v2.1..." },
      { t: 400, m: "[CONNECT] Connected to Centralized CVE Vulnerability Database." },
      { t: 900, m: "[SCAN] Probing 6 active global network nodes..." },
      { t: 1400, m: "[SCAN] Node US-East (Virginia, USA) at port 80... STABLE" },
      { t: 1800, m: "[ALERT] Vulnerability found on Node US-West: openSSL library (CVE-2026-1049)" },
      { t: 2200, m: "[ALERT] Vulnerability found on Node EU-North: auth-router module (CVE-2026-3821)" },
      { t: 2700, m: "[SCAN] Auditing dynamic frontend assets and API interfaces..." },
      { t: 3100, m: "[ALERT] XSS vulnerability flagged on verification page (CVE-2026-4491)" },
      { t: 3600, m: "[SCAN] Verification complete. Generating summary report..." },
      { t: 4000, m: "[COMPLETE] Audit finished. 3 unpatched security vectors flagged." }
    ];

    logMessages.forEach(item => {
      setTimeout(() => {
        setCveLogs(prev => [...prev, item.m]);
        setCveProgress(prev => Math.min(prev + 10, 100));
        if (item.t === 4000) {
          setScanningCVEs(false);
          setCveProgress(100);
          triggerNotification("Security audit complete. 3 concerns flagged.");
        }
      }, item.t);
    });
  };

  // Dynamic CRUD operations for Firewall Rules
  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRule.port) {
      triggerNotification("Port cannot be empty!", "error");
      return;
    }
    const rule = {
      id: Date.now(),
      ...newRule,
      active: true
    };
    setFirewallRules(prev => [...prev, rule]);
    setNewRule({ direction: "INBOUND", port: "", protocol: "TCP", ip: "ANY", action: "ALLOW" });
    setIntegrity(prev => Math.min(prev + 1, 100));
    triggerNotification(`Firewall Policy added: ${rule.direction} ${rule.port}/${rule.protocol}`);
  };

  const handleDeleteRule = (id) => {
    setFirewallRules(prev => prev.filter(r => r.id !== id));
    triggerNotification("Firewall policy deleted successfully.");
  };

  const handleToggleRule = (id) => {
    setFirewallRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    triggerNotification("Policy rule state toggled.");
  };

  // Hotpatching simulation for CVE scanner
  const handleApplyPatch = (id) => {
    setVulnerabilities(prev => prev.map(v => v.id === id ? { ...v, status: "PATCHED" } : v));
    triggerNotification(`Security patch applied for ${id}`);
    setIntegrity(prev => Math.min(prev + 2, 100));
    setLogs(prev => [{
      id: Date.now(), time: new Date().toTimeString().slice(0, 8),
      level: "INFO", msg: `[HOTPATCH] Successfully patched vulnerability vectors for ${id}`, ip: "",
    }, ...prev]);
  };

  const handleNodeAction = (nodeId, newStatus) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: newStatus } : n));
    setSelectedNode(prev => prev ? { ...prev, status: newStatus } : null);
    if (newStatus === "REBOOTING") {
      setTimeout(() => {
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: "ONLINE", cpu: 30, mem: 45 } : n));
        setSelectedNode(prev => prev && prev.id === nodeId ? { ...prev, status: "ONLINE", cpu: 30, mem: 45 } : prev);
        triggerNotification(`Node ${nodeId.toUpperCase()} successfully rebooted.`);
      }, 3000);
    }
  };

  useEffect(() => {
    const t = setInterval(() => {
      setLatency(Math.floor(Math.random() * 15 + 18));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const fmt = d => d.toLocaleTimeString("en-US", { hour12: false });

  // Generate dynamic random API key
  const handleGenerateKey = () => {
    const chars = "abcdef0123456789";
    let newKey = "st_live_";
    for (let i = 0; i < 32; i++) {
      newKey += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(newKey);
    triggerNotification("Generated new Developer API Token");
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    triggerNotification("API Key copied to clipboard!");
  };

  return (
    <div className="cyber-body" style={{
      minHeight: "100vh",
      background: "#020509",
      backgroundImage: "radial-gradient(ellipse at 20% 10%, rgba(6,182,212,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(239,68,68,0.04) 0%, transparent 50%)",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: isMobile ? "column" : "row", // dynamically stack sidebar and body on mobile
    }}>
      {/* Dynamic CSS Styling Injection */}
      <style dangerouslySetInnerHTML={{ __html: fontStyles }} />

      {/* Floating Success Alert Toast */}
      <AnimatePresence>
        {alertNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: "fixed", top: 24, right: 24, zIndex: 3000,
              background: alertNotification.type === "error" ? "rgba(239, 68, 68, 0.95)" : "rgba(6, 182, 212, 0.95)",
              backdropFilter: "blur(8px)", color: "#fff",
              padding: "14px 20px", borderRadius: 12,
              display: "flex", alignItems: "center", gap: 10,
              boxShadow: alertNotification.type === "error" ? "0 0 20px rgba(239,68,68,0.3)" : "0 0 20px rgba(6,182,212,0.3)",
              border: alertNotification.type === "error" ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {alertNotification.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
            <span className="cyber-mono" style={{ fontSize: 13, fontWeight: 600 }}>{alertNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE TOP BAR HEADER */}
      {isMobile && (
        <div style={{
          height: 60,
          background: "rgba(6, 10, 18, 0.9)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#06b6d4", display: "flex", alignItems: "center", outline: "none" }}
            >
              <Menu size={22} />
            </button>
            <span className="cyber-title" style={{ fontSize: 16, color: "#f1f5f9" }}>
              SENTINEL
            </span>
          </div>
          <div className="cyber-number" style={{ fontSize: 14, color: "#06b6d4", fontWeight: 700 }}>
            {fmt(time)}
          </div>
        </div>
      )}

      {/* DESKTOP FIXED SIDEBAR NAVIGATION */}
      {!isMobile && (
        <div style={{
          width: 250,
          background: "rgba(6, 10, 18, 0.75)",
          borderRight: "1px solid rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(20px)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
          flexShrink: 0,
          zIndex: 50,
        }}>
          {/* Brand Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 8 }}>
            <div style={{ position: "relative" }}>
              <Shield size={24} color="#06b6d4" style={{ filter: "drop-shadow(0 0 8px #06b6d4)" }} />
              <div style={{ position: "absolute", inset: -3, borderRadius: "50%", border: "1px solid rgba(6,182,212,0.3)" }} />
            </div>
            <span className="cyber-title" style={{ fontSize: 18, color: "#f1f5f9" }}>
              SENTINEL
            </span>
          </div>

          {/* Navigation Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { key: "dashboard", label: "Overview Dashboard", icon: LayoutDashboard },
              { key: "vulnerabilities", label: "CVE Shield Scan", icon: ShieldAlert },
              { key: "firewall", label: "Firewall Policies", icon: Sliders },
              { key: "settings", label: "System Settings", icon: Settings },
            ].map(item => {
              const isActive = activePage === item.key;
              const IconComp = item.icon;
              return (
                <motion.button
                  key={item.key}
                  whileHover={{ background: "rgba(255,255,255,0.03)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActivePage(item.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", padding: "12px 14px", borderRadius: 10,
                    background: isActive ? "rgba(6, 182, 212, 0.08)" : "transparent",
                    border: `1px solid ${isActive ? "rgba(6, 182, 212, 0.25)" : "transparent"}`,
                    color: isActive ? "#06b6d4" : "rgba(255,255,255,0.5)",
                    cursor: "pointer", outline: "none",
                    transition: "color 0.2s, background-color 0.2s",
                    boxShadow: isActive ? "0 0 15px rgba(6, 182, 212, 0.08)" : "none",
                  }}
                >
                  <IconComp size={16} color={isActive ? "#06b6d4" : "rgba(255,255,255,0.4)"} />
                  <span className="cyber-title" style={{ fontSize: 11, fontWeight: isActive ? 700 : 500 }}>
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div style={{ marginTop: "auto", paddingLeft: 8 }}>
            <div className="cyber-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
              SENTINEL AGENT v2.1.0
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MENU OVERLAY DRAWER */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(4px)",
                zIndex: 1000,
              }}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                position: "fixed", top: 0, left: 0, bottom: 0,
                width: 260, background: "rgba(6, 10, 18, 0.98)",
                borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                padding: "24px 16px",
                display: "flex", flexDirection: "column", gap: 28,
                zIndex: 1001,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Shield size={24} color="#06b6d4" style={{ filter: "drop-shadow(0 0 8px #06b6d4)" }} />
                  <span className="cyber-title" style={{ fontSize: 18, color: "#f1f5f9" }}>
                    SENTINEL
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "50%", padding: 6, cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center" }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { key: "dashboard", label: "Overview Dashboard", icon: LayoutDashboard },
                  { key: "vulnerabilities", label: "CVE Shield Scan", icon: ShieldAlert },
                  { key: "firewall", label: "Firewall Policies", icon: Sliders },
                  { key: "settings", label: "System Settings", icon: Settings },
                ].map(item => {
                  const isActive = activePage === item.key;
                  const IconComp = item.icon;
                  return (
                    <motion.button
                      key={item.key}
                      whileHover={{ background: "rgba(255,255,255,0.03)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActivePage(item.key);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        width: "100%", padding: "12px 14px", borderRadius: 10,
                        background: isActive ? "rgba(6, 182, 212, 0.08)" : "transparent",
                        border: `1px solid ${isActive ? "rgba(6, 182, 212, 0.25)" : "transparent"}`,
                        color: isActive ? "#06b6d4" : "rgba(255,255,255,0.5)",
                        cursor: "pointer", outline: "none",
                        transition: "color 0.2s, background-color 0.2s",
                        boxShadow: isActive ? "0 0 15px rgba(6, 182, 212, 0.08)" : "none",
                      }}
                    >
                      <IconComp size={16} color={isActive ? "#06b6d4" : "rgba(255,255,255,0.4)"} />
                      <span className="cyber-title" style={{ fontSize: 11, fontWeight: isActive ? 700 : 500 }}>
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div style={{ marginTop: "auto", paddingLeft: 8 }}>
                <div className="cyber-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                  SENTINEL AGENT v2.1.0
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT SPACE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{
          position: "relative", zIndex: 1, width: "100%", maxWidth: 1250, margin: "0 auto",
          padding: isMobile ? "16px 12px 40px" : "24px 32px 40px",
          boxSizing: "border-box"
        }}>

          {/* HEADER */}
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{
              paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 24,
              display: "flex",
              flexDirection: isSmallMobile ? "column" : "row",
              gap: 16,
              alignItems: isSmallMobile ? "flex-start" : "center",
              justifyContent: "space-between"
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div>
                <div className="cyber-title" style={{ fontWeight: 800, fontSize: isSmallMobile ? 18 : 22, color: "#f1f5f9" }}>
                  SENTINEL <span style={{ color: "#06b6d4" }}>//</span> SEC-MONITOR
                </div>
                <div className="cyber-mono" style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.08em", marginTop: 2 }}>
                  STATUS: SHIELDS ACTIVE — {integrity}% INTEGRITY
                </div>
              </div>
              <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, padding: "3px 10px" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444" }} />
                <span className="cyber-mono" style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", letterSpacing: "0.1em" }}>LIVE</span>
              </motion.div>
            </div>

            {/* Desktop Actions inside Header (Hidden or repositioned on Mobile) */}
            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div className="cyber-number" style={{ fontSize: 20, fontWeight: 700, color: "#06b6d4", letterSpacing: "0.08em", background: "rgba(6,182,212,0.06)", padding: "6px 16px", borderRadius: 8, border: "1px solid rgba(6,182,212,0.15)" }}>
                  {fmt(time)}
                </div>
                {activePage === "dashboard" && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={triggerScan}
                    disabled={scanning}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, background: scanning ? "rgba(6,182,212,0.05)" : "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.4)", color: "#06b6d4", fontFamily: "monospace", fontSize: 12, fontWeight: 700, cursor: scanning ? "not-allowed" : "pointer", letterSpacing: "0.07em" }}>
                    <motion.div animate={scanning ? { rotate: 360 } : {}} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                      <Radar size={15} />
                    </motion.div>
                    TRIGGER DEEP SCAN
                  </motion.button>
                )}
              </div>
            )}

            {/* Mobile Scan Button (Placed in header cleanly if mobile) */}
            {isMobile && activePage === "dashboard" && (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={triggerScan} disabled={scanning}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "10px", borderRadius: 8, background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.4)",
                  color: "#06b6d4", fontFamily: "monospace", fontSize: 11, fontWeight: 700, cursor: scanning ? "not-allowed" : "pointer"
                }}
              >
                <Radar size={14} className={scanning ? "animate-spin" : ""} />
                TRIGGER DEEP MONITOR SCAN
              </motion.button>
            )}
          </motion.header>

          {/* DYNAMIC SCREEN CONTENT AREA */}
          <AnimatePresence mode="wait">
            {activePage === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {/* RESPONSIVE METRIC CARDS GRID */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isSmallMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                  marginBottom: 24
                }}>
                  <MetricCard icon={Activity} label="Network Latency" accentColor="#10b981" delay={0.1}>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                      <div>
                        <motion.div key={latency} animate={{ color: ["#10b981", "#e2e8f0"] }} transition={{ duration: 0.5 }}
                          className="cyber-number"
                          style={{ fontSize: 32, color: "#e2e8f0", lineHeight: 1 }}>
                          {latency}<span style={{ fontSize: 13, color: "#10b981", marginLeft: 3 }}>ms</span>
                        </motion.div>
                        <div className="cyber-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>AVG PING</div>
                      </div>
                      <Sparkline color="#10b981" />
                    </div>
                  </MetricCard>

                  <MetricCard icon={AlertTriangle} label="Active Threats" accentColor="#ef4444" delay={0.2}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <motion.div
                        key={threats}
                        animate={{ scale: [1.3, 1] }}
                        transition={{ duration: 0.4 }}
                        className="cyber-number"
                        style={{ fontSize: 38, color: threats > 0 ? "#ef4444" : "#10b981", lineHeight: 1, textShadow: threats > 0 ? "0 0 20px rgba(239,68,68,0.5)" : "0 0 20px rgba(16,185,129,0.4)" }}
                      >
                        {threats}
                      </motion.div>
                      <div>
                        <div className="cyber-title" style={{ fontSize: 11, fontWeight: 700, color: threats > 0 ? "#ef4444" : "#10b981" }}>{threats > 0 ? "ACTIVE" : "CLEAN"}</div>
                        <motion.div animate={threats > 0 ? { opacity: [1, 0.3, 1] } : { opacity: 1 }} transition={{ repeat: threats > 0 ? Infinity : 0, duration: 1.5 }}>
                          <div className="cyber-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{threats > 0 ? "⚠ MITIGATION ON" : "✓ ALL CLEAR"}</div>
                        </motion.div>
                      </div>
                    </div>
                  </MetricCard>

                  <MetricCard icon={Lock} label="Firewall Integrity" accentColor="#10b981" delay={0.3}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <CircularProgress value={integrity} color={integrity > 95 ? "#10b981" : integrity > 80 ? "#f59e0b" : "#ef4444"} size={64} />
                      <div>
                        <div className="cyber-title" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>RULESET</div>
                        <div className="cyber-mono" style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginTop: 2 }}>v4.7.2</div>
                        <div className="cyber-mono" style={{ fontSize: 9, color: "#10b981", marginTop: 4 }}>4,218 ACTIVE</div>
                      </div>
                    </div>
                  </MetricCard>

                  <MetricCard icon={Server} label="Connected Nodes" accentColor="#06b6d4" delay={0.4}>
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span className="cyber-number" style={{ fontSize: 36, color: "#06b6d4" }}>{nodesOnline}</span>
                        <span className="cyber-mono" style={{ fontSize: 16, color: "rgba(255,255,255,0.2)" }}>/{nodes.length}</span>
                      </div>
                      <div className="cyber-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>NODES ONLINE</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                        {nodes.map(n => (
                          <div key={n.id} style={{ flex: 1, height: 4, borderRadius: 2, background: STATUS_CONFIG[n.status].color, opacity: 0.8 }} />
                        ))}
                      </div>
                    </div>
                  </MetricCard>
                </div>

                {/* RESPONSIVE NODES GRID + LIVE LOGS */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 20
                }}>
                  {/* NODES COLUMNS */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <Globe size={14} color="#06b6d4" />
                      <span className="cyber-title" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Global Network Nodes</span>
                    </div>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: isSmallMobile ? "1fr" : "1fr 1fr",
                      gap: 12
                    }}>
                      <AnimatePresence>
                        {nodes.map(node => (
                          <NodeCard key={node.id} node={node} onClick={setSelectedNode} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* LIVE LOGS STREAM CARD */}
                  <div style={{ background: "rgba(10,15,25,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", minHeight: 400 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <Terminal size={14} color="#06b6d4" />
                      <span className="cyber-title" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Live Event Stream</span>
                      <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                        style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                    </div>

                    {/* Filters */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                      {[
                        { key: "ALL", label: "All Logs", color: "#94a3b8" },
                        { key: "CRITICAL", label: "Critical", color: "#ef4444" },
                        { key: "WARNING", label: "Warnings", color: "#f59e0b" },
                        { key: "INFO", label: "Info", color: "#06b6d4" },
                      ].map(f => (
                        <motion.button key={f.key} whileTap={{ scale: 0.95 }} onClick={() => setLogFilter(f.key)}
                          className="cyber-mono"
                          style={{ padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.07em", border: `1px solid ${logFilter === f.key ? f.color : "rgba(255,255,255,0.1)"}`, background: logFilter === f.key ? `${f.color}15` : "transparent", color: logFilter === f.key ? f.color : "rgba(255,255,255,0.35)", transition: "all 0.15s" }}>
                          {f.label}
                        </motion.button>
                      ))}
                    </div>

                    {/* Search */}
                    <div style={{ position: "relative", marginBottom: 14 }}>
                      <Search size={13} color="rgba(255,255,255,0.25)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by IP or keyword..."
                        className="cyber-mono"
                        style={{ width: "100%", padding: "8px 10px 8px 32px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#e2e8f0", fontSize: 12, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>

                    {/* Log entries */}
                    <div className="custom-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4, maxHeight: 340 }}>
                      <AnimatePresence initial={false}>
                        {filteredLogs.map(log => {
                          const c = LOG_COLORS[log.level];
                          return (
                            <motion.div key={log.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              layout
                              className="cyber-mono"
                              style={{ fontSize: 11, display: "flex", gap: 8, padding: "6px 10px", borderRadius: 6, background: c.bg, borderLeft: `2px solid ${c.color}40`, lineHeight: 1.5 }}>
                              <span style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{log.time}</span>
                              <span style={{ color: c.color, flexShrink: 0, fontWeight: 700 }}>[{c.label}]</span>
                              <span style={{ color: "rgba(255,255,255,0.65)" }}>{log.msg}</span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      {filteredLogs.length === 0 && (
                        <div className="cyber-mono" style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 40 }}>
                          No logs match filter
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CVE VULNERABILITY SCANNER PAGE */}
            {activePage === "vulnerabilities" && (
              <motion.div
                key="vulnerabilities"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {/* Threat Auditing Console Terminal */}
                <div style={{
                  background: "rgba(6, 12, 20, 0.9)",
                  border: "1px solid rgba(6, 182, 212, 0.25)",
                  borderRadius: 16, padding: "20px 24px",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 0 25px rgba(6, 182, 212, 0.05)"
                }}>
                  <div style={{
                    display: "flex",
                    flexDirection: isSmallMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isSmallMobile ? "flex-start" : "center",
                    gap: 12,
                    marginBottom: 16
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Terminal size={18} color="#06b6d4" />
                      <span className="cyber-title" style={{ color: "#e2e8f0", fontSize: 14 }}>Security Audit Terminal</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={runCveScan} disabled={scanningCVEs}
                      style={{
                        padding: "8px 18px", borderRadius: 8, background: scanningCVEs ? "rgba(6, 182, 212, 0.05)" : "rgba(6, 182, 212, 0.15)",
                        border: "1px solid rgba(6, 182, 212, 0.4)", color: "#06b6d4",
                        fontSize: 12, fontWeight: 700, cursor: scanningCVEs ? "not-allowed" : "pointer",
                        fontFamily: "monospace", letterSpacing: "0.05em",
                        display: "flex", alignItems: "center", gap: 8,
                        width: isSmallMobile ? "100%" : "auto", justifyContent: "center"
                      }}
                    >
                      <RefreshCw size={13} className={scanningCVEs ? "animate-spin" : ""} />
                      {scanningCVEs ? `AUDITING... ${cveProgress}%` : "RUN DETAILED AUDIT SCAN"}
                    </motion.button>
                  </div>

                  {/* Simulated CLI Terminal Display */}
                  <div className="custom-scroll" style={{
                    background: "#010408", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12, padding: 16, height: 180, overflowY: "auto",
                    display: "flex", flexDirection: "column", gap: 6,
                  }}>
                    {cveLogs.length === 0 ? (
                      <span className="cyber-mono" style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                        Console idle. Click 'RUN DETAILED AUDIT SCAN' to run cybersecurity scanning sequence.
                      </span>
                    ) : (
                      cveLogs.map((item, idx) => {
                        let c = "#06b6d4";
                        if (item.includes("[ALERT]")) c = "#ef4444";
                        if (item.includes("[COMPLETE]")) c = "#10b981";
                        return (
                          <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            className="cyber-mono" style={{ fontSize: 12, color: c }}>
                            {item}
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Detected Vulnerabilities List */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <ShieldAlert size={14} color="#06b6d4" />
                    <span className="cyber-title" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Detected Vulnerabilities (CVE Matrix)</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {vulnerabilities.map(v => {
                      const isCritical = v.severity === "CRITICAL";
                      const isHigh = v.severity === "HIGH";
                      const isMedium = v.severity === "MEDIUM";
                      const badgeColor = isCritical ? "#ef4444" : isHigh ? "#f97316" : isMedium ? "#f59e0b" : "#10b981";
                      const isPatched = v.status === "PATCHED";

                      return (
                        <div key={v.id} style={{
                          background: "rgba(10, 15, 25, 0.7)",
                          border: `1px solid ${isPatched ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.06)"}`,
                          borderRadius: 14, padding: "16px 20px", backdropFilter: "blur(12px)",
                          display: "flex",
                          flexDirection: isSmallMobile ? "column" : "row",
                          alignItems: isSmallMobile ? "flex-start" : "center",
                          justifyContent: "space-between",
                          gap: 16
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            {/* CVSS Badge */}
                            <div className="cyber-number" style={{
                              width: 48, height: 48, borderRadius: 10,
                              background: `${badgeColor}15`, border: `1px solid ${badgeColor}35`,
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                              color: badgeColor, textShadow: `0 0 10px ${badgeColor}40`,
                              flexShrink: 0
                            }}>
                              <span style={{ fontSize: 16, fontWeight: 800 }}>{v.score}</span>
                              <span style={{ fontSize: 8, fontWeight: 500, letterSpacing: "0.05em" }}>CVSS</span>
                            </div>

                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span className="cyber-mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{v.cve}</span>
                                <span style={{
                                  fontSize: 8, fontWeight: 800, padding: "2px 6px", borderRadius: 4,
                                  background: `${badgeColor}15`, color: badgeColor, border: `1px solid ${badgeColor}35`
                                }}>{v.severity}</span>
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginTop: 4 }}>{v.title}</div>
                              <div className="cyber-mono" style={{ fontSize: 11, color: "rgba(6, 182, 212, 0.6)", marginTop: 2 }}>
                                Affected module: <span style={{ color: "#e2e8f0" }}>{v.component}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ width: isSmallMobile ? "100%" : "auto" }}>
                            {isPatched ? (
                              <div style={{
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                padding: "6px 16px", borderRadius: 8, background: "rgba(16, 185, 129, 0.08)",
                                border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981",
                                width: isSmallMobile ? "100%" : "auto", boxSizing: "border-box"
                              }}>
                                <Check size={14} />
                                <span className="cyber-mono" style={{ fontSize: 11, fontWeight: 700 }}>PATCHED</span>
                              </div>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={() => handleApplyPatch(v.id)}
                                style={{
                                  padding: "8px 16px", borderRadius: 8, background: "rgba(6, 182, 212, 0.1)",
                                  border: "1px solid rgba(6, 182, 212, 0.4)", color: "#06b6d4",
                                  fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "monospace",
                                  width: isSmallMobile ? "100%" : "auto"
                                }}
                              >
                                APPLY HOTPATCH
                              </motion.button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* FIREWALL CRUD POLICIES PAGE */}
            {activePage === "firewall" && (
              <motion.div
                key="firewall"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 340px",
                  gap: 20,
                  alignItems: "flex-start"
                }}
              >
                {/* Active Firewall Rules List (READ & DELETE) */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Sliders size={14} color="#06b6d4" />
                    <span className="cyber-title" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>ACTIVE SECURITY POLICIES</span>
                  </div>

                  <div style={{ background: "rgba(10, 15, 25, 0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", backdropFilter: "blur(12px)" }}>
                    <div className="table-responsive-container custom-scroll">
                      <table style={{ width: "100%", minWidth: isMobile ? 650 : "auto", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                          <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            {["State", "Direction", "Port", "Protocol", "Source IP", "Action", "Delete"].map(h => (
                              <th key={h} className="cyber-title" style={{ padding: "14px 20px", fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {firewallRules.map(rule => (
                            <tr key={rule.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              {/* Toggle State Column */}
                              <td style={{ padding: "14px 20px" }}>
                                <button
                                  onClick={() => handleToggleRule(rule.id)}
                                  style={{
                                    background: "transparent", border: "none", cursor: "pointer",
                                    display: "flex", alignItems: "center"
                                  }}
                                >
                                  <div style={{
                                    width: 32, height: 16, borderRadius: 10,
                                    background: rule.active ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.1)",
                                    border: `1px solid ${rule.active ? "rgba(16, 185, 129, 0.4)" : "rgba(255,255,255,0.15)"}`,
                                    position: "relative", transition: "background 0.2s"
                                  }}>
                                    <div style={{
                                      width: 10, height: 10, borderRadius: "50%",
                                      background: rule.active ? "#10b981" : "#94a3b8",
                                      position: "absolute", top: 2,
                                      left: rule.active ? 18 : 2, transition: "left 0.2s"
                                    }} />
                                  </div>
                                </button>
                              </td>

                              <td className="cyber-mono" style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: rule.direction === "INBOUND" ? "#06b6d4" : "#8b5cf6" }}>
                                {rule.direction}
                              </td>

                              <td className="cyber-mono" style={{ padding: "14px 20px", fontSize: 12, color: "#f1f5f9" }}>
                                {rule.port}
                              </td>

                              <td className="cyber-mono" style={{ padding: "14px 20px", fontSize: 12, color: "#94a3b8" }}>
                                {rule.protocol}
                              </td>

                              <td className="cyber-mono" style={{ padding: "14px 20px", fontSize: 12, color: "#94a3b8" }}>
                                {rule.ip}
                              </td>

                              <td style={{ padding: "14px 20px" }}>
                                <span style={{
                                  fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 4,
                                  background: rule.action === "ALLOW" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                  color: rule.action === "ALLOW" ? "#10b981" : "#ef4444",
                                  border: `1px solid ${rule.action === "ALLOW" ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`
                                }}>
                                  {rule.action}
                                </span>
                              </td>

                              <td style={{ padding: "14px 20px" }}>
                                <motion.button
                                  whileHover={{ scale: 1.1, color: "#ef4444" }} whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteRule(rule.id)}
                                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}
                                >
                                  <Trash2 size={14} />
                                </motion.button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Add Rule Form (CREATE Panel) */}
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Plus size={14} color="#06b6d4" />
                    <span className="cyber-title" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>CREATE POLICY RULES</span>
                  </div>

                  <div style={{
                    background: "rgba(10, 15, 25, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 16, padding: 20, backdropFilter: "blur(12px)",
                    boxSizing: "border-box"
                  }}>
                    <form onSubmit={handleAddRule} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label className="cyber-title" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Direction</label>
                        <select
                          value={newRule.direction}
                          onChange={e => setNewRule(prev => ({ ...prev, direction: e.target.value }))}
                          style={{
                            width: "100%", padding: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 8, color: "#e2e8f0", outline: "none", boxSizing: "border-box"
                          }}
                        >
                          <option value="INBOUND">INBOUND</option>
                          <option value="OUTBOUND">OUTBOUND</option>
                        </select>
                      </div>

                      <div>
                        <label className="cyber-title" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Port</label>
                        <input
                          value={newRule.port}
                          onChange={e => setNewRule(prev => ({ ...prev, port: e.target.value }))}
                          placeholder="e.g. 8080"
                          style={{
                            width: "100%", padding: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 8, color: "#e2e8f0", outline: "none", boxSizing: "border-box"
                          }}
                        />
                      </div>

                      <div>
                        <label className="cyber-title" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Protocol</label>
                        <select
                          value={newRule.protocol}
                          onChange={e => setNewRule(prev => ({ ...prev, protocol: e.target.value }))}
                          style={{
                            width: "100%", padding: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 8, color: "#e2e8f0", outline: "none", boxSizing: "border-box"
                          }}
                        >
                          <option value="TCP">TCP</option>
                          <option value="UDP">UDP</option>
                        </select>
                      </div>

                      <div>
                        <label className="cyber-title" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Source IP Range</label>
                        <input
                          value={newRule.ip}
                          onChange={e => setNewRule(prev => ({ ...prev, ip: e.target.value }))}
                          placeholder="e.g. ANY or 192.168.1.1"
                          style={{
                            width: "100%", padding: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 8, color: "#e2e8f0", outline: "none", boxSizing: "border-box"
                          }}
                        />
                      </div>

                      <div>
                        <label className="cyber-title" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Action</label>
                        <select
                          value={newRule.action}
                          onChange={e => setNewRule(prev => ({ ...prev, action: e.target.value }))}
                          style={{
                            width: "100%", padding: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 8, color: "#e2e8f0", outline: "none", boxSizing: "border-box"
                          }}
                        >
                          <option value="ALLOW">ALLOW</option>
                          <option value="DENY">DENY</option>
                        </select>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        type="submit"
                        style={{
                          width: "100%", padding: 12, borderRadius: 8, background: "rgba(6, 182, 212, 0.15)",
                          border: "1px solid rgba(6, 182, 212, 0.4)", color: "#06b6d4",
                          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "monospace"
                        }}
                      >
                        DEPLOY POLICY RULE
                      </motion.button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SYSTEM CONFIGURATIONS & SETTINGS PAGE */}
            {activePage === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "220px 1fr",
                  gap: 24
                }}
              >
                {/* Inner Tabs Navigation (Stacks as row dynamically on Mobile) */}
                <div style={{
                  display: "flex",
                  flexDirection: isMobile ? "row" : "column",
                  flexWrap: "wrap",
                  gap: 6
                }}>
                  {[
                    { key: "general", label: "System Config", icon: Sliders },
                    { key: "alerts", label: "Alert Channels", icon: Bell },
                    { key: "api", label: "Developer APIs", icon: Key },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setSettingsTab(tab.key)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "12px 14px", borderRadius: 8,
                        background: settingsTab === tab.key ? "rgba(255, 255, 255, 0.05)" : "transparent",
                        border: `1px solid ${settingsTab === tab.key ? "rgba(255, 255, 255, 0.1)" : "transparent"}`,
                        color: settingsTab === tab.key ? "#fff" : "rgba(255, 255, 255, 0.45)",
                        cursor: "pointer", outline: "none", textAlign: "left",
                        flex: isMobile ? "1 1 120px" : "none"
                      }}
                    >
                      <tab.icon size={14} />
                      <span className="cyber-title" style={{ fontSize: 10, fontWeight: 600 }}>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Inner Tabs Dynamic Panel */}
                <div style={{
                  background: "rgba(10, 15, 25, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: 16, padding: isSmallMobile ? "20px 16px" : "24px 30px", backdropFilter: "blur(12px)"
                }}>
                  {settingsTab === "general" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 12 }}>
                        <h3 className="cyber-title" style={{ fontSize: 14, color: "#fff", margin: 0 }}>General Settings</h3>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Manage active platform variables and security thresholds</p>
                      </div>

                      <div>
                        <label className="cyber-title" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 8 }}>Scanner Interval (Minutes)</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <input
                            type="range" min="1" max="60"
                            value={scanInterval} onChange={e => setScanInterval(parseInt(e.target.value))}
                            style={{ flex: 1, accentColor: "#06b6d4", cursor: "pointer" }}
                          />
                          <span className="cyber-mono" style={{ fontSize: 14, color: "#06b6d4", width: 60, textAlign: "right" }}>{scanInterval}m</span>
                        </div>
                      </div>

                      <div>
                        <label className="cyber-title" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 8 }}>Secure Shell Protocol Version</label>
                        <select
                          style={{
                            width: "100%", padding: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 8, color: "#e2e8f0", outline: "none", boxSizing: "border-box"
                          }}
                        >
                          <option value="SSH-2">SSH-2 (Highly Secure)</option>
                          <option value="SSH-1">SSH-1 (Legacy / Warning)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {settingsTab === "alerts" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 12 }}>
                        <h3 className="cyber-title" style={{ fontSize: 14, color: "#fff", margin: 0 }}>Alert Channels Config</h3>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Configure external integration protocols for security alert feeds</p>
                      </div>

                      {/* Email alerts */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Secure Email Broadcasts</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Send alerts directly to sysadmin@sentinel.net</div>
                        </div>
                        <button
                          onClick={() => setAlertsEmail(prev => !prev)}
                          style={{ background: "transparent", border: "none", cursor: "pointer" }}
                        >
                          <div style={{
                            width: 32, height: 16, borderRadius: 10,
                            background: alertsEmail ? "rgba(6, 182, 212, 0.2)" : "rgba(255,255,255,0.1)",
                            border: `1px solid ${alertsEmail ? "rgba(6, 182, 212, 0.4)" : "rgba(255,255,255,0.15)"}`,
                            position: "relative", transition: "background 0.2s"
                          }}>
                            <div style={{
                              width: 10, height: 10, borderRadius: "50%",
                              background: alertsEmail ? "#06b6d4" : "#94a3b8",
                              position: "absolute", top: 2,
                              left: alertsEmail ? 18 : 2, transition: "left 0.2s"
                            }} />
                          </div>
                        </button>
                      </div>

                      {/* Slack Alerts */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Slack Webhook Alerts</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Dispatch real-time logs to Slack security channel</div>
                          </div>
                          <button
                            onClick={() => setAlertsSlack(prev => !prev)}
                            style={{ background: "transparent", border: "none", cursor: "pointer" }}
                          >
                            <div style={{
                              width: 32, height: 16, borderRadius: 10,
                              background: alertsSlack ? "rgba(6, 182, 212, 0.2)" : "rgba(255,255,255,0.1)",
                              border: `1px solid ${alertsSlack ? "rgba(6, 182, 212, 0.4)" : "rgba(255,255,255,0.15)"}`,
                              position: "relative", transition: "background 0.2s"
                            }}>
                              <div style={{
                                width: 10, height: 10, borderRadius: "50%",
                                background: alertsSlack ? "#06b6d4" : "#94a3b8",
                                position: "absolute", top: 2,
                                left: alertsSlack ? 18 : 2, transition: "left 0.2s"
                              }} />
                            </div>
                          </button>
                        </div>
                        {alertsSlack && (
                          <input
                            value={slackWebhook} onChange={e => setSlackWebhook(e.target.value)}
                            className="cyber-mono"
                            style={{ width: "100%", padding: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#e2e8f0", fontSize: 11, outline: "none", boxSizing: "border-box" }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {settingsTab === "api" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 12 }}>
                        <h3 className="cyber-title" style={{ fontSize: 14, color: "#fff", margin: 0 }}>Developer API Panel</h3>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Generate security tokens for CLI and pipeline integration</p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <label className="cyber-title" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Developer Secret Key</label>
                        <div style={{ display: "flex", flexDirection: isSmallMobile ? "column" : "row", gap: 10 }}>
                          <div className="cyber-mono" style={{
                            flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#06b6d4",
                            fontSize: 12, display: "flex", alignItems: "center", justifyContent: "space-between",
                          }}>
                            <span style={{ overflowX: "hidden", textOverflow: "ellipsis", maxWidth: "80%" }}>
                              {showKey ? apiKey : "••••••••••••••••••••••••••••••••••••••••"}
                            </span>
                            <button
                              onClick={() => setShowKey(prev => !prev)}
                              style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center" }}
                            >
                              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={handleCopyKey}
                            style={{
                              padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                          >
                            <Copy size={14} />
                          </motion.button>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleGenerateKey}
                        style={{
                          width: isSmallMobile ? "100%" : "max-content", padding: "10px 20px", borderRadius: 8, background: "rgba(6, 182, 212, 0.15)",
                          border: "1px solid rgba(6, 182, 212, 0.4)", color: "#06b6d4",
                          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.05em",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}
                      >
                        GENERATE NEW ACCESS TOKEN
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* NODE DRAWER */}
      <AnimatePresence>
        {selectedNode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, backdropFilter: "blur(2px)" }} />
            <NodeDrawer node={selectedNode} onClose={() => setSelectedNode(null)} onAction={handleNodeAction} />
          </>
        )}
      </AnimatePresence>

      {/* SCAN MODAL */}
      <AnimatePresence>
        {scanning && <ScanModal progress={scanProgress} phase={scanPhase} />}
      </AnimatePresence>
    </div>
  );
}
