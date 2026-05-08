import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { SafetyReport } from "../../types";
import { ISSUE_TAG_LABELS } from "../../types";

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  reports: SafetyReport[];
  loading: boolean;
  onAddReport: () => void;
}

function getMarkerColor(riskLevel: string) {
  if (riskLevel === "Safe") return "#22c55e";
  if (riskLevel === "Moderate") return "#f59e0b";
  return "#ef4444";
}

function createCircleIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:18px;height:18px;
      border-radius:50%;
      background:${color};
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MapView({ reports, loading, onAddReport }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [40.7128, -73.9731],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current);

    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    reports.forEach((report) => {
      if (!report.lat || !report.lng) return;
      const color = getMarkerColor(report.riskLevel);
      const icon = createCircleIcon(color);
      const tagsList = report.issueTags.length > 0
        ? report.issueTags.map((t) => `<span class="popup-tag">${ISSUE_TAG_LABELS[t]}</span>`).join("")
        : '<span class="popup-tag-none">No specific issues tagged</span>';

      const popup = L.popup({ maxWidth: 300, className: "safe-popup" }).setContent(`
        <div class="popup-inner">
          <div class="popup-header" style="border-left: 4px solid ${color}">
            <div class="popup-location">${report.locationName}</div>
            <div class="popup-risk" style="color:${color}">${report.riskLevel}</div>
          </div>
          <div class="popup-score-row">
            <div class="popup-score-value" style="color:${color}">${report.score}</div>
            <div class="popup-score-label">Safety Score</div>
          </div>
          <div class="popup-section">
            <div class="popup-section-title">Issues Identified</div>
            <div class="popup-tags">${tagsList}</div>
          </div>
          <div class="popup-section">
            <div class="popup-section-title">Recommendation</div>
            <p class="popup-rec">${report.recommendation.slice(0, 200)}${report.recommendation.length > 200 ? "..." : ""}</p>
          </div>
          ${report.comment ? `<div class="popup-comment">"${report.comment}"</div>` : ""}
          <div class="popup-meta">Reported ${formatDate(report.createdAt)}</div>
        </div>
      `);

      const marker = L.marker([report.lat, report.lng], { icon }).bindPopup(popup);
      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [reports]);

  return (
    <div className="map-container">
      <div className="map-topbar">
        <div className="map-stats">
          <span className="map-stat">
            <span className="dot safe-dot" /> {reports.filter((r) => r.riskLevel === "Safe").length} Safe
          </span>
          <span className="map-stat">
            <span className="dot moderate-dot" /> {reports.filter((r) => r.riskLevel === "Moderate").length} Moderate
          </span>
          <span className="map-stat">
            <span className="dot unsafe-dot" /> {reports.filter((r) => r.riskLevel === "Unsafe").length} Unsafe
          </span>
        </div>
        <button className="btn-primary btn-sm" onClick={onAddReport}>
          + Add Report
        </button>
      </div>

      {loading && (
        <div className="map-loading">
          <div className="spinner" />
          <span>Loading safety data...</span>
        </div>
      )}

      <div ref={mapContainerRef} className="leaflet-map" />
    </div>
  );
}
