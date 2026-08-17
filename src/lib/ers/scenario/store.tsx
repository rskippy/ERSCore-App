"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ERSSignalBundle } from "@/lib/ers/signalBundle";
import type { ScenarioInput } from "./types";
import { DEFAULT_LOCATION_DATASET, defaultScenarioInput } from "./defaults";
import { createScenarioSignalBundle } from "./selectors";
import { toErsInput } from "./adapter";
import { validateScenarioPatch } from "./validation";

export const ERS_LOCATIONS: readonly string[] = DEFAULT_LOCATION_DATASET.map((location) => location.name);

export type ScenarioLocation = string;

type PersistedScenarioState = {
  selectedLocation: string;
  locations: readonly string[];
  locationScenarioInputs: Record<string, ScenarioInput>;
};

// sessionStorage key for imported test-location dataset
const IMPORT_SESSION_KEY = "ers_imported_locations";

type ImportedSnapshot = {
  selectedLocation: string;
  locations: string[];
  locationScenarioInputs: Record<string, ScenarioInput>;
};

function readImportedSnapshot(): ImportedSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(IMPORT_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ImportedSnapshot;
  } catch {
    return null;
  }
}

function writeImportedSnapshot(state: PersistedScenarioState): void {
  if (typeof window === "undefined") return;
  try {
    const snapshot: ImportedSnapshot = {
      selectedLocation: state.selectedLocation,
      locations: [...state.locations],
      locationScenarioInputs: state.locationScenarioInputs,
    };
    sessionStorage.setItem(IMPORT_SESSION_KEY, JSON.stringify(snapshot));
  } catch {
    // sessionStorage unavailable in some privacy modes
  }
}

function buildDefaultLocationScenarioInputs(): Record<string, ScenarioInput> {
  return Object.fromEntries(
    DEFAULT_LOCATION_DATASET.map((location) => [location.name, { ...location.input }]),
  );
}

function buildDefaultScenarioState(): PersistedScenarioState {
  // Always start with defaults so server HTML and client initial render match (no hydration mismatch).
  // sessionStorage is applied after mount via useEffect in ScenarioStoreProvider.
  return {
    selectedLocation: DEFAULT_LOCATION_DATASET[0].name,
    locations: ERS_LOCATIONS,
    locationScenarioInputs: buildDefaultLocationScenarioInputs(),
  };
}

let persistedScenarioState: PersistedScenarioState = buildDefaultScenarioState();

type ScenarioStoreValue = {
  selectedLocation: string;
  locations: readonly string[];
  locationScenarioInputs: Record<string, ScenarioInput>;
  setSelectedLocation: (location: string) => void;
  scenarioInput: ScenarioInput;
  updateScenarioInput: (patch: Partial<ScenarioInput>) => { accepted: boolean; error?: string };
  resetScenarioInput: () => void;
  ersSignalBundle: ERSSignalBundle;
  importLocations: (imported: Array<{ name: string; input: ScenarioInput }>) => void;
};

const ScenarioStoreContext = createContext<ScenarioStoreValue | undefined>(undefined);

export function ScenarioStoreProvider({ children }: { children: ReactNode }) {
  const [scenarioState, setScenarioState] = useState<PersistedScenarioState>(persistedScenarioState);

  const scenarioInput = scenarioState.locationScenarioInputs[scenarioState.selectedLocation] ?? defaultScenarioInput;

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

  function importLocations(imported: Array<{ name: string; input: ScenarioInput }>) {
    const names = imported.map((l) => l.name);
    const inputs = Object.fromEntries(imported.map((l) => [l.name, l.input]));
    const next: PersistedScenarioState = {
      selectedLocation: names[0],
      locations: names,
      locationScenarioInputs: inputs,
    };
    // Write outside the React updater to avoid StrictMode double-invoke side effects
    persistedScenarioState = next;
    writeImportedSnapshot(next);
    setScenarioState(next);
  }

  // After hydration, restore any previously imported dataset from sessionStorage.
  useEffect(() => {
    const saved = readImportedSnapshot();
    if (saved?.selectedLocation && saved.locations?.length > 0 && saved.locationScenarioInputs) {
      const next: PersistedScenarioState = {
        selectedLocation: saved.selectedLocation,
        locations: saved.locations,
        locationScenarioInputs: saved.locationScenarioInputs,
      };
      persistedScenarioState = next;
      setScenarioState(next);
    }
  }, []);

  const ersSignalBundle = useMemo(() => createScenarioSignalBundle(scenarioInput), [scenarioInput]);

  const value = useMemo(
    () => ({
      selectedLocation: scenarioState.selectedLocation,
      locations: scenarioState.locations,
      locationScenarioInputs: scenarioState.locationScenarioInputs,
      setSelectedLocation,
      scenarioInput,
      updateScenarioInput,
      resetScenarioInput,
      ersSignalBundle,
      importLocations,
    }),
    [ersSignalBundle, scenarioInput, scenarioState.locationScenarioInputs, scenarioState.locations, scenarioState.selectedLocation],
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
