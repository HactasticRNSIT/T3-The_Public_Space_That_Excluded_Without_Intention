import { useState } from "react";
import type { SafetyReport } from "../../types";
import { ISSUE_TAG_LABELS } from "../../types";

interface SafeRouteProps {
  reports: SafetyReport[];
}

interface RouteResult {
  areasToAvoid: SafetyReport[];
  safeAreas: SafetyReport[];
  recommendation: string;
  riskScore: number;
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearbyReports(lat: number, lng: number, reports: SafetyReport[], radiusKm = 2.5): SafetyReport[] {
  return reports.filter((r) => calcDistance(lat, lng, r.lat, r.lng) <= radiusKm);
}

// Simple heuristic — find reports near the midpoint of start/end
function analyzeRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  reports: SafetyReport[]
): RouteResult {
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;
  const radius = calcDistance(startLat, startLng, endLat, endLng) / 2 + 1;

  const nearby = findNearbyReports(midLat, midLng, reports, Math.max(radius, 1.5));
  const areasToAvoid = nearby.filter((r) => r.riskLevel === "Unsafe");
  const safeAreas = nearby.filter((r) => r.riskLevel === "Safe");

  const avgScore =
    nearby.length > 0 ? Math.round(nearby.reduce((s, r) => s + r.score, 0) / nearby.length) : 75;

  let recommendation = "";
  if (areasToAvoid.length === 0 && nearby.length === 0) {
    recommendation =
      "No safety reports exist for this route corridor yet. Exercise standard urban precautions and stay on well-lit, populated streets.";
  } else if (areasToAvoid.length === 0) {
    recommendation = `Route corridor appears safe based on ${nearby.length} nearby report(s). The nearby areas have been rated as safe or moderate. Recommend continuing on main streets during daylight hours.`;
  } else {
    const names = areasToAvoid.map((r) => r.locationName).join(", ");
    const issues = [...new Set(areasToAvoid.flatMap((r) => r.issueTags))].slice(0, 3);
    const issueNames = issues.map((i) => ISSUE_TAG_LABELS[i]).join(", ");
    recommendation = `Caution: ${areasToAvoid.length} unsafe area(s) detected near this route: ${names}. Common issues include: ${issueNames || "general safety concerns"}. Consider alternative routes that bypass these zones, especially at night. Prefer streets with higher foot traffic and commercial activity.`;
  }

  return { areasToAvoid, safeAreas, recommendation, riskScore: avgScore };
}

function parseCoords(input: string): { lat: number; lng: number } | null {
  const parts = input.split(",").map((s) => s.trim());
  if (parts.length === 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}

export default function SafeRoute({ reports }: SafeRouteProps) {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [result, setResult] = useState<RouteResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    setError("");
    setResult(null);
    setLoading(true);

    const startCoords = parseCoords(start);
    const endCoords = parseCoords(destination);

    if (!startCoords || !endCoords) {
      setError("Please enter coordinates in the format: latitude, longitude (e.g. 40.7128, -73.9731)");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const res = analyzeRoute(startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng, reports);
      setResult(res);
      setLoading(false);
    }, 800);
  };

  const presetRoutes = [
    { label: "Central Park → Times Square", start: "40.7674, -73.9712", end: "40.758, -73.9855" },
    { label: "Brooklyn Bridge → Lower East Side", start: "40.7061, -73.9969", end: "40.7183, -73.9836" },
    { label: "High Line → Union Square", start: "40.748, -74.005", end: "40.7359, -73.9911" },
  ];

  return (
    <div className="route-page">
      <div className="route-header">
        <h1>Safe Route Helper</h1>
        <p>
          Enter start and destination coordinates to analyze your route corridor based on nearby safety reports.
        </p>
      </div>

      <div className="route-layout">
        <div className="route-form-card">
          <h2>Route Analysis</h2>
          <div className="form-group">
            <label>Start Location</label>
            <input
              type="text"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              placeholder="latitude, longitude  (e.g. 40.7128, -73.9731)"
            />
          </div>
          <div className="form-group">
            <label>Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="latitude, longitude  (e.g. 40.758, -73.9855)"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Route"}
          </button>

          <div className="preset-routes">
            <div className="preset-title">Quick Presets</div>
            {presetRoutes.map((p) => (
              <button
                key={p.label}
                className="preset-btn"
                onClick={() => { setStart(p.start); setDestination(p.end); }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="route-results">
          {!result && !loading && (
            <div className="route-placeholder">
              <div className="placeholder-icon">🗺</div>
              <p>Enter coordinates above to analyze route safety.</p>
              <p className="placeholder-hint">
                The system checks safety reports within the route corridor and highlights unsafe areas to avoid.
              </p>
            </div>
          )}

          {loading && (
            <div className="route-placeholder">
              <div className="spinner large" />
              <p>Analyzing route safety data...</p>
            </div>
          )}

          {result && (
            <div className="route-result">
              <div className={`route-score-card ${result.riskScore >= 75 ? "safe" : result.riskScore >= 50 ? "moderate" : "unsafe"}`}>
                <div className="route-score-value">{result.riskScore}</div>
                <div className="route-score-label">Route Corridor Score</div>
              </div>

              <div className="route-recommendation">
                <h3>Route Assessment</h3>
                <p>{result.recommendation}</p>
              </div>

              {result.areasToAvoid.length > 0 && (
                <div className="avoid-section">
                  <h3 className="avoid-title">Areas to Avoid</h3>
                  {result.areasToAvoid.map((r) => (
                    <div key={r.id} className="avoid-card">
                      <div className="avoid-card-header">
                        <span className="avoid-name">{r.locationName}</span>
                        <span className="score-badge unsafe">{r.score}</span>
                      </div>
                      <div className="avoid-tags">
                        {r.issueTags.map((t) => (
                          <span key={t} className="mini-tag danger">{ISSUE_TAG_LABELS[t]}</span>
                        ))}
                      </div>
                      <p className="avoid-rec">{r.recommendation.slice(0, 150)}...</p>
                    </div>
                  ))}
                </div>
              )}

              {result.safeAreas.length > 0 && (
                <div className="safe-section">
                  <h3 className="safe-title">Safe Anchors Nearby</h3>
                  {result.safeAreas.slice(0, 3).map((r) => (
                    <div key={r.id} className="safe-anchor-card">
                      <span className="safe-anchor-name">{r.locationName}</span>
                      <span className="score-badge safe">{r.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
