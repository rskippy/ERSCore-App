import { describe, expect, test } from "vitest";
import { createDashboardViewModel, type DashboardSignalName } from "./data";
import { ersSignalBundle } from "@/lib/ers/sharedBundle";
import { defaultScenarioInput } from "@/lib/ers/scenario/defaults";

function createBundleWithSignalScores(overrides: {
  detection: number;
  averageRecovery: number;
  repairDrag: number;
  repairDurability: number;
}) {
  return {
    ...ersSignalBundle,
    signals: {
      ...ersSignalBundle.signals,
      detection: {
        ...ersSignalBundle.signals.detection,
        score: overrides.detection,
      },
      averageRecovery: {
        ...ersSignalBundle.signals.averageRecovery,
        score: overrides.averageRecovery,
      },
      repairDrag: {
        ...ersSignalBundle.signals.repairDrag,
        score: overrides.repairDrag,
      },
      repairDurability: {
        ...ersSignalBundle.signals.repairDurability,
        score: overrides.repairDurability,
      },
    },
  };
}

describe("dashboard greatest opportunity content", () => {
  test.each([
    {
      signalName: "Detection" as DashboardSignalName,
      scores: {
        detection: 30,
        averageRecovery: 80,
        repairDrag: 70,
        repairDurability: 75,
      },
      expectedStatement:
        "Lower issue-identification activity is creating the largest current readiness penalty and the clearest path to near-term gain.",
      expectedButtonLabel: "View Detection Opportunity",
      expectedPrimaryDriver: `${defaultScenarioInput.workOrdersStarted} equipment work orders were started in the current reporting period.`,
      expectedSupportingDriver: `${defaultScenarioInput.preventiveMaintenanceTouches} preventive maintenance touches were completed, and member reporting is available.`,
      expectedRecommendedAction:
        "Increase early issue identification by improving preventive maintenance follow-through and member reporting adoption.",
    },
    {
      signalName: "Average Recovery" as DashboardSignalName,
      scores: {
        detection: 80,
        averageRecovery: 30,
        repairDrag: 70,
        repairDurability: 75,
      },
      expectedStatement:
        "Longer repair closure cycles are creating the largest current readiness penalty and the clearest path to near-term gain.",
      expectedButtonLabel: "View Average Recovery Opportunity",
      expectedPrimaryDriver: `${defaultScenarioInput.averageDaysToClose} average days are required to close completed equipment work orders.`,
      expectedSupportingDriver: `${defaultScenarioInput.completedEquipmentWorkOrders} completed equipment work orders are included in the current recovery cycle.`,
      expectedRecommendedAction:
        "Review the longest-cycle completed repairs in the source CMMS and remove approval, parts, or scheduling delays that extend closure time.",
    },
    {
      signalName: "Repair Drag" as DashboardSignalName,
      scores: {
        detection: 80,
        averageRecovery: 75,
        repairDrag: 30,
        repairDurability: 70,
      },
      expectedStatement:
        "Aging unresolved work is creating the largest current readiness penalty and the clearest path to near-term gain.",
      expectedButtonLabel: "View Repair Drag Opportunity",
      expectedPrimaryDriver: `${defaultScenarioInput.olderThan15Days} of ${defaultScenarioInput.totalOpenEquipmentWorkOrders} open equipment work orders are older than 15 days.`,
      expectedSupportingDriver: `${defaultScenarioInput.olderThan30Days} work orders are older than 30 days.`,
      expectedRecommendedAction:
        "Review the oldest contributing work orders in the source CMMS and prioritize those with approval, parts, or scheduling delays.",
    },
    {
      signalName: "Repair Durability" as DashboardSignalName,
      scores: {
        detection: 80,
        averageRecovery: 75,
        repairDrag: 70,
        repairDurability: 30,
      },
      expectedStatement:
        "Repeat repair activity is creating the largest current readiness penalty and the clearest path to near-term gain.",
      expectedButtonLabel: "View Repair Durability Opportunity",
      expectedPrimaryDriver: `${defaultScenarioInput.assetsWith3PlusRepairs} monitored assets have 4 or more repairs in the last 90 days.`,
      expectedSupportingDriver: `${defaultScenarioInput.totalMonitoredAssets} total monitored assets are included in this repeat-repair rate.`,
      expectedRecommendedAction:
        "Prioritize recurring-failure assets for root-cause correction and validate durable fixes before returning them to normal service.",
    },
  ])(
    "uses %s-specific panel content when it is the greatest opportunity",
    ({
      signalName,
      scores,
      expectedStatement,
      expectedButtonLabel,
      expectedPrimaryDriver,
      expectedSupportingDriver,
      expectedRecommendedAction,
    }) => {
      const bundle = createBundleWithSignalScores(scores);
      const viewModel = createDashboardViewModel(bundle, defaultScenarioInput);

      expect(viewModel.opportunity.signalName).toBe(signalName);
      expect(viewModel.opportunity.statement).toBe(expectedStatement);
      expect(viewModel.opportunity.buttonLabel).toBe(expectedButtonLabel);
      expect(viewModel.opportunity.primaryDriver).toBe(expectedPrimaryDriver);
      expect(viewModel.opportunity.supportingDriver).toBe(expectedSupportingDriver);
      expect(viewModel.opportunity.recommendedAction).toBe(expectedRecommendedAction);

      const highlightedDrivers = viewModel.drivers.filter((driver) => driver.isGreatestOpportunity);
      expect(highlightedDrivers).toHaveLength(1);
      expect(highlightedDrivers[0]?.label).toBe(signalName);
    },
  );
});
