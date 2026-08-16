import { describe, expect, test } from "vitest";
import { computeOrgScoreDrag } from "./data";

// ---------------------------------------------------------------------------
// computeOrgScoreDrag — controlled signal-drag tests
// ---------------------------------------------------------------------------

describe("computeOrgScoreDrag — primary signal eligibility", () => {
  test("Detection can be primary drag", () => {
    // Detection (30% weight) dominates with a very low score
    const result = computeOrgScoreDrag({
      detection: 20,       // (100-20)×0.30 = 24.0 pts  ← largest
      averageRecovery: 90, // (100-90)×0.30 = 3.0 pts
      repairDrag: 90,      // (100-90)×0.20 = 2.0 pts
      repairDurability: 90,// (100-90)×0.20 = 2.0 pts
    });
    expect(result.primarySignal).toBe("Detection");
    expect(result.signals[0].name).toBe("Detection");
    expect(result.signals[0].weightedLoss).toBeGreaterThan(result.signals[1].weightedLoss);
  });

  test("Average Recovery can be primary drag", () => {
    const result = computeOrgScoreDrag({
      detection: 90,
      averageRecovery: 20, // (100-20)×0.30 = 24.0 pts ← largest
      repairDrag: 90,
      repairDurability: 90,
    });
    expect(result.primarySignal).toBe("Average Recovery");
    expect(result.signals[0].name).toBe("Average Recovery");
  });

  test("Repair Drag can be primary drag", () => {
    // Repair Drag (20% weight) wins with a critically low score
    const result = computeOrgScoreDrag({
      detection: 85,       // (100-85)×0.30 = 4.5 pts
      averageRecovery: 85, // (100-85)×0.30 = 4.5 pts
      repairDrag: 10,      // (100-10)×0.20 = 18.0 pts ← largest
      repairDurability: 90,// (100-90)×0.20 = 2.0 pts
    });
    expect(result.primarySignal).toBe("Repair Drag");
    expect(result.signals[0].name).toBe("Repair Drag");
    expect(result.signals[0].weightedLoss).toBe(18);
  });

  test("Repair Durability can be primary drag", () => {
    // Repair Durability (20% weight) wins when score is critically low
    const result = computeOrgScoreDrag({
      detection: 85,        // (100-85)×0.30 = 4.5 pts
      averageRecovery: 85,  // (100-85)×0.30 = 4.5 pts
      repairDrag: 85,       // (100-85)×0.20 = 3.0 pts
      repairDurability: 10, // (100-10)×0.20 = 18.0 pts ← largest
    });
    expect(result.primarySignal).toBe("Repair Durability");
    expect(result.signals[0].name).toBe("Repair Durability");
    expect(result.signals[0].weightedLoss).toBe(18);
  });
});

describe("computeOrgScoreDrag — narrative classification", () => {
  test("one weak signal produces single-signal drag narrative", () => {
    const result = computeOrgScoreDrag({
      detection: 45,       // At Risk — weak (score < 70)
      averageRecovery: 80, // Strong
      repairDrag: 82,      // Strong
      repairDurability: 88,// Strong
    });
    expect(result.primarySignal).toBe("Detection");
    expect(result.headline).toBe("Detection");
    expect(result.detail).toContain("primary drag");
    expect(result.detail).toContain("Detection");
  });

  test("two weak signals produces dual-pressure narrative", () => {
    const result = computeOrgScoreDrag({
      detection: 55,       // At Risk — weak
      averageRecovery: 62, // Needs Improvement — weak
      repairDrag: 85,      // Strong
      repairDurability: 90,// Exceptional
    });
    expect(result.signals.filter((s) => s.orgAvgScore < 70)).toHaveLength(2);
    // headline names both weak signals
    expect(result.headline).toContain("&");
    expect(result.detail).toContain("and");
  });

  test("three or more weak signals produces broad-based pressure narrative", () => {
    const result = computeOrgScoreDrag({
      detection: 55,       // At Risk — weak
      averageRecovery: 55, // At Risk — weak
      repairDrag: 50,      // At Risk — weak
      repairDurability: 75,// Acceptable — not weak
    });
    expect(result.signals.filter((s) => s.orgAvgScore < 70)).toHaveLength(3);
    expect(result.headline).toBe("Broad-Based Pressure");
    expect(result.detail).toContain("broad-based");
  });

  test("all four signals At Risk or worse produces broad-based pressure", () => {
    const result = computeOrgScoreDrag({
      detection: 55,
      averageRecovery: 50,
      repairDrag: 45,
      repairDurability: 60,
    });
    expect(result.signals.filter((s) => s.orgAvgScore < 70)).toHaveLength(4);
    expect(result.headline).toBe("Broad-Based Pressure");
  });

  test("all four signals Strong or Exceptional produces positive framing", () => {
    const result = computeOrgScoreDrag({
      detection: 88,
      averageRecovery: 85,
      repairDrag: 82,
      repairDurability: 90,
    });
    expect(result.signals.every((s) => s.orgAvgScore >= 80)).toBe(true);
    expect(result.detail).toContain("broadly strong");
    expect(result.detail).not.toContain("drag on regional readiness");
  });

  test("Acceptable signals are not described as Strong or broadly strong", () => {
    const result = computeOrgScoreDrag({
      detection: 75,        // Acceptable
      averageRecovery: 72,  // Acceptable
      repairDrag: 78,       // Acceptable
      repairDurability: 71, // Acceptable
    });
    // Not all ≥ 80 → no "broadly strong" framing
    expect(result.detail).not.toContain("broadly strong");
    // No weak signals → acceptable-level framing
    expect(result.signals.filter((s) => s.orgAvgScore < 70)).toHaveLength(0);
    // orgAvgStatus values should be "Acceptable", not "Strong"
    const statuses = result.signals.map((s) => s.orgAvgStatus);
    expect(statuses.every((st) => st === "Acceptable")).toBe(true);
  });
});

