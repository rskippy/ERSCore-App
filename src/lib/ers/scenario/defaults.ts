import type { ScenarioInput } from "./types";

export const FIXED_NPS = 42;

export const defaultScenarioInput: ScenarioInput = {
  totalMonitoredAssets: 150,
  workOrdersStarted: 4,
  preventiveMaintenanceTouches: 180,
  memberReportingAvailable: true,
  averageDaysToClose: 20,
  completedEquipmentWorkOrders: 39,
  totalOpenEquipmentWorkOrders: 86,
  olderThan15Days: 15,
  olderThan30Days: 9,
  olderThan45Days: 4,
  assetsWith3PlusRepairs: 10,
};
