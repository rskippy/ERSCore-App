// @vitest-environment jsdom

import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, test } from "vitest";
import {
  ScenarioStoreProvider,
  resetScenarioStoreForTests,
  useScenarioStore,
} from "./store";

function ScenarioBuilderHarness() {
  const { scenarioInput, updateScenarioInput } = useScenarioStore();

  return createElement(
    "div",
    null,
    createElement(
      "button",
      {
        type: "button",
        id: "update-work-orders",
        onClick: () => {
          updateScenarioInput({ workOrdersStarted: 21 });
        },
      },
      "Update",
    ),
    createElement("p", { id: "builder-work-orders" }, String(scenarioInput.workOrdersStarted)),
  );
}

function DashboardHarness() {
  const { scenarioInput, ersSignalBundle } = useScenarioStore();

  return createElement(
    "div",
    null,
    createElement("p", { id: "dashboard-work-orders" }, String(scenarioInput.workOrdersStarted)),
    createElement(
      "p",
      { id: "dashboard-input-work-orders" },
      String(ersSignalBundle.input.repairWorkOrdersStarted90Days),
    ),
  );
}

function TestApp({ page }: { page: "builder" | "dashboard" }) {
  return createElement(
    ScenarioStoreProvider,
    null,
    page === "builder"
      ? createElement(ScenarioBuilderHarness)
      : createElement(DashboardHarness),
  );
}

afterEach(() => {
  resetScenarioStoreForTests();
  document.body.innerHTML = "";
});

describe("scenario state persistence across navigation", () => {
  test("scenario builder updates are reflected on dashboard after provider remount", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(createElement(TestApp, { page: "builder" }));
    });

    const updateButton = document.getElementById("update-work-orders");

    if (!updateButton) {
      throw new Error("Update button not found");
    }

    act(() => {
      updateButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const builderValue = document.getElementById("builder-work-orders")?.textContent;
    expect(builderValue).toBe("21");

    act(() => {
      root.unmount();
    });

    const remountContainer = document.createElement("div");
    document.body.appendChild(remountContainer);
    const remountRoot = createRoot(remountContainer);

    act(() => {
      remountRoot.render(createElement(TestApp, { page: "dashboard" }));
    });

    const dashboardValue = document.getElementById("dashboard-work-orders")?.textContent;
    const dashboardInputValue = document.getElementById("dashboard-input-work-orders")?.textContent;

    expect(dashboardValue).toBe("21");
    expect(dashboardInputValue).toBe("21");

    act(() => {
      remountRoot.unmount();
    });
  });
});
