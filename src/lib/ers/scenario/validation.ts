import type { ScenarioInput } from "./types";

export type ScenarioField = keyof ScenarioInput;

export type ScenarioValidationResult = {
  isValid: boolean;
  error?: string;
};

function isNonNegativeNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function validateScenarioInput(input: ScenarioInput): ScenarioValidationResult {
  const numericFields: Array<Exclude<ScenarioField, "memberReportingAvailable">> = [
    "totalMonitoredAssets",
    "workOrdersStarted",
    "preventiveMaintenanceTouches",
    "averageDaysToClose",
    "completedEquipmentWorkOrders",
    "totalOpenEquipmentWorkOrders",
    "olderThan15Days",
    "olderThan30Days",
    "olderThan45Days",
    "assetsWith3PlusRepairs",
  ];

  for (const field of numericFields) {
    if (!isNonNegativeNumber(input[field])) {
      return {
        isValid: false,
        error: "Counts and average days cannot be negative.",
      };
    }
  }

  if (input.olderThan15Days > input.totalOpenEquipmentWorkOrders) {
    return {
      isValid: false,
      error: "Older Than 15 Days cannot exceed Total Open Equipment Work Orders.",
    };
  }

  if (input.olderThan30Days > input.totalOpenEquipmentWorkOrders) {
    return {
      isValid: false,
      error: "Older Than 30 Days cannot exceed Total Open Equipment Work Orders.",
    };
  }

  if (input.olderThan45Days > input.totalOpenEquipmentWorkOrders) {
    return {
      isValid: false,
      error: "Older Than 45 Days cannot exceed Total Open Equipment Work Orders.",
    };
  }

  if (input.olderThan45Days > input.olderThan30Days) {
    return {
      isValid: false,
      error: "Older Than 45 Days cannot exceed Older Than 30 Days.",
    };
  }

  if (input.olderThan30Days > input.olderThan15Days) {
    return {
      isValid: false,
      error: "Older Than 30 Days cannot exceed Older Than 15 Days.",
    };
  }

  if (input.assetsWith3PlusRepairs > input.totalMonitoredAssets) {
    return {
      isValid: false,
      error: "Assets with 4+ Repairs cannot exceed Total Monitored Assets.",
    };
  }

  return { isValid: true };
}

export function validateScenarioPatch(
  current: ScenarioInput,
  patch: Partial<ScenarioInput>,
): ScenarioValidationResult {
  const next = {
    ...current,
    ...patch,
  };

  return validateScenarioInput(next);
}
