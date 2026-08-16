import { createDashboardViewModel } from "@/app/dashboard/data";
import { createScenarioSignalBundle } from "@/lib/ers/scenario/selectors";
import { getReadinessStatus, getDriverStatusLabel } from "@/lib/ers/readinessStatus";
import { signalWeights } from "@/lib/ers/remainingOpportunity";
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
  scoreDrag: OrgScoreDrag | null;
};

export type OrgSignalAverages = {
  detection: number;
  averageRecovery: number;
  repairDrag: number;
  repairDurability: number;
};

type OrgDragSignalDetail = {
  name: string;
  orgAvgScore: number;
  orgAvgStatus: string;
  weightedLoss: number;
};

export type OrgScoreDrag = {
  primarySignal: string;
  headline: string;
  detail: string;
  signals: readonly OrgDragSignalDetail[];
};

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function buildDragNarrative(
  ranked: OrgDragSignalDetail[],
): { headline: string; detail: string } {
  const primary = ranked[0];
  const weakSignals = ranked.filter((s) => s.orgAvgScore < 70);
  const allStrongOrBetter = ranked.every((s) => s.orgAvgScore >= 80);

  if (allStrongOrBetter) {
    return {
      headline: primary.name,
      detail: `Regional readiness is broadly strong. ${primary.name} represents the largest remaining weighted opportunity at ${roundToOneDecimal(primary.weightedLoss)} ERS points, but all four signals are performing well across the organization.`,
    };
  }

  if (weakSignals.length === 0) {
    return {
      headline: primary.name,
      detail: `${primary.name} is generating the greatest weighted ERS drag at ${roundToOneDecimal(primary.weightedLoss)} points. All signals are performing at an acceptable level or better; this represents the clearest remaining improvement opportunity.`,
    };
  }

  if (weakSignals.length === 1) {
    const weak = weakSignals[0];
    if (weak.name === primary.name) {
      return {
        headline: weak.name,
        detail: `${weak.name} is the primary drag on regional readiness (${weak.orgAvgStatus}), contributing ${roundToOneDecimal(weak.weightedLoss)} weighted ERS points of loss. The remaining signals are performing at an acceptable level or better.`,
      };
    }
    return {
      headline: primary.name,
      detail: `${primary.name} is generating the greatest weighted ERS drag at ${roundToOneDecimal(primary.weightedLoss)} points. ${weak.name} is additionally performing below the acceptable threshold (${weak.orgAvgStatus}) and warrants attention.`,
    };
  }

  if (weakSignals.length === 2) {
    const [first, second] = weakSignals;
    return {
      headline: `${first.name} & ${second.name}`,
      detail: `${first.name} and ${second.name} are the primary pressures on regional readiness, contributing a combined ${roundToOneDecimal(first.weightedLoss + second.weightedLoss)} weighted ERS points of loss.`,
    };
  }

  const names = weakSignals.map((s) => s.name);
  const last = names[names.length - 1];
  const rest = names.slice(0, -1);
  return {
    headline: "Broad-Based Pressure",
    detail: `Readiness pressure is broad-based. ${rest.join(", ")} and ${last} are the primary signals holding regional ERS below potential.`,
  };
}

export function computeOrgScoreDrag(avgScores: OrgSignalAverages): OrgScoreDrag {
  const raw = [
    { name: "Detection", score: avgScores.detection, loss: (100 - avgScores.detection) * signalWeights.detection },
    { name: "Average Recovery", score: avgScores.averageRecovery, loss: (100 - avgScores.averageRecovery) * signalWeights.averageRecovery },
    { name: "Repair Drag", score: avgScores.repairDrag, loss: (100 - avgScores.repairDrag) * signalWeights.repairDrag },
    { name: "Repair Durability", score: avgScores.repairDurability, loss: (100 - avgScores.repairDurability) * signalWeights.repairDurability },
  ];

  const sortedRaw = [...raw].sort((a, b) => b.loss - a.loss || a.name.localeCompare(b.name));

  const ranked: OrgDragSignalDetail[] = sortedRaw.map((e) => ({
    name: e.name,
    orgAvgScore: roundToOneDecimal(e.score),
    orgAvgStatus: getDriverStatusLabel(getReadinessStatus(e.score)),
    weightedLoss: roundToOneDecimal(e.loss),
  }));

  const { headline, detail } = buildDragNarrative(ranked);

  return {
    primarySignal: ranked[0].name,
    headline,
    detail,
    signals: ranked,
  };
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

  const count = locationMetrics.length;
  const scoreDrag: OrgScoreDrag | null = count > 0
    ? computeOrgScoreDrag({
        detection: locationMetrics.reduce((s, l) => s + l.detection, 0) / count,
        averageRecovery: locationMetrics.reduce((s, l) => s + l.averageRecovery, 0) / count,
        repairDrag: locationMetrics.reduce((s, l) => s + l.repairDrag, 0) / count,
        repairDurability: locationMetrics.reduce((s, l) => s + l.repairDurability, 0) / count,
      })
    : null;

  return {
    locations: rankedLocations,
    summary: summarizeEnterpriseLocations(rankedLocations),
    scoreDrag,
  };
}
