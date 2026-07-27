"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ERSSignalBundle } from "@/lib/ers/signalBundle";
import type { ScenarioInput } from "./types";
import { defaultScenarioInput } from "./defaults";
import { createScenarioSignalBundle } from "./selectors";
import { toErsInput } from "./adapter";
import { validateScenarioPatch } from "./validation";

type ScenarioStoreValue = {
  scenarioInput: ScenarioInput;
  updateScenarioInput: (patch: Partial<ScenarioInput>) => { accepted: boolean; error?: string };
  resetScenarioInput: () => void;
  ersSignalBundle: ERSSignalBundle;
};

const ScenarioStoreContext = createContext<ScenarioStoreValue | undefined>(undefined);

export function ScenarioStoreProvider({ children }: { children: ReactNode }) {
  const [scenarioInput, setScenarioInput] = useState<ScenarioInput>(defaultScenarioInput);

  function updateScenarioInput(patch: Partial<ScenarioInput>) {
    const validation = validateScenarioPatch(scenarioInput, patch);

    if (!validation.isValid) {
      return {
        accepted: false,
        error: validation.error,
      };
    }

    setScenarioInput((current) => ({
      ...current,
      ...patch,
    }));

    return {
      accepted: true,
    };
  }

  function resetScenarioInput() {
    setScenarioInput(defaultScenarioInput);
  }

  const ersSignalBundle = useMemo(() => createScenarioSignalBundle(scenarioInput), [scenarioInput]);

  const value = useMemo(
    () => ({
      scenarioInput,
      updateScenarioInput,
      resetScenarioInput,
      ersSignalBundle,
    }),
    [ersSignalBundle, scenarioInput],
  );

  return <ScenarioStoreContext.Provider value={value}>{children}</ScenarioStoreContext.Provider>;
}

export function useScenarioStore(): ScenarioStoreValue {
  const context = useContext(ScenarioStoreContext);

  if (!context) {
    throw new Error("useScenarioStore must be used within ScenarioStoreProvider");
  }

  return context;
}

export function getDefaultErsInput() {
  return toErsInput(defaultScenarioInput);
}
