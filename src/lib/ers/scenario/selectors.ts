import { buildERSSignalBundle, type ERSSignalBundle } from "@/lib/ers/signalBundle";
import type { ScenarioInput } from "./types";
import { toErsInput } from "./adapter";

export function createScenarioSignalBundle(scenarioInput: ScenarioInput): ERSSignalBundle {
  return buildERSSignalBundle(toErsInput(scenarioInput), {
    organizationLabel: "All Locations",
    reportingPeriod: "Last 90 Days",
    lastUpdated: "08:30 ET · 23 Jul 2026",
    trends: {
      detection: "Improving",
      averageRecovery: "Stable",
      repairDrag: "Declining",
      repairDurability: "Stable",
    },
  });
}
