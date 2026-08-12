"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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
  return {
    "Location 1": { ...defaultScenarioInput },
    "Location 2": {
      totalMonitoredAssets: 165,
      workOrdersStarted: 18,
      preventiveMaintenanceTouches: 150,
      memberReportingAvailable: false,
      averageDaysToClose: 28,
      completedEquipmentWorkOrders: 31,
      totalOpenEquipmentWorkOrders: 112,
      olderThan15Days: 26,
      olderThan30Days: 14,
      olderThan45Days: 6,
      assetsWith3PlusRepairs: 18,
    },
    "Location 3": {
      totalMonitoredAssets: 140,
      workOrdersStarted: 7,
      preventiveMaintenanceTouches: 220,
      memberReportingAvailable: true,
      averageDaysToClose: 12,
      completedEquipmentWorkOrders: 44,
      totalOpenEquipmentWorkOrders: 64,
      olderThan15Days: 9,
      olderThan30Days: 4,
      olderThan45Days: 1,
      assetsWith3PlusRepairs: 6,
    },
    "Location 4": {
      totalMonitoredAssets: 180,
      workOrdersStarted: 24,
      preventiveMaintenanceTouches: 130,
      memberReportingAvailable: false,
      averageDaysToClose: 34,
      completedEquipmentWorkOrders: 22,
      totalOpenEquipmentWorkOrders: 140,
      olderThan15Days: 40,
      olderThan30Days: 22,
      olderThan45Days: 11,
      assetsWith3PlusRepairs: 27,
    },
    "Location 5": {
      totalMonitoredAssets: 155,
      workOrdersStarted: 11,
      preventiveMaintenanceTouches: 175,
      memberReportingAvailable: true,
      averageDaysToClose: 18,
      completedEquipmentWorkOrders: 36,
      totalOpenEquipmentWorkOrders: 88,
      olderThan15Days: 12,
      olderThan30Days: 6,
      olderThan45Days: 2,
      assetsWith3PlusRepairs: 12,
    },
    "Location 6": {
      totalMonitoredAssets: 170,
      workOrdersStarted: 15,
      preventiveMaintenanceTouches: 160,
      memberReportingAvailable: false,
      averageDaysToClose: 25,
      completedEquipmentWorkOrders: 28,
      totalOpenEquipmentWorkOrders: 97,
      olderThan15Days: 20,
      olderThan30Days: 11,
      olderThan45Days: 5,
      assetsWith3PlusRepairs: 16,
    },
  };
}

function buildDefaultScenarioState(): PersistedScenarioState {
  // Always start with defaults so server HTML and client initial render match (no hydration mismatch).
  // sessionStorage is applied after mount via useEffect in ScenarioStoreProvider.
  return {
    selectedLocation: "Location 1",
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
