import { calculateAverageRecovery } from "@/lib/ers/averageRecovery";
import { getReadinessStatus } from "@/lib/ers/readinessStatus";
import type { ScenarioInput } from "@/lib/ers/scenario/types";
import type { ERSInput } from "@/lib/ers/types";

function getRecoveryStatus(daysToClose: number): string {
  const scoreInput: ERSInput = {
    totalFitnessAssets: 1,
    repairWorkOrdersStarted90Days: 0,
    equipmentPMTouches90Days: 0,
    equipmentSpecificReporting: false,
    averageRecoveryDays: daysToClose,
    completedRepairWorkOrders90Days: 0,
    equipmentWithOpenRepairsOver10Days: 0,
    equipmentWithMoreThan3Repairs90Days: 0,
    nps: 0,
  };

  const result = calculateAverageRecovery(scoreInput);

  return getReadinessStatus(result.score);
}

export function createAverageRecoveryOpportunityViewModel(scenarioInput: ScenarioInput) {
  return {
    header: {
      organizationLabel: "All Locations",
      reportingPeriod: "Last 90 Days",
      lastUpdated: "08:30 ET · 23 Jul 2026",
    },
    summary: {
      title: "Average Recovery",
    },
    primaryMetrics: [
      {
        label: "Average Days to Close",
        value: String(scenarioInput.averageDaysToClose),
      },
    ],
    supportingMetrics: [
      {
        label: "Completed Equipment Work Orders",
        value: String(scenarioInput.completedEquipmentWorkOrders),
      },
    ],
    opportunityRows: [
      {
        sourceWorkOrderId: "WO-48211",
        asset: "HVAC Unit 214",
        location: "Atlanta North",
        openedDate: "10 Jul 2026",
        closedDate: "15 Jul 2026",
        daysToClose: 5,
        recoveryStatus: getRecoveryStatus(5),
      },
      {
        sourceWorkOrderId: "WO-48177",
        asset: "Conveyor Motor 88",
        location: "Dallas Central",
        openedDate: "08 Jul 2026",
        closedDate: "18 Jul 2026",
        daysToClose: 10,
        recoveryStatus: getRecoveryStatus(10),
      },
      {
        sourceWorkOrderId: "WO-48134",
        asset: "Dock Door Controller 42",
        location: "Tampa West",
        openedDate: "07 Jul 2026",
        closedDate: "20 Jul 2026",
        daysToClose: 13,
        recoveryStatus: getRecoveryStatus(13),
      },
      {
        sourceWorkOrderId: "WO-48092",
        asset: "Freezer Compressor 71",
        location: "Orlando South",
        openedDate: "04 Jul 2026",
        closedDate: "17 Jul 2026",
        daysToClose: 13,
        recoveryStatus: getRecoveryStatus(13),
      },
    ],
    filters: [
      { label: "Region", options: ["All Regions", "South", "Central", "North"] },
      { label: "Club", options: ["All Clubs", "Atlanta", "Dallas", "Tampa", "Orlando"] },
      { label: "Asset Type", options: ["All Types", "HVAC", "Conveyor", "Dock Door", "Refrigeration"] },
      { label: "Manufacturer", options: ["All Manufacturers", "Carrier", "Daikin", "Mitsubishi", "Hoshizaki"] },
    ],
    recommendations: [
      "Review repairs with long recovery times.",
      "Identify approval, vendor, or parts delays.",
      "Compare recovery performance across locations.",
      "Prioritize processes that shorten time to readiness.",
    ],
  };
}
