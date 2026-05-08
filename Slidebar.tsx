import { useAuth } from "../contexts/AuthContext";

type View = "map" | "report" | "dashboard" | "route";

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const NAV_ITEMS: { id: View; label: string; icon: string; desc: string }[] = [
  { id: "map", label: "Safety Map", icon: "M", desc: "View all reports" },
  { id: "report", label: "Report Space", icon: "R", desc: "Submit a safety report" },
  { id: "dashboard", label: "Dashboard", icon: "D", desc: "Analytics & insights" },
  { id: "route", label: "Safe Route", icon: "S", desc: "Find safe paths" },
];

export default function Sidebar({ activeView, onViewChange, isMobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const handleNav = (view: View) => {
    onViewChange(view);
    onMobileClose();
  };

  return (
    <>
      {isMobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} />}
      <aside className={`sidebar ${isMobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#0ea5e9" />
              <path d="M16 7 L23 11.5 L23 20.5 L16 25 L9 20.5 L9 11.5 Z" fill="white" fillOpacity="0.9" />
              <circle cx="16" cy="16" r="3.5" fill="#0ea5e9" />
            </svg>
          </div>
          <div>
            <div className="brand-name">SafeSpace AI</div>
            <div className="brand-tagline">Urban Safety Platform</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? "active" : ""}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="nav-icon-badge">{item.icon}</span>
              <div className="nav-text">
                <span className="nav-label">{item.label}</span>
                <span className="nav-desc">{item.desc}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-legend">
          <div className="legend-title">Risk Levels</div>
          <div className="legend-item">
            <span className="legend-dot safe" />
            <span>Safe (score ≥ 75)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot moderate" />
            <span>Moderate (50–74)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot unsafe" />
            <span>Unsafe (score &lt; 50)</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.email?.[0]?.toUpperCase() ?? "U"}</div>
          <div className="user-info">
            <span className="user-email">{user?.email}</span>
            <span className="user-role">Reporter</span>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
