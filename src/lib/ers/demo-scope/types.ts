// Temporary role entry source. Replace with authenticated FitnessEMS user and location scope in production.

export type DemoRole = "Regional" | "Manager";

export interface DemoScopeState {
  role: DemoRole;
  setRole: (role: DemoRole) => void;
  getVisibleLocations: (allLocations: readonly string[]) => string[];
}
