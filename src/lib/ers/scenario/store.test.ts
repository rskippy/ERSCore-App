// @vitest-environment jsdom

import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, test } from "vitest";
import {
  ERS_LOCATIONS,
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

function LocationIsolationHarness() {
  const {
    selectedLocation,
    locationScenarioInputs,
    scenarioInput,
    updateScenarioInput,
    setSelectedLocation,
    ersSignalBundle,
  } = useScenarioStore();

  return createElement(
    "div",
    null,
    createElement("p", { id: "selected-location" }, selectedLocation),
    createElement("p", { id: "active-work-orders" }, String(scenarioInput.workOrdersStarted)),
    createElement(
      "p",
      { id: "active-input-work-orders" },
      String(ersSignalBundle.input.repairWorkOrdersStarted90Days),
    ),
    createElement(
      "p",
      { id: "location-1-work-orders" },
      String(locationScenarioInputs["Location 1"].workOrdersStarted),
    ),
    createElement(
      "p",
      { id: "location-2-work-orders" },
      String(locationScenarioInputs["Location 2"].workOrdersStarted),
    ),
    createElement(
      "button",
      {
        type: "button",
        id: "select-location-1",
        onClick: () => {
          setSelectedLocation("Location 1");
        },
      },
      "Location 1",
    ),
    createElement(
      "button",
      {
        type: "button",
        id: "select-location-2",
        onClick: () => {
          setSelectedLocation("Location 2");
        },
      },
      "Location 2",
    ),
    createElement(
      "button",
      {
        type: "button",
        id: "update-active-work-orders-21",
        onClick: () => {
          updateScenarioInput({ workOrdersStarted: 21 });
        },
      },
      "Set 21",
    ),
    createElement(
      "button",
      {
        type: "button",
        id: "update-active-work-orders-9",
        onClick: () => {
          updateScenarioInput({ workOrdersStarted: 9 });
        },
      },
      "Set 9",
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

function LocationIsolationApp() {
  return createElement(ScenarioStoreProvider, null, createElement(LocationIsolationHarness));
}

function clickById(id: string) {
  const button = document.getElementById(id);

  if (!button) {
    throw new Error(`Element not found: ${id}`);
  }

  act(() => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

afterEach(() => {
  resetScenarioStoreForTests();
  document.body.innerHTML = "";
});

describe("scenario state persistence across navigation", () => {
  test("provides six enterprise sample locations", () => {
    expect(ERS_LOCATIONS).toEqual([
      "Location 1",
      "Location 2",
      "Location 3",
      "Location 4",
      "Location 5",
      "Location 6",
    ]);
  });

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

  test("location updates remain isolated and cannot affect other locations", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(createElement(LocationIsolationApp));
    });

    expect(document.getElementById("selected-location")?.textContent).toBe("Location 1");
    expect(document.getElementById("active-work-orders")?.textContent).toBe("4");
    expect(document.getElementById("location-1-work-orders")?.textContent).toBe("4");
    expect(document.getElementById("location-2-work-orders")?.textContent).toBe("4");

    clickById("update-active-work-orders-21");

    expect(document.getElementById("active-work-orders")?.textContent).toBe("21");
    expect(document.getElementById("active-input-work-orders")?.textContent).toBe("21");
    expect(document.getElementById("location-1-work-orders")?.textContent).toBe("21");
    expect(document.getElementById("location-2-work-orders")?.textContent).toBe("4");

    clickById("select-location-2");

    expect(document.getElementById("selected-location")?.textContent).toBe("Location 2");
    expect(document.getElementById("active-work-orders")?.textContent).toBe("4");
    expect(document.getElementById("active-input-work-orders")?.textContent).toBe("4");

    clickById("update-active-work-orders-9");

    expect(document.getElementById("active-work-orders")?.textContent).toBe("9");
    expect(document.getElementById("active-input-work-orders")?.textContent).toBe("9");
    expect(document.getElementById("location-1-work-orders")?.textContent).toBe("21");
    expect(document.getElementById("location-2-work-orders")?.textContent).toBe("9");

    clickById("select-location-1");

    expect(document.getElementById("selected-location")?.textContent).toBe("Location 1");
    expect(document.getElementById("active-work-orders")?.textContent).toBe("21");
    expect(document.getElementById("active-input-work-orders")?.textContent).toBe("21");

    act(() => {
      root.unmount();
    });
  });

  test("location-level state persists across provider remounts", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(createElement(LocationIsolationApp));
    });

    clickById("update-active-work-orders-21");
    clickById("select-location-2");
    clickById("update-active-work-orders-9");

    act(() => {
      root.unmount();
    });

    const remountContainer = document.createElement("div");
    document.body.appendChild(remountContainer);
    const remountRoot = createRoot(remountContainer);

    act(() => {
      remountRoot.render(createElement(LocationIsolationApp));
    });

    expect(document.getElementById("selected-location")?.textContent).toBe("Location 2");
    expect(document.getElementById("location-1-work-orders")?.textContent).toBe("21");
    expect(document.getElementById("location-2-work-orders")?.textContent).toBe("9");
    expect(document.getElementById("active-work-orders")?.textContent).toBe("9");
    expect(document.getElementById("active-input-work-orders")?.textContent).toBe("9");

    clickById("select-location-1");

    expect(document.getElementById("active-work-orders")?.textContent).toBe("21");
    expect(document.getElementById("active-input-work-orders")?.textContent).toBe("21");

    act(() => {
      remountRoot.unmount();
    });
  });

  test("selecting a location switches the active scenario context", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(createElement(LocationIsolationApp));
    });

    clickById("update-active-work-orders-21");

    expect(document.getElementById("selected-location")?.textContent).toBe("Location 1");
    expect(document.getElementById("active-work-orders")?.textContent).toBe("21");
    expect(document.getElementById("active-input-work-orders")?.textContent).toBe("21");

    clickById("select-location-2");

    expect(document.getElementById("selected-location")?.textContent).toBe("Location 2");
    expect(document.getElementById("active-work-orders")?.textContent).toBe("4");
    expect(document.getElementById("active-input-work-orders")?.textContent).toBe("4");

    act(() => {
      root.unmount();
    });
  });
});
