export function getReadinessStatus(score: number): string {
  if (score >= 90) {
    return "Exceptional";
  }

  if (score >= 80) {
    return "Strong";
  }

  if (score >= 70) {
    return "Stable";
  }

  if (score >= 60) {
    return "Needs Improvement";
  }

  if (score >= 40) {
    return "At Risk";
  }

  return "Critical";
}

/** Maps a raw readiness status to its driver-level display label (Stable → Acceptable). */
export function getDriverStatusLabel(status: string): string {
  return status === "Stable" ? "Acceptable" : status;
}

export function getReadinessStatusBadgeClasses(status: string): string {
  switch (status) {
    case "Critical":
      return "border-red-300 bg-red-100 text-red-800 font-bold";
    case "At Risk":
      return "border-orange-300 bg-orange-100 text-orange-800 font-bold";
    case "Needs Improvement":
      return "border-amber-300 bg-amber-100 text-amber-800 font-bold";
    case "Stable":
      // Used for overall ERS score badges only — keep green.
      return "border-green-300 bg-green-100 text-green-800 font-bold";
    case "Acceptable":
      return "border-sky-300 bg-sky-50 text-sky-700 font-bold";
    case "Strong":
      return "border-cyan-400 bg-cyan-100 text-cyan-800 font-bold";
    case "Exceptional":
      return "border-emerald-500 bg-emerald-200 text-emerald-900 font-bold";
    default:
      return "border-[#cfded8] bg-[#f3f8f5] text-[#35515f] font-bold";
  }
}

export function getReadinessStatusCardClasses(status: string): string {
  switch (status) {
    case "Critical":
      return "border-red-200 bg-red-50";
    case "At Risk":
      return "border-orange-200 bg-orange-50";
    case "Needs Improvement":
      return "border-amber-200 bg-amber-50";
    case "Stable":
      return "border-green-200 bg-green-50";
    case "Acceptable":
      return "border-sky-200 bg-sky-50";
    case "Strong":
      return "border-cyan-200 bg-cyan-50";
    case "Exceptional":
      return "border-emerald-300 bg-emerald-100";
    default:
      return "border-[#dcebe6] bg-[#f7fcfa]";
  }
}
