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

export function calculateAverageRecovery(input: ERSInput): SignalScore {
  const days = input.averageRecoveryDays;

  const breakpoints: Array<{ days: number; score: number }> = [
    { days: 0, score: 100 },
    { days: 2, score: 95 },
    { days: 5, score: 85 },
    { days: 10, score: 70 },
    { days: 15, score: 50 },
    { days: 20, score: 30 },
    { days: 30, score: 0 },
  ];

  let score: number;

  if (days <= breakpoints[0].days) {
    score = breakpoints[0].score;
  } else if (days >= breakpoints[breakpoints.length - 1].days) {
    score = breakpoints[breakpoints.length - 1].score;
  } else {
    score = breakpoints[breakpoints.length - 1].score;

    for (let i = 0; i < breakpoints.length - 1; i += 1) {
      const left = breakpoints[i];
      const right = breakpoints[i + 1];

      if (days >= left.days && days <= right.days) {
        score = interpolate(days, left.days, left.score, right.days, right.score);
        break;
      }
    }
  }

  const clampedScore = clamp(score, 0, 100);

  return {
    score: clampedScore,
    explanation:
      "Average Recovery calculated from average calendar days required to complete repair work orders.",
  };
}

export function calculateAverageRecoveryScore(input: ERSInput): SignalScore {
  return calculateAverageRecovery(input);
}
