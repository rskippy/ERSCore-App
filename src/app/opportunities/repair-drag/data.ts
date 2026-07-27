import type { ScenarioInput } from "@/lib/ers/scenario/types";

function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}

export function createRepairDragOpportunityViewModel(scenarioInput: ScenarioInput) {
  const totalOpen = scenarioInput.totalOpenEquipmentWorkOrders;
  const olderThan15 = scenarioInput.olderThan15Days;
  const olderThan30 = scenarioInput.olderThan30Days;
  const olderThan45 = scenarioInput.olderThan45Days;
  const totalAssets = scenarioInput.totalMonitoredAssets;

  const repairDragPercent =
    totalOpen > 0 ? (olderThan15 / totalOpen) * 100 : 0;
  const pressurePercent =
    totalAssets > 0 ? (totalOpen / totalAssets) * 100 : 0;

  const age15To29 = Math.max(olderThan15 - olderThan30, 0);
  const age30To44 = Math.max(olderThan30 - olderThan45, 0);
  const age45Plus = Math.max(olderThan45, 0);

  return {
    header: {
      organizationLabel: "All Locations",
      reportingPeriod: "Last 90 Days",
      lastUpdated: "08:30 ET · 23 Jul 2026",
    },
    summary: {
      sectionLabel: "Greatest Opportunity",
      title: "Repair Drag",
      statement:
        "Aging unresolved work represents the clearest path to improved equipment readiness.",
    },
    whyThisMatters:
      "Repair Drag measures the impact of aging unresolved equipment work. Regardless of whether delays result from parts, approvals, scheduling, staffing, warranty processing, or another constraint, the member experiences the same outcome: the equipment is not ready.",
    executiveReadinessInsight: [
      {
        heading: "What We're Seeing",
        paragraph:
          "Your Repair Drag score indicates that aging equipment repairs are beginning to reduce overall readiness. As unresolved work ages, repair demand can outpace current repair capacity.",
      },
      {
        heading: "Why It Matters",
        paragraph:
          "As repair backlogs grow, equipment remains unavailable longer, increasing the likelihood of member frustration and reducing overall readiness. ERS measures readiness rather than fault, regardless of whether delays are caused by parts, approvals, staffing, or vendor scheduling.",
      },
      {
        heading: "What To Focus On",
        paragraph:
          "Reduce the oldest work orders first. Prioritize repairs delayed by approvals, parts availability, or scheduling because resolving these typically provides the greatest improvement to Repair Drag.",
      },
    ],
    scoreInputs: [
      {
        label: "Repair Drag %",
        value: formatPercent(repairDragPercent),
        description: "Percentage of open equipment work orders older than 15 days.",
      },
      {
        label: "Pressure %",
        value: formatPercent(pressurePercent),
        description: "Percentage of total equipment currently represented by open work orders.",
      },
    ],
    supportingMetrics: [
      { label: "Open Equipment Work Orders", value: String(totalOpen) },
      { label: "Older than 15 Days", value: String(olderThan15) },
      { label: "Older than 30 Days", value: String(olderThan30) },
      { label: "Older than 45 Days", value: String(olderThan45) },
    ],
    agingDistribution: [
      { label: "15–29 days", value: age15To29, color: "#16a34a" },
      { label: "30–44 days", value: age30To44, color: "#0f766e" },
      { label: "45+ days", value: age45Plus, color: "#14b8a6" },
    ],
    recommendedActions: [
      "Review and approve pending repair estimates.",
      "Escalate parts and vendor delays older than 15 days.",
      "Prioritize the oldest unresolved equipment repairs first.",
    ],
    expectedResult:
      "Reducing the percentage of aging unresolved work could improve the overall Equipment Readiness Score.",
  };
}
