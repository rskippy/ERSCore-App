// @vitest-environment jsdom

import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ScenarioStoreProvider, resetScenarioStoreForTests } from "@/lib/ers/scenario/store";
import EnterpriseDashboardPage from "../enterprise/page";
import ScenarioBuilderPage from "./page";

const pushSpy = vi.fn();

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => createElement("img", props),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushSpy,
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: Record<string, unknown>) =>
    createElement("a", { href, ...props }, children),
}));

function DashboardHarness() {
  return createElement(ScenarioStoreProvider, null, createElement(EnterpriseDashboardPage));
}

function BuilderHarness() {
  return createElement(ScenarioStoreProvider, null, createElement(ScenarioBuilderPage));
}

function clickRow(locationName: string) {
  const row = document.querySelector(`[data-location-row="${locationName}"]`);

  if (!row) {
    throw new Error(`Location row not found: ${locationName}`);
  }

  act(() => {
    row.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

afterEach(() => {
  pushSpy.mockReset();
  resetScenarioStoreForTests();
  document.body.innerHTML = "";
});

describe("scenario builder location integration", () => {
  test("defaults to the dashboard-selected location", () => {
    const dashboardContainer = document.createElement("div");
    document.body.appendChild(dashboardContainer);
    const dashboardRoot = createRoot(dashboardContainer);

    act(() => {
      dashboardRoot.render(createElement(DashboardHarness));
    });

    clickRow("Location 3");

    expect(pushSpy).toHaveBeenCalledWith("/dashboard");

    act(() => {
      dashboardRoot.unmount();
    });

    const builderContainer = document.createElement("div");
    document.body.appendChild(builderContainer);
    const builderRoot = createRoot(builderContainer);

    act(() => {
      builderRoot.render(createElement(BuilderHarness));
    });

    const locationSelector = document.querySelector('[aria-label="Scenario location"]') as HTMLSelectElement | null;

    if (!locationSelector) {
      throw new Error("Scenario location selector not found");
    }

    expect(locationSelector.value).toBe("Location 3");
    expect(document.body.textContent).toContain("Editing this builder only affects Location 3.");

    act(() => {
      builderRoot.unmount();
    });
  });
});