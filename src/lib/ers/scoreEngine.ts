import { calculateAverageRecovery } from "./averageRecovery";
import { calculateDetection } from "./detection";
import { calculateReadinessBonus } from "./readinessBonus";
import { calculateRepairDrag } from "./repairDrag";
import { calculateRepairDurability } from "./repairDurability";
import type { ERSInput, ERSResult } from "./types";

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateERS(input: ERSInput): ERSResult {
  const detection = calculateDetection(input);
  const averageRecovery = calculateAverageRecovery(input);
  const repairDrag = calculateRepairDrag(input);
  const repairDurability = calculateRepairDurability(input);
  const readinessBonus = calculateReadinessBonus(input);

  const detectionScore = roundToOneDecimal(detection.score);
  const averageRecoveryScore = roundToOneDecimal(averageRecovery.score);
  const repairDragScore = roundToOneDecimal(repairDrag.score);
  const repairDurabilityScore = roundToOneDecimal(repairDurability.score);

  const baseERS = roundToOneDecimal(
    detectionScore * 0.3 +
      averageRecoveryScore * 0.3 +
      repairDragScore * 0.2 +
      repairDurabilityScore * 0.2,
  );

  const roundedReadinessBonus = roundToOneDecimal(readinessBonus);
  const finalERS = roundToOneDecimal(Math.min(100, baseERS + roundedReadinessBonus));

  return {
    detectionScore,
    averageRecoveryScore,
    repairDragScore,
    repairDurabilityScore,
    baseERS,
    readinessBonus: roundedReadinessBonus,
    finalERS,
  };
}
