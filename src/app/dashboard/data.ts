import {
  calculateRemainingErsOpportunity,
  formatRemainingErsOpportunity,
  signalWeights,
  type WeightedSignalName,
} from "@/lib/ers/remainingOpportunity";
import { calculateERS } from "@/lib/ers/scoreEngine";
import type { ERSSignalBundle } from "@/lib/ers/signalBundle";
import type { ScenarioInput } from "@/lib/ers/scenario/types";

export type DashboardSignalName =
  | "Detection"
  | "Average Recovery"
  | "Repair Drag"
  | "Repair Durability";

export type DashboardSignalSnapshot = {
  signalName: DashboardSignalName;
  currentScore: number;
  status: string;
  trend: string;
  estimatedErsImpact: string;
};

type ReadinessDriver = {
  signalName: DashboardSignalName;
  score: number;
  weightLabel: string;
  weight: number;
  status: string;
  potentialGain: number;
};

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function formatPoints(value: number): string {
  const rounded = roundToOneDecimal(value);
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  const unit = rounded === 1 ? "point" : "points";

  return `+${text} ${unit}`;
}

function formatPointsDisplay(value: number): string {
  const rounded = roundToOneDecimal(value);

  return `+${rounded.toFixed(1)} Points`;
}

function getSignalScores(bundle: ERSSignalBundle) {
  return {
    detection: bundle.signals.detection.score,
    averageRecovery: bundle.signals.averageRecovery.score,
    repairDrag: bundle.signals.repairDrag.score,
    repairDurability: bundle.signals.repairDurability.score,
  };
}

function getSignalStatuses(bundle: ERSSignalBundle) {
  return {
    detection: bundle.signals.detection.status,
    averageRecovery: bundle.signals.averageRecovery.status,
    repairDrag: bundle.signals.repairDrag.status,
    repairDurability: bundle.signals.repairDurability.status,
  };
}

function getPotentialGains(bundle: ERSSignalBundle) {
  const scores = getSignalScores(bundle);

  return {
    detection: (100 - scores.detection) * signalWeights.detection,
    averageRecovery: (100 - scores.averageRecovery) * signalWeights.averageRecovery,
    repairDrag: (100 - scores.repairDrag) * signalWeights.repairDrag,
    repairDurability: (100 - scores.repairDurability) * signalWeights.repairDurability,
  };
}

export function getDashboardSignalSnapshot(
  signalName: DashboardSignalName,
  bundle: ERSSignalBundle,
): DashboardSignalSnapshot {
  const scores = getSignalScores(bundle);
  const statuses = getSignalStatuses(bundle);
  const gains = getPotentialGains(bundle);

  switch (signalName) {
    case "Detection":
      return {
        signalName,
        currentScore: scores.detection,
        status: statuses.detection,
        trend: bundle.signals.detection.trend,
        estimatedErsImpact: formatPoints(gains.detection),
      };
    case "Average Recovery":
      return {
        signalName,
        currentScore: scores.averageRecovery,
        status: statuses.averageRecovery,
        trend: bundle.signals.averageRecovery.trend,
        estimatedErsImpact: formatPoints(gains.averageRecovery),
      };
    case "Repair Drag":
      return {
        signalName,
        currentScore: scores.repairDrag,
        status: statuses.repairDrag,
        trend: bundle.signals.repairDrag.trend,
        estimatedErsImpact: formatPoints(gains.repairDrag),
      };
    case "Repair Durability":
      return {
        signalName,
        currentScore: scores.repairDurability,
        status: statuses.repairDurability,
        trend: bundle.signals.repairDurability.trend,
        estimatedErsImpact: formatPoints(gains.repairDurability),
      };
  }
}

function createExecutiveSummary(overallScore: number, issue: ReadinessDriver): string {
  const impact = formatPoints(issue.potentialGain);

  if (overallScore < 50) {
    return (
      `Overall readiness is critical at ${overallScore}, led by weakness in ${issue.signalName} (score ${issue.score}). ` +
      `The highest-impact improvement is to prioritize ${issue.signalName} performance, with an estimated overall ERS gain of ${impact}.`
    );
  }

  if (overallScore < 70) {
    return (
      `Overall readiness is below target at ${overallScore} and currently at risk. ` +
      `${issue.signalName} is the largest contributor to readiness drag (score ${issue.score}), and improving it could add approximately ${impact} to overall ERS.`
    );
  }

  return (
    `Overall readiness is stable at ${overallScore}, with operations performing positively across core signals. ` +
    `The next best opportunity is ${issue.signalName} (score ${issue.score}), with potential to add approximately ${impact} to overall ERS.`
  );
}

