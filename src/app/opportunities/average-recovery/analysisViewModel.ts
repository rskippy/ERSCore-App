import type { AverageRecoverySignalBundle } from "@/lib/ers/signalBundle";

export type AverageRecoveryAnalysisViewModel = {
  signalName: string;
  currentScore: number;
  status: string;
  trend: string;
  averageDaysToClose: string;
  completedEquipmentWorkOrders: string;
  executiveSummary: string;
};

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function createAverageRecoveryAnalysisViewModel(
  signal: AverageRecoverySignalBundle,
  reportingPeriod: string,
): AverageRecoveryAnalysisViewModel {
  const averageDaysToClose = formatNumber(signal.supportingMetrics.averageDaysToClose);
  const completedEquipmentWorkOrders = String(signal.supportingMetrics.completedEquipmentWorkOrders);

  return {
    signalName: signal.narrativeInputs.signalName,
    currentScore: signal.score,
    status: signal.status,
    trend: signal.trend,
    averageDaysToClose,
    completedEquipmentWorkOrders,
    executiveSummary:
      `${signal.narrativeInputs.signalName} is ${signal.status.toLowerCase()} with an average closure time of ` +
      `${averageDaysToClose} days across ${completedEquipmentWorkOrders} completed equipment work orders during ${reportingPeriod.toLowerCase()}.`,
  };
}
