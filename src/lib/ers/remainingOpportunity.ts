export const signalWeights = {
  detection: 0.3,
  averageRecovery: 0.3,
  repairDrag: 0.2,
  repairDurability: 0.2,
} as const;

export type WeightedSignalName = keyof typeof signalWeights;

export function calculateRemainingErsOpportunity(
  score: number,
  weight: number,
): number {
  return weight * (100 - score);
}

export function formatRemainingErsOpportunity(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `+${rounded.toFixed(1)} points`;
}
