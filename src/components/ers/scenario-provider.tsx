"use client";

import type { ReactNode } from "react";
import { ScenarioStoreProvider } from "@/lib/ers/scenario/store";

export function ScenarioProvider({ children }: { children: ReactNode }) {
  return <ScenarioStoreProvider>{children}</ScenarioStoreProvider>;
}
