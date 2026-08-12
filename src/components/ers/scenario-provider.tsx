"use client";

import type { ReactNode } from "react";
import { DemoScopeProvider } from "@/lib/ers/demo-scope/store";
import { ScenarioStoreProvider } from "@/lib/ers/scenario/store";

export function ScenarioProvider({ children }: { children: ReactNode }) {
  return (
    <DemoScopeProvider>
      <ScenarioStoreProvider>{children}</ScenarioStoreProvider>
    </DemoScopeProvider>
  );
}
