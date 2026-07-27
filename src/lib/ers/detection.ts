import type { ERSInput, SignalScore } from "./types";

export type DetectionDriverScores = {
  workOrdersStartedScore: number;
  pmCoverageScore: number;
  memberReportingScore: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function interpolate(
  x: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  if (x2 === x1) {
    return y1;
  }

  return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

function calculatePMCoverage(pmTouchesPerAsset: number): number {
  if (pmTouchesPerAsset <= 0) {
    return 0;
  }

  if (pmTouchesPerAsset >= 3) {
    return 100;
  }

  if (pmTouchesPerAsset <= 0.5) {
    return interpolate(pmTouchesPerAsset, 0, 0, 0.5, 40);
  }

  if (pmTouchesPerAsset <= 1) {
    return interpolate(pmTouchesPerAsset, 0.5, 40, 1, 75);
  }

  return interpolate(pmTouchesPerAsset, 1, 75, 3, 100);
}

export function getDetectionDriverScores(input: ERSInput): DetectionDriverScores {
  const hasAssets = input.totalFitnessAssets > 0;

  const monthlyRate = hasAssets
    ? (input.repairWorkOrdersStarted90Days / 3) *
      (150 / input.totalFitnessAssets)
    : 0;
  const workOrdersStartedScore = clamp(monthlyRate * 20, 0, 100);

  const pmTouchesPerAsset = hasAssets
    ? input.equipmentPMTouches90Days / input.totalFitnessAssets
    : 0;
  const pmCoverageScore = clamp(calculatePMCoverage(pmTouchesPerAsset), 0, 100);

  const memberReportingScore = input.equipmentSpecificReporting ? 100 : 0;

  return {
    workOrdersStartedScore,
    pmCoverageScore,
    memberReportingScore,
  };
}

export function calculateDetection(input: ERSInput): SignalScore {
  const {
    workOrdersStartedScore,
    pmCoverageScore,
    memberReportingScore,
  } = getDetectionDriverScores(input);

  const finalDetectionScore =
    workOrdersStartedScore * 0.5 +
    pmCoverageScore * 0.3 +
    memberReportingScore * 0.2;

  return {
    score: finalDetectionScore,
    explanation:
      "Detection calculated from Repair Identification, PM Coverage, and Member Reporting.",
  };
}

export function calculateDetectionScore(input: ERSInput): SignalScore {
  return calculateDetection(input);
}
