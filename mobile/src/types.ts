export interface User {
  id: string;
  email: string;
}

export interface Profile {
  nationality: string;
  residence: string;
  age: number;
  education: string;
  career: string;
  employment: string;
  english: string;
  disability: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  org: string;
  type: string;
  dest: string;
  deadline: string | null;
  comp_type: string;
  flight: boolean;
  lodging: boolean;
  meals: boolean;
  stipend_min: string | null;
  stipend_max: string | null;
  currency: string | null;
  requires_work_visa: boolean;
  visa_note: string | null;
  min_age: number;
  max_age: number | null;
  grad_only: boolean;
  english: string | null;
  duration: string;
  effort_label: string;
  effort_min: number | null;
  verification: string;
  source_url: string;
  dest_name: string;
  dest_non_conventional: boolean;
  education: string[];
  career: string[];
  employment: string[];
  fields_of_work: string[];
  urgency: "soon" | "month" | "open" | "rolling" | "closed";
  eligible: boolean;
  ineligibleReasons: string[];
  saved: boolean;
}

export interface Todo {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
  created_at: string;
  opportunity_id: string | null;
  opportunity_title: string | null;
  opportunity_deadline: string | null;
}
