export const PROGRAMS = [
  { value: "CSE", label: "Computer Science & Engineering", short: "CSE" },
  { value: "CSIS", label: "Computer Science & Information Security", short: "CSIS" },
  { value: "PDM", label: "Product Design & Management", short: "PDM" },
  { value: "CASE", label: "Computer & Systems Engineering", short: "CASE" },
];

export const GOALS = [
  { value: "Placement", label: "Placement", description: "Industry-ready skills and projects" },
  { value: "Research", label: "Research", description: "Theory, papers and a thesis path" },
  { value: "Skills", label: "Skills", description: "Hands-on technical depth" },
];

export const SEMESTERS = Array.from({ length: 4 }, (_, i) => ({ value: i + 1, label: `Semester ${i + 1}` }));

export const SEASONS = { 1: "Monsoon", 2: "Spring" };

export const GRADES = ["A", "A-", "B", "B-", "C", "C-", "D", "F", "P"];

export const CREDITS_REQUIRED = 64;

export const programLabel = (value) => PROGRAMS.find((p) => p.value === value)?.label || value;

export function difficultyMeta(level) {
  if (!level) return null;
  if (level <= 2) return { label: "Easy", className: "bg-success/12 text-success border-success/25" };
  if (level === 3) return { label: "Moderate", className: "bg-warning/15 text-[oklch(0.5_0.12_70)] dark:text-warning border-warning/30" };
  return { label: "Challenging", className: "bg-destructive/10 text-destructive border-destructive/25" };
}
