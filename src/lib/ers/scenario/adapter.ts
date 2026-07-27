import type { ERSInput } from "@/lib/ers/types";
import { FIXED_NPS } from "./defaults";
import type { ScenarioInput, ScenarioModel } from "./types";

export function toErsInput(scenarioInput: ScenarioInput): ERSInput {
  return {
    totalFitnessAssets: scenarioInput.totalMonitoredAssets,
    repairWorkOrdersStarted90Days: scenarioInput.workOrdersStarted,
    equipmentPMTouches90Days: scenarioInput.preventiveMaintenanceTouches,
    equipmentSpecificReporting: scenarioInput.memberReportingAvailable,
    averageRecoveryDays: scenarioInput.averageDaysToClose,
    completedRepairWorkOrders90Days: scenarioInput.completedEquipmentWorkOrders,
    // Keep the existing engine contract unchanged in V1.
    equipmentWithOpenRepairsOver10Days: scenarioInput.olderThan15Days,
    equipmentWithMoreThan3Repairs90Days: scenarioInput.assetsWith3PlusRepairs,
    nps: FIXED_NPS,
  };
}

export function buildScenarioModel(scenarioInput: ScenarioInput): ScenarioModel {
  const ersInput = toErsInput(scenarioInput);

  return {
    scenarioInput,
    ersInput,
  };
}
