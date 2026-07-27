export interface ERSInput {
  totalFitnessAssets: number;
  repairWorkOrdersStarted90Days: number;
  equipmentPMTouches90Days: number;
  equipmentSpecificReporting: boolean;
  averageRecoveryDays: number;
  completedRepairWorkOrders90Days: number;
  equipmentWithOpenRepairsOver10Days: number;
  equipmentWithMoreThan3Repairs90Days: number;
  nps: number;
}

export interface SignalScore {
  score: number;
  explanation: string;
}

export interface ERSResult {
  detectionScore: number;
  averageRecoveryScore: number;
  repairDragScore: number;
  repairDurabilityScore: number;
  baseERS: number;
  readinessBonus: number;
  finalERS: number;
}
