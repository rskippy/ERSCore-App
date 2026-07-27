import type { ERSInput } from "@/lib/ers/types";

export interface ScenarioInput {
  totalMonitoredAssets: number;
  workOrdersStarted: number;
  preventiveMaintenanceTouches: number;
  memberReportingAvailable: boolean;
  averageDaysToClose: number;
  completedEquipmentWorkOrders: number;
  totalOpenEquipmentWorkOrders: number;
  olderThan15Days: number;
  olderThan30Days: number;
  olderThan45Days: number;
  assetsWith3PlusRepairs: number;
}

export interface ScenarioModel {
  scenarioInput: ScenarioInput;
  ersInput: ERSInput;
}
