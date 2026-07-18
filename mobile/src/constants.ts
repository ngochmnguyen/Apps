// Enum values and labels mirrored from prototype/index.html (EDUCATION_LEVELS,
// CAREER_STAGES, EMPLOYMENT, ENGLISH, TYPES, CHECKLIST_TEMPLATES) so the
// mobile signup form and detail checklist stay consistent with web instead
// of drifting into a second, slightly different source of truth.

export const EDUCATION_LEVELS: [string, string][] = [
  ["bachelors_completed", "Bachelor's completed"],
  ["masters_in_progress", "Master's in progress"],
  ["masters_completed", "Master's completed"],
  ["phd_in_progress", "PhD in progress"],
  ["phd_completed", "PhD completed"],
  ["professional_degree", "Professional degree"],
  ["no_formal_degree", "No formal degree"],
];

export const CAREER_STAGES: [string, string][] = [
  ["grad_student", "Grad student"],
  ["recent_grad", "Recent graduate"],
  ["early_career", "Early career"],
  ["mid_career", "Mid career"],
  ["senior_career", "Senior career"],
  ["career_changer", "Career changer"],
];

export const EMPLOYMENT: [string, string][] = [
  ["unemployed", "Unemployed"],
  ["employed_full_time", "Employed full-time"],
  ["employed_part_time", "Employed part-time"],
  ["self_employed", "Self-employed"],
  ["between_jobs", "Between jobs"],
  ["student", "Student"],
];

export const ENGLISH: [string, string][] = [
  ["b1", "B1"],
  ["b2", "B2"],
  ["c1", "C1"],
  ["c2", "C2"],
  ["native_or_fluent", "Native / fluent"],
];

export const TYPES: [string, string][] = [
  ["conference", "Conference"],
  ["contest_competition", "Contest"],
  ["scholarship_fellowship", "Scholarship"],
  ["internship", "Internship"],
  ["work_study_exchange", "Work-study"],
  ["research_residency", "Research residency"],
  ["volunteer_travel_stipend", "Volunteer travel"],
  ["work_stay", "Work stay"],
];

export const VALID_STATUSES = ["not_started", "started", "submitted", "accepted", "rejected"] as const;

export const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  started: "Started",
  submitted: "Submitted",
  accepted: "Accepted",
  rejected: "Rejected",
};

// Generic, type-based prep steps -- never fabricated specifics about any one
// listing, same principle as the "View source" link: point people to the
// official source for exact requirements.
export const CHECKLIST_TEMPLATES: Record<string, string[]> = {
  conference: ["CV or bio", "Motivation statement", "Valid passport", "Visa (if required)"],
  contest_competition: ["Entry submission", "Portfolio or work samples", "Entry form", "Official rules review"],
  scholarship_fellowship: [
    "Academic transcripts",
    "Personal statement or research proposal",
    "2-3 recommendation letters",
    "Valid passport (6+ months)",
  ],
  internship: ["Resume/CV", "Cover letter", "References", "Work visa (if required)"],
  work_study_exchange: ["Transcripts", "ID/passport copies", "Statement of purpose", "Visa or work permit"],
  research_residency: ["Research proposal or portfolio", "Letters of support", "Current CV", "Visa (if required)"],
  volunteer_travel_stipend: [
    "Background check or references",
    "Statement of interest",
    "Vaccination/health records",
    "Visa (if required)",
  ],
  work_stay: ["Resume/CV", "Work visa or permit", "References", "Application message"],
};
