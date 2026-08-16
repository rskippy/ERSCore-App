"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { DemoRole, DemoScopeState } from "./types";

// Temporary role entry source. Replace with authenticated FitnessEMS user and location scope in production.

/**
 * For local testing only, assigns location scope based on selected role.
 * Regional: all currently loaded locations
 * Manager: first location only
 */
function getVisibleLocations(
  allLocations: readonly string[],
  role: DemoRole,
): string[] {
  if (allLocations.length === 0) return [];

  switch (role) {
    case "Regional":
      // All imported locations belong to the Regional user for local demo purposes.
      // Replace with authenticated FitnessEMS/API user-location scope in production.
      return [...allLocations];

    case "Manager":
      // Single location only
      return [allLocations[0]];

    default:
      return [...allLocations];
  }
}

const DemoScopeContext = createContext<DemoScopeState | undefined>(undefined);

export function DemoScopeProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<DemoRole>("Regional");

  const value: DemoScopeState = {
    role,
    setRole,
    getVisibleLocations: (allLocations) => getVisibleLocations(allLocations, role),
  };

  return <DemoScopeContext.Provider value={value}>{children}</DemoScopeContext.Provider>;
}

export function useDemoScope(): DemoScopeState {
  const context = useContext(DemoScopeContext);
  if (!context) {
    throw new Error("useDemoScope must be used within DemoScopeProvider");
  }
  return context;
}
