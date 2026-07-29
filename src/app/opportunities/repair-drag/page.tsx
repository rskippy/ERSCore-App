"use client";

import {
  ExecutiveFirstOpportunityLayout,
  ScoreInputs,
  SupportingMetrics,
} from "@/components/ers/opportunity-template";
import Link from "next/link";
import { useScenarioStore } from "@/lib/ers/scenario/store";
import { getDashboardSignalSnapshot } from "@/app/dashboard/data";
import { createRepairDragOpportunityViewModel } from "./data";

export default function RepairDragOpportunityPage() {
  const { ersSignalBundle, scenarioInput } = useScenarioStore();
  const dashboardRepairDragSnapshot = getDashboardSignalSnapshot("Repair Drag", ersSignalBundle);
  const repairDragOpportunityViewModel = createRepairDragOpportunityViewModel(scenarioInput);

  const {
    header,
    summary,
    scoreInputs,
    supportingMetrics,
    agingDistribution,
  } = repairDragOpportunityViewModel;

  const totalAgingWorkOrders = agingDistribution.reduce((sum, item) => sum + item.value, 0);

  const supportingMetricMap = Object.fromEntries(
    supportingMetrics.map((metric) => [metric.label, metric.value]),
  ) as Record<string, string>;

  const openEquipmentWorkOrders = supportingMetricMap["Open Equipment Work Orders"];
  const olderThan15Days = supportingMetricMap["Older than 15 Days"];
  const olderThan30Days = supportingMetricMap["Older than 30 Days"];
  const olderThan45Days = supportingMetricMap["Older than 45 Days"];
  const repairDragPercent = scoreInputs.find((metric) => metric.label === "Repair Drag %")?.value;

  const executiveSummary = `${dashboardRepairDragSnapshot.status} Repair Drag is driven by ${repairDragPercent} of your open equipment work orders (${olderThan15Days} of ${openEquipmentWorkOrders}) sitting open longer than 15 days. ${olderThan30Days} work orders have been open longer than 30 days, and ${olderThan45Days} have exceeded 45 days, creating the largest readiness penalty at this location.`;

  return (
    <ExecutiveFirstOpportunityLayout
      header={{
        ...header,
        backHref: "/dashboard",
        backLabel: "Back to Dashboard",
      }}
      showHeaderLabel={false}
      showSignalNameLabel={false}
      showStatusPill={false}
      showEstimatedErsImpact={false}
      showRecommendedActions={false}
      showLearnMore={false}
      signalHeader={{
        signalName: summary.title,
        currentScore: dashboardRepairDragSnapshot.currentScore,
        status: dashboardRepairDragSnapshot.status,
        estimatedErsImpact: dashboardRepairDragSnapshot.estimatedErsImpact,
        trend: dashboardRepairDragSnapshot.trend,
      }}
      executiveSummary={executiveSummary}
      evidence={(
        <div className="space-y-6">
          <ScoreInputs title="Score Inputs" description="Direct inputs to the Repair Drag score" metrics={scoreInputs} />
          <SupportingMetrics title="Supporting Metrics" metrics={supportingMetrics} />
          <section className="rounded-[32px] border border-[#dcebe6] bg-[#f7fcfa] p-8 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.2)] sm:p-9">
            <h3 className="text-xl font-semibold text-[#0f2238]">Aging Distribution</h3>
            <p className="mt-3 text-base leading-7 text-[#4f627d]">Current aging concentration across unresolved work.</p>

            <div className="mt-6 rounded-[24px] border border-[#dcebe6] bg-white p-5">
              <div className="flex h-3 overflow-hidden rounded-full bg-[#eef6f2]">
                {agingDistribution.map((segment) => (
                  <div
                    key={segment.label}
                    className="h-3"
                    style={{ width: `${(segment.value / totalAgingWorkOrders) * 100}%`, backgroundColor: segment.color }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 overflow-x-auto rounded-[24px] border border-[#dcebe6] bg-white">
              <table className="min-w-full border-collapse text-left text-sm text-[#0f2238]">
                <thead>
                  <tr className="border-b border-[#dcebe6] bg-[#f7fcfa] text-xs font-semibold uppercase tracking-[0.24em] text-[#4f627d]">
                    <th className="px-4 py-3">Aging Band</th>
                    <th className="px-4 py-3">Open Work Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {agingDistribution.map((segment) => (
                    <tr key={segment.label} className="border-b border-[#eef6f2] align-top">
                      <td className="px-4 py-4 font-semibold text-[#0f2238]">{segment.label}</td>
                      <td className="px-4 py-4 text-[#4f627d]">{segment.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <Link
            href="/opportunities/repair-drag/work-orders"
            className="inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#15803d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/35"
          >
            Open Repair Drag Opportunity
          </Link>
        </div>
      )}
    />
  );
}
