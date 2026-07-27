import { describe, expect, test } from "vitest";
import { createAverageRecoveryAnalysisViewModel } from "./analysisViewModel";
import { ersSignalBundle } from "@/lib/ers/sharedBundle";

describe("Average Recovery analysis bindings", () => {
  test("score, status, trend, average days, and completed work orders match shared bundle", () => {
    const signal = ersSignalBundle.signals.averageRecovery;
    const viewModel = createAverageRecoveryAnalysisViewModel(
      signal,
      ersSignalBundle.reportingContext.reportingPeriod,
    );

    expect(viewModel.currentScore).toBe(signal.score);
    expect(viewModel.status).toBe(signal.status);
    expect(viewModel.trend).toBe(signal.trend);
    expect(viewModel.averageDaysToClose).toBe(String(signal.supportingMetrics.averageDaysToClose));
    expect(viewModel.completedEquipmentWorkOrders).toBe(
      String(signal.supportingMetrics.completedEquipmentWorkOrders),
    );
  });

  test("executive summary is built only from bundle narrative inputs", () => {
    const signal = ersSignalBundle.signals.averageRecovery;
    const viewModel = createAverageRecoveryAnalysisViewModel(
      signal,
      ersSignalBundle.reportingContext.reportingPeriod,
    );

    expect(viewModel.executiveSummary).toContain(signal.narrativeInputs.status.toLowerCase());
    expect(viewModel.executiveSummary).toContain(
      String(signal.narrativeInputs.averageDaysToClose),
    );
    expect(viewModel.executiveSummary).toContain(
      String(signal.narrativeInputs.completedEquipmentWorkOrders),
    );
    expect(viewModel.executiveSummary).toContain(
      ersSignalBundle.reportingContext.reportingPeriod.toLowerCase(),
    );
  });
});
