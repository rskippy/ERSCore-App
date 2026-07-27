import { calculateERS } from "./scoreEngine";
import { getReadinessStatus } from "./readinessStatus";
import type { ERSInput } from "./types";

export type ProvenanceSource =
  | "ERSInput"
  | "ERSResult"
  | "ReadinessStatus"
  | "DerivedFromERSResult";

export type FieldProvenance = {
  source: ProvenanceSource;
  path: string;
  detail?: string;
};

export type SignalSnapshot = {
  score: number;
  status: string;
  trend: string;
  estimatedErsImpact: string;
  provenance: {
    score: FieldProvenance;
    status: FieldProvenance;
    trend: FieldProvenance;
    estimatedErsImpact: FieldProvenance;
  };
};

export type AverageRecoverySupportingMetrics = {
  averageDaysToClose: number;
  completedEquipmentWorkOrders: number;
};

export type AverageRecoveryNarrativeInputs = {
  signalName: string;
  score: number;
  status: string;
  trend: string;
  averageDaysToClose: number;
  completedEquipmentWorkOrders: number;
};

export type AverageRecoverySignalBundle = SignalSnapshot & {
  supportingMetrics: AverageRecoverySupportingMetrics;
  narrativeInputs: AverageRecoveryNarrativeInputs;
  supportingMetricsProvenance: {
    averageDaysToClose: FieldProvenance;
    completedEquipmentWorkOrders: FieldProvenance;
  };
};

export type ERSSignalBundle = {
  reportingContext: {
    organizationLabel: string;
    reportingPeriod: string;
    lastUpdated: string;
  };
  input: ERSInput;
  signals: {
    detection: SignalSnapshot;
    averageRecovery: AverageRecoverySignalBundle;
    repairDrag: SignalSnapshot;
    repairDurability: SignalSnapshot;
  };
};

type BundleOptions = {
  organizationLabel: string;
  reportingPeriod: string;
  lastUpdated: string;
  trends?: {
    detection?: string;
    averageRecovery?: string;
    repairDrag?: string;
    repairDurability?: string;
  };
};

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function formatPoints(value: number): string {
  const rounded = roundToOneDecimal(value);
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  const unit = rounded === 1 ? "point" : "points";

  return `+${text} ${unit}`;
}

export function buildERSSignalBundle(input: ERSInput, options: BundleOptions): ERSSignalBundle {
  const ersResult = calculateERS(input);

  const signalWeights = {
    detection: 0.3,
    averageRecovery: 0.3,
    repairDrag: 0.2,
    repairDurability: 0.2,
  };

  const potentialDetectionGain = (100 - ersResult.detectionScore) * signalWeights.detection;
  const potentialAverageRecoveryGain =
    (100 - ersResult.averageRecoveryScore) * signalWeights.averageRecovery;
  const potentialRepairDragGain = (100 - ersResult.repairDragScore) * signalWeights.repairDrag;
  const potentialRepairDurabilityGain =
    (100 - ersResult.repairDurabilityScore) * signalWeights.repairDurability;

  const detectionStatus = getReadinessStatus(ersResult.detectionScore);
  const averageRecoveryStatus = getReadinessStatus(ersResult.averageRecoveryScore);
  const repairDragStatus = getReadinessStatus(ersResult.repairDragScore);
  const repairDurabilityStatus = getReadinessStatus(ersResult.repairDurabilityScore);

  return {
    reportingContext: {
      organizationLabel: options.organizationLabel,
      reportingPeriod: options.reportingPeriod,
      lastUpdated: options.lastUpdated,
    },
    input,
    signals: {
      detection: {
        score: ersResult.detectionScore,
        status: detectionStatus,
        trend: options.trends?.detection ?? "Improving",
        estimatedErsImpact: formatPoints(potentialDetectionGain),
        provenance: {
          score: {
            source: "ERSResult",
            path: "ersResult.detectionScore",
          },
          status: {
            source: "ReadinessStatus",
            path: "getReadinessStatus(ersResult.detectionScore)",
          },
          trend: {
            source: "DerivedFromERSResult",
            path: "options.trends.detection",
            detail: "Configured signal trend for dashboard parity",
          },
          estimatedErsImpact: {
            source: "DerivedFromERSResult",
            path: "(100 - ersResult.detectionScore) * 0.3",
          },
        },
      },
      averageRecovery: {
        score: ersResult.averageRecoveryScore,
        status: averageRecoveryStatus,
        trend: options.trends?.averageRecovery ?? "Stable",
        estimatedErsImpact: formatPoints(potentialAverageRecoveryGain),
        supportingMetrics: {
          averageDaysToClose: input.averageRecoveryDays,
          completedEquipmentWorkOrders: input.completedRepairWorkOrders90Days,
        },
        narrativeInputs: {
          signalName: "Average Recovery",
          score: ersResult.averageRecoveryScore,
          status: averageRecoveryStatus,
          trend: options.trends?.averageRecovery ?? "Stable",
          averageDaysToClose: input.averageRecoveryDays,
          completedEquipmentWorkOrders: input.completedRepairWorkOrders90Days,
        },
        provenance: {
          score: {
            source: "ERSResult",
            path: "ersResult.averageRecoveryScore",
          },
          status: {
            source: "ReadinessStatus",
            path: "getReadinessStatus(ersResult.averageRecoveryScore)",
          },
          trend: {
            source: "DerivedFromERSResult",
            path: "options.trends.averageRecovery",
            detail: "Configured signal trend for dashboard parity",
          },
          estimatedErsImpact: {
            source: "DerivedFromERSResult",
            path: "(100 - ersResult.averageRecoveryScore) * 0.3",
          },
        },
        supportingMetricsProvenance: {
          averageDaysToClose: {
            source: "ERSInput",
            path: "input.averageRecoveryDays",
          },
          completedEquipmentWorkOrders: {
            source: "ERSInput",
            path: "input.completedRepairWorkOrders90Days",
          },
        },
      },
      repairDrag: {
        score: ersResult.repairDragScore,
        status: repairDragStatus,
        trend: options.trends?.repairDrag ?? "Declining",
        estimatedErsImpact: formatPoints(potentialRepairDragGain),
        provenance: {
          score: {
            source: "ERSResult",
            path: "ersResult.repairDragScore",
          },
          status: {
            source: "ReadinessStatus",
            path: "getReadinessStatus(ersResult.repairDragScore)",
          },
          trend: {
            source: "DerivedFromERSResult",
            path: "options.trends.repairDrag",
            detail: "Configured signal trend for dashboard parity",
          },
          estimatedErsImpact: {
            source: "DerivedFromERSResult",
            path: "(100 - ersResult.repairDragScore) * 0.2",
          },
        },
      },
      repairDurability: {
        score: ersResult.repairDurabilityScore,
        status: repairDurabilityStatus,
        trend: options.trends?.repairDurability ?? "Stable",
        estimatedErsImpact: formatPoints(potentialRepairDurabilityGain),
        provenance: {
          score: {
            source: "ERSResult",
            path: "ersResult.repairDurabilityScore",
          },
          status: {
            source: "ReadinessStatus",
            path: "getReadinessStatus(ersResult.repairDurabilityScore)",
          },
          trend: {
            source: "DerivedFromERSResult",
            path: "options.trends.repairDurability",
            detail: "Configured signal trend for dashboard parity",
          },
          estimatedErsImpact: {
            source: "DerivedFromERSResult",
            path: "(100 - ersResult.repairDurabilityScore) * 0.2",
          },
        },
      },
    },
  };
}
