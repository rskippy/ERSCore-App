import type { ScenarioInput } from "@/lib/ers/scenario/types";

export const workOrderFilters = [
  { id: "all", label: "All Aging Work" },
  { id: "15-29", label: "15–29 Days" },
  { id: "30-44", label: "30–44 Days" },
  { id: "45+", label: "45+ Days" },
] as const;

export const workOrders = [
  {
    ageDays: 67,
    ageLabel: "67 days",
    location: "Atlanta North",
    equipment: "Treadmill 14",
    issue: "Drive motor failure",
    currentStatus: "Holding for Parts",
    delayReason: "Parts Backordered",
    priority: "Critical",
    priorityTone: "border-red-200 bg-red-50 text-red-700",
    ageBand: "45+",
  },
  {
    ageDays: 52,
    ageLabel: "52 days",
    location: "Dallas Central",
    equipment: "Elliptical 08",
    issue: "Resistance system failure",
    currentStatus: "Estimate Needs Approval",
    delayReason: "Approval Pending",
    priority: "High",
    priorityTone: "border-amber-200 bg-amber-50 text-amber-700",
    ageBand: "45+",
  },
  {
    ageDays: 46,
    ageLabel: "46 days",
    location: "Tampa West",
    equipment: "Treadmill 03",
    issue: "Belt and deck replacement",
    currentStatus: "Action Needed",
    delayReason: "Vendor Scheduling",
    priority: "High",
    priorityTone: "border-amber-200 bg-amber-50 text-amber-700",
    ageBand: "45+",
  },
  {
    ageDays: 38,
    ageLabel: "38 days",
    location: "Orlando South",
    equipment: "Strength Unit 22",
    issue: "Cable assembly damaged",
    currentStatus: "Holding for Parts",
    delayReason: "Parts Backordered",
    priority: "Medium",
    priorityTone: "border-sky-200 bg-sky-50 text-sky-700",
    ageBand: "30-44",
  },
  {
    ageDays: 31,
    ageLabel: "31 days",
    location: "Charlotte East",
    equipment: "Bike 11",
    issue: "Console not functioning",
    currentStatus: "Assigned",
    delayReason: "Technician Scheduling",
    priority: "Medium",
    priorityTone: "border-sky-200 bg-sky-50 text-sky-700",
    ageBand: "30-44",
  },
  {
    ageDays: 24,
    ageLabel: "24 days",
    location: "Houston North",
    equipment: "Treadmill 07",
    issue: "Elevation system failure",
    currentStatus: "Estimate Needs Approval",
    delayReason: "Approval Pending",
    priority: "Medium",
    priorityTone: "border-sky-200 bg-sky-50 text-sky-700",
    ageBand: "15-29",
  },
  {
    ageDays: 18,
    ageLabel: "18 days",
    location: "Phoenix Central",
    equipment: "Elliptical 04",
    issue: "Excessive noise",
    currentStatus: "Assigned",
    delayReason: "Vendor Scheduling",
    priority: "Low",
    priorityTone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    ageBand: "15-29",
  },
];

export function createRepairDragWorkOrdersViewModel(scenarioInput: ScenarioInput) {
  return {
    workOrdersHeader: {
      organizationLabel: "All Locations",
      reportingPeriod: "Last 90 Days",
      lastUpdated: "08:30 ET · 23 Jul 2026",
    },
    workOrdersSummary: {
      sectionLabel: "Repair Drag",
      title: "Repair Drag Action Plan",
      supportingText:
        "Focus first on the aging repairs creating the greatest readiness impact.",
      metrics: [
        { label: "Open Equipment Work Orders", value: String(scenarioInput.totalOpenEquipmentWorkOrders) },
        { label: "Older than 15 Days", value: String(scenarioInput.olderThan15Days) },
        { label: "Older than 30 Days", value: String(scenarioInput.olderThan30Days) },
        { label: "Older than 45 Days", value: String(scenarioInput.olderThan45Days) },
      ],
    },
  };
}
