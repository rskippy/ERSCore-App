import { buildERSSignalBundle, type ERSSignalBundle } from "@/lib/ers/signalBundle";
import { getLastUpdatedLabel } from "@/lib/ers/reportingDate";
import type { ScenarioInput } from "./types";
import { toErsInput } from "./adapter";

export function createScenarioSignalBundle(scenarioInput: ScenarioInput): ERSSignalBundle {
  return buildERSSignalBundle(toErsInput(scenarioInput), {
    organizationLabel: "",
    reportingPeriod: "Last 90 Days",
    lastUpdated: getLastUpdatedLabel(),
    trends: {
      detection: "Improving",
      averageRecovery: "Stable",
      repairDrag: "Declining",
      repairDurability: "Stable",
    },
  });
}