export function createDashboardViewModel(bundle: ERSSignalBundle, scenarioInput: ScenarioInput) {
  const ersResult = calculateERS(bundle.input);
  const scores = getSignalScores(bundle);
  const statuses = getSignalStatuses(bundle);
  const gains = getPotentialGains(bundle);

  const readinessDrivers: ReadinessDriver[] = [
    {
      signalName: "Detection",
      score: scores.detection,
      weightLabel: "30%",
      weight: signalWeights.detection,
      status: statuses.detection,
      potentialGain: gains.detection,
    },
    {
      signalName: "Average Recovery",
      score: scores.averageRecovery,
      weightLabel: "30%",
      weight: signalWeights.averageRecovery,
      status: statuses.averageRecovery,
      potentialGain: gains.averageRecovery,
    },
    {
      signalName: "Repair Drag",
      score: scores.repairDrag,
      weightLabel: "20%",
      weight: signalWeights.repairDrag,
      status: statuses.repairDrag,
      potentialGain: gains.repairDrag,
    },
    {
      signalName: "Repair Durability",
      score: scores.repairDurability,
      weightLabel: "20%",
      weight: signalWeights.repairDurability,
      status: statuses.repairDurability,
      potentialGain: gains.repairDurability,
    },
  ];

  const greatestOpportunitySignal = readinessDrivers.reduce((lowest, current) =>
    current.score < lowest.score ? current : lowest,
  );

  const signalNameToWeightKey: Record<DashboardSignalName, WeightedSignalName> = {
    Detection: "detection",
    "Average Recovery": "averageRecovery",
    "Repair Drag": "repairDrag",
    "Repair Durability": "repairDurability",
  };

  const remainingErsOpportunityValue = calculateRemainingErsOpportunity(
    greatestOpportunitySignal.score,
    signalWeights[signalNameToWeightKey[greatestOpportunitySignal.signalName]],
  );

  const executiveSummary = createExecutiveSummary(ersResult.finalERS, greatestOpportunitySignal);

  return {
    organizationLabel: bundle.reportingContext.organizationLabel,
    reportingPeriod: bundle.reportingContext.reportingPeriod,
    lastUpdated: `Updated ${bundle.reportingContext.lastUpdated.replace("·", "•")}`,
    overallScore: ersResult.finalERS,
    rating: ersResult.finalERS < 50 ? "Critical" : ersResult.finalERS < 70 ? "At Risk" : "Stable",
    trendValue: "+3 points",
    trendLabel: "vs Previous 90 Days",
    potentialImprovement: formatPointsDisplay(greatestOpportunitySignal.potentialGain),
    opportunity: {
      title: "Greatest Opportunity",
      heading: greatestOpportunitySignal.signalName,
      signalName: greatestOpportunitySignal.signalName,
      currentSignalScore: greatestOpportunitySignal.score,
      status: greatestOpportunitySignal.status,
      primaryDriver: `${scenarioInput.olderThan15Days} of ${scenarioInput.totalOpenEquipmentWorkOrders} open equipment work orders are older than 15 days.`,
      supportingDriver: `${scenarioInput.olderThan30Days} work orders are older than 30 days.`,
      remainingErsOpportunity: formatRemainingErsOpportunity(remainingErsOpportunityValue),
      recommendedAction:
        "Review the oldest contributing work orders in the source CMMS and prioritize those with approval, parts, or scheduling delays.",
      improvement: formatPoints(greatestOpportunitySignal.potentialGain),
      statement:
        "Aging unresolved work is creating the largest current readiness penalty and the clearest path to near-term gain.",
      buttonLabel: "View Repair Drag Opportunity",
    },
    drivers: [
      {
        label: "Detection",
        score: scores.detection,
        status: statuses.detection,
        trend: bundle.signals.detection.trend,
        explanation: "Preventive maintenance and member reporting are supporting early issue detection.",
        href: "/opportunities/detection",
        opportunity: `Potential ${formatPoints(gains.detection)}`,
      },
      {
        label: "Average Recovery",
        score: scores.averageRecovery,
        status: statuses.averageRecovery,
        trend: bundle.signals.averageRecovery.trend,
        explanation: "Most completed equipment repairs are being resolved within the expected recovery period.",
        href: "/opportunities/average-recovery",
        opportunity: `Potential ${formatPoints(gains.averageRecovery)}`,
      },
      {
        label: "Repair Drag",
        score: scores.repairDrag,
        status: statuses.repairDrag,
        trend: bundle.signals.repairDrag.trend,
        explanation: "Aging open work orders are creating the largest current readiness penalty.",
        href: "/opportunities/repair-drag",
        isGreatestOpportunity: true,
        opportunity: `Potential ${formatPoints(gains.repairDrag)}`,
      },
      {
        label: "Repair Durability",
        score: scores.repairDurability,
        status: statuses.repairDurability,
        trend: bundle.signals.repairDurability.trend,
        explanation:
          "Repeat repairs are indicating durability concerns that may be shortening asset life and increasing readiness risk.",
        href: "/opportunities/repair-durability",
        opportunity: `Potential ${formatPoints(gains.repairDurability)}`,
      },
    ],
    executiveSummary,
    readinessDrivers,
  };
}
