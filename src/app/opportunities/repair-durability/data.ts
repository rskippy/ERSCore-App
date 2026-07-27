import type { ScenarioInput } from "@/lib/ers/scenario/types";
import type { ERSSignalBundle } from "@/lib/ers/signalBundle";

function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}

function formatPoints(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `-${rounded.toFixed(1)} pts`;
}

export function createRepairDurabilityOpportunityViewModel(
  scenarioInput: ScenarioInput,
  bundle: ERSSignalBundle,
) {
  const repeatRepairAssets = scenarioInput.assetsWith3PlusRepairs;
  const totalAssets = scenarioInput.totalMonitoredAssets;
  const repeatRepairPercent = totalAssets > 0 ? (repeatRepairAssets / totalAssets) * 100 : 0;
  const estimatedImpact = (100 - bundle.signals.repairDurability.score) * 0.2;

  return {
    header: {
      organizationLabel: "All Locations",
      reportingPeriod: "Last 90 Days",
      lastUpdated: "08:30 ET · 23 Jul 2026",
    },
    summary: {
      sectionLabel: "Signal",
      title: "Repair Durability",
      subtitle:
        "Measures the long-term effectiveness of completed repairs by identifying assets with recurring repair activity.",
    },
    executiveReadinessInsight: [
      {
        heading: "What We're Seeing",
        paragraph:
          "Repeated repairs reduce Equipment Readiness because equipment is not remaining in service after repairs are completed. Assets that repeatedly return to the shop are creating recurring downtime and lower long-term effectiveness.",
      },
      {
        heading: "Why It Matters",
        paragraph:
          "Recurring failures often signal that the underlying cause was not fully corrected. When those assets continue to fail, readiness declines and technician effort is spent on repeat work instead of durable fixes.",
      },
      {
        heading: "What To Focus On",
        paragraph:
          "Review recurring failures, validate corrective actions, and evaluate whether replacement or redesign is more appropriate for the highest-risk assets.",
      },
    ],
    primaryMetrics: [
      { label: "Repeat Repair Assets", value: String(repeatRepairAssets) },
      { label: "Repeat Repair %", value: formatPercent(repeatRepairPercent) },
      { label: "Assets with 3+ Repairs (90 Days)", value: String(repeatRepairAssets) },
      { label: "Estimated Readiness Impact", value: formatPoints(estimatedImpact) },
    ],
    opportunityRows: [
      {
        asset: "HVAC Unit 214",
        location: "Atlanta North",
        repairCount: 4,
        lastRepairDate: "14 Jul 2026",
        daysSinceLastRepair: 10,
        riskLevel: "High",
      },
      {
        asset: "Conveyor Motor 88",
        location: "Dallas Central",
        repairCount: 3,
        lastRepairDate: "06 Jul 2026",
        daysSinceLastRepair: 18,
        riskLevel: "High",
      },
      {
        asset: "Dock Door Controller 42",
        location: "Tampa West",
        repairCount: 3,
        lastRepairDate: "01 Jul 2026",
        daysSinceLastRepair: 23,
        riskLevel: "Medium",
      },
      {
        asset: "Freezer Compressor 71",
        location: "Orlando South",
        repairCount: 4,
        lastRepairDate: "26 Jun 2026",
        daysSinceLastRepair: 29,
        riskLevel: "High",
      },
    ],
    filters: [
      { label: "Region", options: ["All Regions", "South", "Central", "North"] },
      { label: "Club", options: ["All Clubs", "Atlanta", "Dallas", "Tampa", "Orlando"] },
      { label: "Asset Type", options: ["All Types", "HVAC", "Conveyor", "Dock Door", "Refrigeration"] },
      { label: "Manufacturer", options: ["All Manufacturers", "Carrier", "Daikin", "Mitsubishi", "Hoshizaki"] },
    ],
    recommendations: [
      "Review recurring failures and identify the common failure mode across affected assets.",
      "Verify root cause was corrected before returning the asset to service.",
      "Evaluate replacement candidates for assets with repeated failure patterns.",
      "Review technician repair consistency and standardize corrective action steps.",
    ],
  };
}
