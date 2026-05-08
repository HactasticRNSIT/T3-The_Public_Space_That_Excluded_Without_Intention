export type RiskLevel = "Safe" | "Moderate" | "Unsafe";

export type IssueTag =
  | "poor_lighting"
  | "isolated_path"
  | "obstructed_visibility"
  | "hidden_seating"
  | "low_footfall"
  | "poor_accessibility"
  | "no_cctv"
  | "no_emergency_help";

export const ISSUE_TAG_LABELS: Record<IssueTag, string> = {
  poor_lighting: "Poor Lighting",
  isolated_path: "Isolated Path",
  obstructed_visibility: "Obstructed Visibility",
  hidden_seating: "Hidden Seating",
  low_footfall: "Low Footfall",
  poor_accessibility: "Poor Accessibility",
  no_cctv: "No CCTV",
  no_emergency_help: "No Emergency Help",
};

export interface SafetyReport {
  id?: string;
  userId: string;
  locationName: string;
  lat: number;
  lng: number;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  lighting: number; // 1-5
  visibility: number; // 1-5
  crowdLevel: number; // 1-5
  accessibility: number; // 1-5
  emergencyAccess: number; // 1-5
  harassmentConcern: number; // 1-5 (1=high concern, 5=no concern)
  overallComfort: number; // 1-5
  comment?: string;
  issueTags: IssueTag[];
  score: number;
  riskLevel: RiskLevel;
  recommendation: string;
  createdAt: Date | string;
}

export interface ReportFormData {
  locationName: string;
  lat: string;
  lng: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  lighting: number;
  visibility: number;
  crowdLevel: number;
  accessibility: number;
  emergencyAccess: number;
  harassmentConcern: number;
  overallComfort: number;
  comment: string;
  issueTags: IssueTag[];
}