describe("computeOrgScoreDrag — signal ordering and math", () => {
  test("signals are sorted by weighted loss descending", () => {
    const result = computeOrgScoreDrag({
      detection: 70,
      averageRecovery: 80,
      repairDrag: 40,
      repairDurability: 90,
    });
    for (let i = 1; i < result.signals.length; i++) {
      expect(result.signals[i - 1].weightedLoss).toBeGreaterThanOrEqual(
        result.signals[i].weightedLoss,
      );
    }
  });

  test("weighted loss formula is (100 - avgScore) × weight", () => {
    const result = computeOrgScoreDrag({
      detection: 60,        // (100-60)×0.30 = 12.0
      averageRecovery: 100, // (100-100)×0.30 = 0
      repairDrag: 100,      // 0
      repairDurability: 100,// 0
    });
    const detection = result.signals.find((s) => s.name === "Detection")!;
    expect(detection.weightedLoss).toBe(12);
    expect(detection.orgAvgScore).toBe(60);
  });

  test("orgAvgStatus uses driver-level vocabulary (Acceptable not Stable)", () => {
    const result = computeOrgScoreDrag({
      detection: 75,        // 70–79 range → Acceptable
      averageRecovery: 85,  // Strong
      repairDrag: 92,       // Exceptional
      repairDurability: 55, // At Risk
    });
    const d = result.signals.find((s) => s.name === "Detection")!;
    const ar = result.signals.find((s) => s.name === "Average Recovery")!;
    const rd = result.signals.find((s) => s.name === "Repair Drag")!;
    const rdur = result.signals.find((s) => s.name === "Repair Durability")!;

    expect(d.orgAvgStatus).toBe("Acceptable");
    expect(ar.orgAvgStatus).toBe("Strong");
    expect(rd.orgAvgStatus).toBe("Exceptional");
    expect(rdur.orgAvgStatus).toBe("At Risk");
    // "Stable" must never appear in org-level signal status
    expect(result.signals.map((s) => s.orgAvgStatus)).not.toContain("Stable");
  });

  test("very close scores resolve without error", () => {
    const result = computeOrgScoreDrag({
      detection: 70.1,
      averageRecovery: 70.0,
      repairDrag: 70.2,
      repairDurability: 70.3,
    });
    expect(result.signals).toHaveLength(4);
    expect(result.primarySignal).toBeDefined();
  });

  test("one extreme outlier is clearly identified as primary", () => {
    const result = computeOrgScoreDrag({
      detection: 5,        // (100-5)×0.30 = 28.5 pts
      averageRecovery: 90,
      repairDrag: 90,
      repairDurability: 90,
    });
    expect(result.primarySignal).toBe("Detection");
    expect(result.signals[0].weightedLoss).toBe(28.5);
  });
});

describe("computeOrgScoreDrag — Greatest Opportunity vs Primary Drag can differ", () => {
  test("primary drag is Repair Drag while breadth-based opportunity could be Average Recovery", () => {
    // Represents: most locations have Average Recovery as their greatest opportunity (breadth),
    // but Repair Drag is severely depressed org-wide (causing greatest weighted ERS loss)
    const result = computeOrgScoreDrag({
      detection: 75,        // Acceptable — (100-75)×0.30 = 7.5 pts
      averageRecovery: 72,  // Acceptable — (100-72)×0.30 = 8.4 pts
      repairDrag: 35,       // At Risk    — (100-35)×0.20 = 13.0 pts ← primary drag
      repairDurability: 85, // Strong     — (100-85)×0.20 = 3.0 pts
    });

    expect(result.primarySignal).toBe("Repair Drag");
    // Average Recovery is second by weighted loss, not the primary drag
    expect(result.signals[0].name).toBe("Repair Drag");
    expect(result.signals[1].name).toBe("Average Recovery");
    // This demonstrates: breadth-based opportunity (Average Recovery) ≠ primary drag (Repair Drag)
  });
});
