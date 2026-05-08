import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthPage from "./components/auth/AuthPage";
import Sidebar from "./components/Sidebar";
import MapView from "./components/map/MapView";
import ReportForm from "./components/report/ReportForm";
import Dashboard from "./components/dashboard/Dashboard";
import SafeRoute from "./components/routes/SafeRoute";
import { useReports } from "./hooks/useReports";
import "./index.css";

type View = "map" | "report" | "dashboard" | "route";

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { reports, loading: reportsLoading, addReport } = useReports();
  const [activeView, setActiveView] = useState<View>("map");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="full-screen-center">
        <div className="spinner large" />
        <p>Loading SafeSpace AI...</p>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="app-layout">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="app-main">
        <header className="mobile-header">
          <button
            className="hamburger"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="mobile-brand">SafeSpace AI</div>
        </header>

        <main className="content-area">
          {activeView === "map" && (
            <MapView
              reports={reports}
              loading={reportsLoading}
              onAddReport={() => setActiveView("report")}
            />
          )}
          {activeView === "report" && (
            <ReportForm
              onSubmit={async (report) => {
                await addReport(report);
                setActiveView("map");
              }}
              onCancel={() => setActiveView("map")}
            />
          )}
          {activeView === "dashboard" && <Dashboard reports={reports} />}
          {activeView === "route" && <SafeRoute reports={reports} />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
