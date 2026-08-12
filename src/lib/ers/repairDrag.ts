import type { ERSInput, SignalScore } from "./types";

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

// Progressive aging weights reflect increasing member experience impact per day outstanding.
const WEIGHT_FRESH = 1.0;  // 0–15 days
const WEIGHT_BAND1 = 1.5;  // 16–30 days — member tolerance exceeded
const WEIGHT_BAND2 = 3.0;  // 31–45 days — serious readiness issue
const WEIGHT_BAND3 = 5.5;  // 46+ days — severe readiness issue

export function calculateRepairDrag(input: ERSInput): SignalScore {
  if (input.totalFitnessAssets === 0) {
    return {
      score: 0,
      explanation:
        "Repair Drag scored from repair pressure and aging across 15, 30, and 45-day member tolerance thresholds.",
    };
  }

  // Convert cumulative aging counts to exclusive age bands (avoid double-counting).
  const freshCount = Math.max(0, input.totalOpenEquipmentRepairs - input.equipmentWithOpenRepairsOver15Days);
  const band1Count = Math.max(0, input.equipmentWithOpenRepairsOver15Days - input.equipmentWithOpenRepairsOver30Days);
  const band2Count = Math.max(0, input.equipmentWithOpenRepairsOver30Days - input.equipmentWithOpenRepairsOver45Days);
  const band3Count = Math.max(0, input.equipmentWithOpenRepairsOver45Days);

  const weightedOpen =
    freshCount * WEIGHT_FRESH +
    band1Count * WEIGHT_BAND1 +
    band2Count * WEIGHT_BAND2 +
    band3Count * WEIGHT_BAND3;

  const weightedPressure = weightedOpen / input.totalFitnessAssets;

  // Breakpoints calibrated so that pressure from fresh repairs is penalised less
  // than the same count of severely aged repairs.
  const breakpoints: Array<{ p: number; score: number }> = [
    { p: 0.00, score: 100 },
    { p: 0.02, score: 97 },
    { p: 0.05, score: 85 },
    { p: 0.10, score: 72 },
    { p: 0.16, score: 55 },
    { p: 0.24, score: 38 },
    { p: 0.40, score: 12 },
    { p: 0.55, score: 0 },
  ];

  let score: number;

  if (weightedPressure <= breakpoints[0].p) {
    score = breakpoints[0].score;
  } else if (weightedPressure >= breakpoints[breakpoints.length - 1].p) {
    score = breakpoints[breakpoints.length - 1].score;
  } else {
    score = breakpoints[breakpoints.length - 1].score;

    for (let i = 0; i < breakpoints.length - 1; i += 1) {
      const left = breakpoints[i];
      const right = breakpoints[i + 1];

      if (weightedPressure >= left.p && weightedPressure <= right.p) {
        score = interpolate(weightedPressure, left.p, left.score, right.p, right.score);
        break;
      }
    }
  }

  return {
    score: clamp(score, 0, 100),
    explanation:
      "Repair Drag scored from repair pressure and aging across 15, 30, and 45-day member tolerance thresholds.",
  };
}

export function calculateRepairDragScore(input: ERSInput): SignalScore {
  return calculateRepairDrag(input);
}

