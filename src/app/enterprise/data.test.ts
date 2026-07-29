import { describe, expect, test } from "vitest";
import { defaultScenarioInput } from "@/lib/ers/scenario/defaults";
import { ERS_LOCATIONS, type ScenarioLocation } from "@/lib/ers/scenario/store";
import type { ScenarioInput } from "@/lib/ers/scenario/types";
import {
  createEnterpriseDashboardViewModel,
  summarizeEnterpriseLocations,
  type EnterpriseLocationMetric,
} from "./data";

function createLocationInputs(): Record<ScenarioLocation, ScenarioInput> {
  return {
    "Location 1": { ...defaultScenarioInput },
    "Location 2": { ...defaultScenarioInput },
    "Location 3": { ...defaultScenarioInput },
    "Location 4": { ...defaultScenarioInput },
    "Location 5": { ...defaultScenarioInput },
    "Location 6": { ...defaultScenarioInput },
  };
}

describe("enterprise dashboard calculations", () => {
  test("summarizes organization ERS and location status buckets", () => {
    const locations: EnterpriseLocationMetric[] = [
      {
        locationName: "Location 1",
        overallErs: 92.2,
        detection: 95,
        averageRecovery: 91,
        repairDrag: 90,
        repairDurability: 92,
        greatestOpportunity: "Detection",
      },
      {
        locationName: "Location 2",
        overallErs: 85,
        detection: 86,
        averageRecovery: 84,
        repairDrag: 83,
        repairDurability: 82,
        greatestOpportunity: "Repair Drag",
      },
      {
        locationName: "Location 3",
        overallErs: 84.9,
        detection: 85,
        averageRecovery: 84,
        repairDrag: 83,
        repairDurability: 82,
        greatestOpportunity: "Average Recovery",
      },
      {
        locationName: "Location 4",
        overallErs: 70,
        detection: 71,
        averageRecovery: 70,
        repairDrag: 69,
        repairDurability: 68,
        greatestOpportunity: "Repair Durability",
      },
      {
        locationName: "Location 5",
        overallErs: 55,
        detection: 56,
        averageRecovery: 55,
        repairDrag: 54,
        repairDurability: 53,
        greatestOpportunity: "Detection",
      },
      {
        locationName: "Location 6",
        overallErs: 54.9,
        detection: 55,
        averageRecovery: 54,
        repairDrag: 53,
        repairDurability: 52,
        greatestOpportunity: "Repair Drag",
      },
    ];

    const summary = summarizeEnterpriseLocations(locations);

    expect(summary.organizationErs).toBe(73.7);
    expect(summary.totalLocations).toBe(6);
    expect(summary.strongLocations).toBe(2);
    expect(summary.stableLocations).toBe(2);
    expect(summary.atRiskLocations).toBe(1);
    expect(summary.criticalLocations).toBe(1);
  });

  test("orders locations from highest ERS to lowest", () => {
    const locationInputs = createLocationInputs();
    locationInputs["Location 1"] = {
      ...defaultScenarioInput,
      workOrdersStarted: 30,
      preventiveMaintenanceTouches: 250,
      averageDaysToClose: 6,
      olderThan15Days: 3,
      olderThan30Days: 1,
      olderThan45Days: 0,
      assetsWith3PlusRepairs: 2,
    };
    locationInputs["Location 2"] = {
      ...defaultScenarioInput,
      workOrdersStarted: 1,
      preventiveMaintenanceTouches: 30,
      averageDaysToClose: 38,
      olderThan15Days: 55,
      olderThan30Days: 38,
      olderThan45Days: 26,
      assetsWith3PlusRepairs: 40,
    };

    const viewModel = createEnterpriseDashboardViewModel(ERS_LOCATIONS, locationInputs);
    const rankedScores = viewModel.locations.map((location) => location.overallErs);

    expect(viewModel.summary.totalLocations).toBe(6);
    expect(viewModel.locations[0]).toMatchObject({
      detection: expect.any(Number),
      averageRecovery: expect.any(Number),
      repairDrag: expect.any(Number),
      repairDurability: expect.any(Number),
      greatestOpportunity: expect.any(String),
    });

    for (let index = 1; index < rankedScores.length; index += 1) {
      expect(rankedScores[index - 1]).toBeGreaterThanOrEqual(rankedScores[index]);
    }
  });
});
