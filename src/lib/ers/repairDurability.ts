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

export function calculateRepairDurability(input: ERSInput): SignalScore {
  if (input.totalFitnessAssets === 0) {
    return {
      score: 0,
      explanation:
        "Repair Durability calculated from the percentage of fitness equipment with more than three completed repair work orders in the rolling 90-day period.",
    };
  }

  const repeatRepairPercent =
    input.equipmentWithMoreThan3Repairs90Days / input.totalFitnessAssets;

  const breakpoints: Array<{ percent: number; score: number }> = [
    { percent: 0, score: 100 },
    { percent: 0.01, score: 95 },
    { percent: 0.02, score: 90 },
    { percent: 0.03, score: 85 },
    { percent: 0.05, score: 70 },
    { percent: 0.07, score: 50 },
    { percent: 0.1, score: 0 },
  ];

  let score: number;

  if (repeatRepairPercent <= breakpoints[0].percent) {
    score = breakpoints[0].score;
  } else if (repeatRepairPercent >= breakpoints[breakpoints.length - 1].percent) {
    score = breakpoints[breakpoints.length - 1].score;
  } else {
    score = breakpoints[breakpoints.length - 1].score;

    for (let i = 0; i < breakpoints.length - 1; i += 1) {
      const left = breakpoints[i];
      const right = breakpoints[i + 1];

      if (repeatRepairPercent >= left.percent && repeatRepairPercent <= right.percent) {
        score = interpolate(
          repeatRepairPercent,
          left.percent,
          left.score,
          right.percent,
          right.score,
        );
        break;
      }
    }
  }

  const clampedScore = clamp(score, 0, 100);

  return {
    score: clampedScore,
    explanation:
      "Repair Durability calculated from the percentage of fitness equipment with more than three completed repair work orders in the rolling 90-day period.",
  };
}

export function calculateRepairDurabilityScore(input: ERSInput): SignalScore {
  return calculateRepairDurability(input);
}
