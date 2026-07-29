// @vitest-environment jsdom

import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ScenarioStoreProvider, resetScenarioStoreForTests } from "@/lib/ers/scenario/store";
import EnterpriseDashboardPage from "./page";

const pushSpy = vi.fn();

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => createElement("img", props),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushSpy,
  }),
}));

function EnterpriseDashboardHarness() {
  return createElement(ScenarioStoreProvider, null, createElement(EnterpriseDashboardPage));
}

afterEach(() => {
  pushSpy.mockReset();
  resetScenarioStoreForTests();
  document.body.innerHTML = "";
});

describe("enterprise dashboard row selection", () => {
  test("clicking a location row sets selected location and opens dashboard", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(createElement(EnterpriseDashboardHarness));
    });

    const location2Row = document.querySelector('[data-location-row="Location 2"]');

    if (!location2Row) {
      throw new Error("Location 2 row not found");
    }

    act(() => {
      location2Row.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(document.body.textContent).toContain("Selected: Location 2");
    expect(pushSpy).toHaveBeenCalledWith("/dashboard");

    act(() => {
      root.unmount();
    });
  });
});
