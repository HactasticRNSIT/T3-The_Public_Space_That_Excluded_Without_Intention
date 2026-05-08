import type { SafetyReport, IssueTag } from "../../types";
import { ISSUE_TAG_LABELS } from "../../types";

interface DashboardProps {
  reports: SafetyReport[];
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={color ? { color } : {}}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function Dashboard({ reports }: DashboardProps) {
  const total = reports.length;
  const avgScore = total > 0 ? Math.round(reports.reduce((sum, r) => sum + r.score, 0) / total) : 0;
  const unsafeCount = reports.filter((r) => r.riskLevel === "Unsafe").length;
  const safeCount = reports.filter((r) => r.riskLevel === "Safe").length;
  const moderateCount = reports.filter((r) => r.riskLevel === "Moderate").length;

  // Count issue tags
  const tagCounts: Record<string, number> = {};
  for (const report of reports) {
    for (const tag of report.issueTags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const highRisk = reports
    .filter((r) => r.riskLevel === "Unsafe")
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  const riskColor = avgScore >= 75 ? "#22c55e" : avgScore >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Safety Dashboard</h1>
        <p>Aggregated safety data and urban planning insights from all reports.</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Reports" value={total} sub="All time" />
        <StatCard label="Average Safety Score" value={avgScore} sub="Out of 100" color={riskColor} />
        <StatCard label="Unsafe Areas" value={unsafeCount} sub="Score below 50" color="#ef4444" />
        <StatCard label="Safe Areas" value={safeCount} sub="Score 75+" color="#22c55e" />
      </div>

      <div className="dashboard-grid">
        {/* Risk distribution */}
        <div className="dashboard-card">
          <h2 className="card-title">Risk Distribution</h2>
          <div className="risk-bars">
            <div className="risk-bar-item">
              <div className="risk-bar-label">
                <span className="dot safe-dot" /> Safe
                <span className="risk-count">{safeCount}</span>
              </div>
              <div className="risk-bar-track">
                <div
                  className="risk-bar-fill safe-fill"
                  style={{ width: total > 0 ? `${(safeCount / total) * 100}%` : "0%" }}
                />
              </div>
              <span className="risk-pct">{total > 0 ? Math.round((safeCount / total) * 100) : 0}%</span>
            </div>
            <div className="risk-bar-item">
              <div className="risk-bar-label">
                <span className="dot moderate-dot" /> Moderate
                <span className="risk-count">{moderateCount}</span>
              </div>
              <div className="risk-bar-track">
                <div
                  className="risk-bar-fill moderate-fill"
                  style={{ width: total > 0 ? `${(moderateCount / total) * 100}%` : "0%" }}
                />
              </div>
              <span className="risk-pct">{total > 0 ? Math.round((moderateCount / total) * 100) : 0}%</span>
            </div>
            <div className="risk-bar-item">
              <div className="risk-bar-label">
                <span className="dot unsafe-dot" /> Unsafe
                <span className="risk-count">{unsafeCount}</span>
              </div>
              <div className="risk-bar-track">
                <div
                  className="risk-bar-fill unsafe-fill"
                  style={{ width: total > 0 ? `${(unsafeCount / total) * 100}%` : "0%" }}
                />
              </div>
              <span className="risk-pct">{total > 0 ? Math.round((unsafeCount / total) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Most common issues */}
        <div className="dashboard-card">
          <h2 className="card-title">Most Common Issues</h2>
          {sortedTags.length === 0 ? (
            <p className="no-data">No issues tagged yet.</p>
          ) : (
            <div className="issue-list">
              {sortedTags.map(([tag, count]) => (
                <div key={tag} className="issue-item">
                  <span className="issue-name">{ISSUE_TAG_LABELS[tag as IssueTag]}</span>
                  <div className="issue-bar-track">
                    <div
                      className="issue-bar-fill"
                      style={{ width: `${(count / (sortedTags[0][1] || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="issue-count">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* High-risk locations */}
      <div className="dashboard-card full-width">
        <h2 className="card-title">High-Risk Locations</h2>
        {highRisk.length === 0 ? (
          <p className="no-data">No unsafe locations reported yet.</p>
        ) : (
          <div className="risk-table-wrapper">
            <table className="risk-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Score</th>
                  <th>Risk</th>
                  <th>Time</th>
                  <th>Issues</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {highRisk.map((r) => (
                  <tr key={r.id}>
                    <td className="td-location">{r.locationName}</td>
                    <td>
                      <span className="score-badge unsafe">{r.score}</span>
                    </td>
                    <td>
                      <span className="risk-pill unsafe">{r.riskLevel}</span>
                    </td>
                    <td className="td-time">{r.timeOfDay}</td>
                    <td className="td-tags">
                      {r.issueTags.slice(0, 2).map((t) => (
                        <span key={t} className="mini-tag">{ISSUE_TAG_LABELS[t]}</span>
                      ))}
                      {r.issueTags.length > 2 && <span className="mini-tag">+{r.issueTags.length - 2}</span>}
                    </td>
                    <td className="td-rec">{r.recommendation.slice(0, 100)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All reports */}
      <div className="dashboard-card full-width">
        <h2 className="card-title">All Reports</h2>
        {reports.length === 0 ? (
          <p className="no-data">No reports available.</p>
        ) : (
          <div className="all-reports-list">
            {reports.map((r) => (
              <div key={r.id} className={`report-row ${r.riskLevel.toLowerCase()}`}>
                <div className="report-row-main">
                  <span className="report-row-location">{r.locationName}</span>
                  <span className={`score-badge ${r.riskLevel.toLowerCase()}`}>{r.score}</span>
                  <span className={`risk-pill ${r.riskLevel.toLowerCase()}`}>{r.riskLevel}</span>
                </div>
                <div className="report-row-meta">
                  <span>{r.timeOfDay}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  {r.comment && <span className="report-row-comment">"{r.comment.slice(0, 60)}..."</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
