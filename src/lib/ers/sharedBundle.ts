import { defaultScenarioInput } from "./scenario/defaults";
import { toErsInput } from "./scenario/adapter";
import { createScenarioSignalBundle } from "./scenario/selectors";

// Static fallback bundle used by tests and non-provider call sites.
export const ersEngineInput = toErsInput(defaultScenarioInput);

export const ersSignalBundle = createScenarioSignalBundle(defaultScenarioInput);
