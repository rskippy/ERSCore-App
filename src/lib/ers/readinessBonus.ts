import type { ERSInput } from "./types";

export function calculateReadinessBonus(input: ERSInput): number {
  if (input.nps < 50) {
    return 0;
  }

  if (input.nps < 70) {
    return 5;
  }

  return 10;
}
