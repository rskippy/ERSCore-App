import { createDashboardViewModel } from "@/app/dashboard/data";
import { createScenarioSignalBundle } from "@/lib/ers/scenario/selectors";
import type { ScenarioInput } from "@/lib/ers/scenario/types";
import type { ScenarioLocation } from "@/lib/ers/scenario/store";

export type EnterpriseLocationMetric = {
  locationName: ScenarioLocation;
  overallErs: number;
  detection: number;
  averageRecovery: number;
  repairDrag: number;
  repairDurability: number;
  greatestOpportunity: string;
};

export type EnterpriseSummary = {
  organizationErs: number;
  totalLocations: number;
  strongLocations: number;
  stableLocations: number;
  atRiskLocations: number;
  criticalLocations: number;
};

export type EnterpriseDashboardViewModel = {
  locations: EnterpriseLocationMetric[];
  summary: EnterpriseSummary;
};

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function getRiskBand(score: number): "Strong" | "Stable" | "At Risk" | "Critical" {
  if (score >= 85) {
    return "Strong";
  }

  if (score >= 70) {
    return "Stable";
  }

  if (score >= 55) {
    return "At Risk";
  }

  return "Critical";
}

export function summarizeEnterpriseLocations(locations: EnterpriseLocationMetric[]): EnterpriseSummary {
  const total = locations.reduce((sum, location) => sum + location.overallErs, 0);
  const locationCount = locations.length;
  const organizationErs = locationCount > 0 ? roundToOneDecimal(total / locationCount) : 0;

  let strongLocations = 0;
  let stableLocations = 0;
  let atRiskLocations = 0;
  let criticalLocations = 0;

  for (const location of locations) {
    const band = getRiskBand(location.overallErs);

    if (band === "Strong") {
      strongLocations += 1;
      continue;
    }

    if (band === "Stable") {
      stableLocations += 1;
      continue;
    }

    if (band === "At Risk") {
      atRiskLocations += 1;
      continue;
    }

    criticalLocations += 1;
  }

  return {
    organizationErs,
    totalLocations: locationCount,
    strongLocations,
    stableLocations,
    atRiskLocations,
    criticalLocations,
  };
}

export function createEnterpriseDashboardViewModel(
  locationNames: readonly ScenarioLocation[],
  locationScenarioInputs: Record<ScenarioLocation, ScenarioInput>,
): EnterpriseDashboardViewModel {
  const locationMetrics = locationNames.map((locationName) => {
    const scenarioInput = locationScenarioInputs[locationName];
    const scenarioBundle = createScenarioSignalBundle(scenarioInput);
    const dashboardViewModel = createDashboardViewModel(scenarioBundle, scenarioInput);

    return {
      locationName,
      overallErs: dashboardViewModel.overallScore,
      detection: scenarioBundle.signals.detection.score,
      averageRecovery: scenarioBundle.signals.averageRecovery.score,
      repairDrag: scenarioBundle.signals.repairDrag.score,
      repairDurability: scenarioBundle.signals.repairDurability.score,
      greatestOpportunity: dashboardViewModel.opportunity.signalName,
    };
  });

  const rankedLocations = [...locationMetrics].sort((left, right) => {
    if (right.overallErs !== left.overallErs) {
      return right.overallErs - left.overallErs;
    }

    return left.locationName.localeCompare(right.locationName);
  });

  return {
    locations: rankedLocations,
    summary: summarizeEnterpriseLocations(rankedLocations),
  };
}
