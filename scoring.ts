import type { ReportFormData, RiskLevel } from "../types";
import type { IssueTag } from "../types";

export function calculateScore(data: ReportFormData): number {
  const lighting = data.lighting * 4;        // max 20
  const visibility = data.visibility * 4;    // max 20
  const crowdLevel = data.crowdLevel * 2;    // max 10
  const accessibility = data.accessibility * 3; // max 15
  const emergencyAccess = data.emergencyAccess * 3; // max 15
  const harassmentConcern = data.harassmentConcern * 2; // max 10 (5=no concern=good)
  const overallComfort = data.overallComfort * 2; // max 10

  const base = lighting + visibility + crowdLevel + accessibility + emergencyAccess + harassmentConcern + overallComfort;
  // base max = 100
  const tagPenalty = data.issueTags.length * 3;
  return Math.max(0, Math.min(100, Math.round(base - tagPenalty)));
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "Safe";
  if (score >= 50) return "Moderate";
  return "Unsafe";
}

const TAG_RECOMMENDATIONS: Record<IssueTag, string> = {
  poor_lighting: "Install uniform street lighting and eliminate dark patches along pathways.",
  isolated_path: "Improve activity zones near the path, increase surveillance cameras, and create alternative well-used routes.",
  obstructed_visibility: "Trim overgrown vegetation, remove visual barriers, and redesign sightlines for open surveillance.",
  hidden_seating: "Relocate or expose seating areas to high-visibility zones with natural surveillance.",
  low_footfall: "Introduce mixed-use activities, street vendors, or events to increase pedestrian flow.",
  poor_accessibility: "Add ramps, tactile paving, wider pathways, and inclusive wayfinding signage.",
  no_cctv: "Install CCTV cameras at key intersections and entry/exit points with visible signage.",
  no_emergency_help: "Place emergency call boxes, first-aid stations, and clearly marked emergency contact points.",
};

const FIELD_RECOMMENDATIONS: Array<{ key: keyof ReportFormData; threshold: number; message: string }> = [
  { key: "lighting", threshold: 2, message: "Improve lighting infrastructure with motion-sensor or solar-powered lights." },
  { key: "visibility", threshold: 2, message: "Clear obstructions and redesign space layout to maximize natural sightlines." },
  { key: "crowdLevel", threshold: 2, message: "Attract more regular users through programming, events, or mixed-use development." },
  { key: "accessibility", threshold: 2, message: "Conduct an accessibility audit and implement inclusive design standards." },
  { key: "emergencyAccess", threshold: 2, message: "Ensure emergency vehicles have clear access routes and install emergency help points." },
  { key: "harassmentConcern", threshold: 2, message: "Deploy community safety officers, add visible cameras, and run anti-harassment awareness." },
  { key: "overallComfort", threshold: 2, message: "Engage community stakeholders to understand comfort barriers and co-design improvements." },
];

export function generateRecommendation(data: ReportFormData): string {
  const recs: string[] = [];

  for (const tag of data.issueTags) {
    const rec = TAG_RECOMMENDATIONS[tag];
    if (rec && !recs.includes(rec)) recs.push(rec);
  }

  for (const field of FIELD_RECOMMENDATIONS) {
    const val = data[field.key] as number;
    if (val <= field.threshold && !recs.includes(field.message)) {
      recs.push(field.message);
    }
  }

  if (recs.length === 0) {
    return "This space shows strong safety characteristics. Continue regular maintenance and community engagement to sustain safety standards.";
  }

  return recs.slice(0, 4).join(" ");
}
