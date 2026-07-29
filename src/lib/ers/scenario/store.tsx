"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ERSSignalBundle } from "@/lib/ers/signalBundle";
import type { ScenarioInput } from "./types";
import { defaultScenarioInput } from "./defaults";
import { createScenarioSignalBundle } from "./selectors";
import { toErsInput } from "./adapter";
import { validateScenarioPatch } from "./validation";

export const ERS_LOCATIONS = [
  "Location 1",
  "Location 2",
  "Location 3",
  "Location 4",
  "Location 5",
  "Location 6",
] as const;

export type ScenarioLocation = (typeof ERS_LOCATIONS)[number];

type ScenarioInputsByLocation = Record<ScenarioLocation, ScenarioInput>;

type PersistedScenarioState = {
  selectedLocation: ScenarioLocation;
  locationScenarioInputs: ScenarioInputsByLocation;
};

function buildDefaultLocationScenarioInputs(): ScenarioInputsByLocation {
  return {
    "Location 1": { ...defaultScenarioInput },
    "Location 2": { ...defaultScenarioInput },
    "Location 3": { ...defaultScenarioInput },
    "Location 4": { ...defaultScenarioInput },
    "Location 5": { ...defaultScenarioInput },
    "Location 6": { ...defaultScenarioInput },
  };
}

function buildDefaultScenarioState(): PersistedScenarioState {
  return {
    selectedLocation: "Location 1",
    locationScenarioInputs: buildDefaultLocationScenarioInputs(),
  };
}

let persistedScenarioState: PersistedScenarioState = buildDefaultScenarioState();

type ScenarioStoreValue = {
  selectedLocation: ScenarioLocation;
  locations: readonly ScenarioLocation[];
  locationScenarioInputs: ScenarioInputsByLocation;
  setSelectedLocation: (location: ScenarioLocation) => void;
  scenarioInput: ScenarioInput;
  updateScenarioInput: (patch: Partial<ScenarioInput>) => { accepted: boolean; error?: string };
  resetScenarioInput: () => void;
  ersSignalBundle: ERSSignalBundle;
};

const ScenarioStoreContext = createContext<ScenarioStoreValue | undefined>(undefined);

export function ScenarioStoreProvider({ children }: { children: ReactNode }) {
  const [scenarioState, setScenarioState] = useState<PersistedScenarioState>(persistedScenarioState);

  const scenarioInput = scenarioState.locationScenarioInputs[scenarioState.selectedLocation];

  function setSelectedLocation(location: ScenarioLocation) {
    setScenarioState((current) => {
      const next = {
        ...current,
        selectedLocation: location,
      };

      persistedScenarioState = next;

      return next;
    });
  }

  function updateScenarioInput(patch: Partial<ScenarioInput>) {
    const currentScenarioInput = scenarioState.locationScenarioInputs[scenarioState.selectedLocation];
    const validation = validateScenarioPatch(currentScenarioInput, patch);

    if (!validation.isValid) {
      return {
        accepted: false,
        error: validation.error,
      };
    }

    setScenarioState((current) => {
      const selectedLocation = current.selectedLocation;
      const currentInput = current.locationScenarioInputs[selectedLocation];
      const next = {
        ...currentInput,
        ...patch,
      };

      const nextState = {
        ...current,
        locationScenarioInputs: {
          ...current.locationScenarioInputs,
          [selectedLocation]: next,
        },
      };

      persistedScenarioState = nextState;

      return nextState;
    });

    return {
      accepted: true,
    };
  }

  function resetScenarioInput() {
    setScenarioState((current) => {
      const selectedLocation = current.selectedLocation;
      const nextState = {
        ...current,
        locationScenarioInputs: {
          ...current.locationScenarioInputs,
          [selectedLocation]: { ...defaultScenarioInput },
        },
      };

      persistedScenarioState = nextState;

      return nextState;
    });
  }

  const ersSignalBundle = useMemo(() => createScenarioSignalBundle(scenarioInput), [scenarioInput]);

  const value = useMemo(
    () => ({
      selectedLocation: scenarioState.selectedLocation,
      locations: ERS_LOCATIONS,
      locationScenarioInputs: scenarioState.locationScenarioInputs,
      setSelectedLocation,
      scenarioInput,
      updateScenarioInput,
      resetScenarioInput,
      ersSignalBundle,
    }),
    [ersSignalBundle, scenarioInput, scenarioState.locationScenarioInputs, scenarioState.selectedLocation],
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

export function resetScenarioStoreForTests() {
  persistedScenarioState = buildDefaultScenarioState();
}
