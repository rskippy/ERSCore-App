"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useScenarioStore } from "@/lib/ers/scenario/store";
import {
  createRepairDragWorkOrdersViewModel,
  workOrderFilters,
  workOrders,
} from "./data";

export default function RepairDragWorkOrdersPage() {
  const [showAgingWorkOrders, setShowAgingWorkOrders] = useState(false);
  const { scenarioInput } = useScenarioStore();
  const { workOrdersHeader, workOrdersSummary } = createRepairDragWorkOrdersViewModel(scenarioInput);
  const sortedWorkOrders = [...workOrders].sort((a, b) => b.ageDays - a.ageDays);

  const metricMap = useMemo(() => {
    return Object.fromEntries(workOrdersSummary.metrics.map((metric) => [metric.label, Number(metric.value)]));
  }, []);

  const contributingAgingWorkOrders = metricMap["Older than 15 Days"] ?? 0;
  const olderThan30Days = metricMap["Older than 30 Days"] ?? 0;
  const olderThan45Days = metricMap["Older than 45 Days"] ?? 0;

  const bucket45Plus = olderThan45Days;
  const bucket30To44 = Math.max(olderThan30Days - olderThan45Days, 0);
  const bucket15To29 = Math.max(contributingAgingWorkOrders - olderThan30Days, 0);

  const primaryDriver =
    bucket45Plus > 0
      ? { count: bucket45Plus, bucketThresholdDays: 45 }
      : bucket30To44 > 0
        ? { count: bucket30To44, bucketThresholdDays: 30 }
        : bucket15To29 > 0
          ? { count: bucket15To29, bucketThresholdDays: 15 }
          : { count: 0, bucketThresholdDays: 15 };

  const workOrderNoun = primaryDriver.count === 1 ? "work order" : "work orders";
  const workOrderVerb = primaryDriver.count === 1 ? "has" : "have";
  const workOrderBeVerb = primaryDriver.count === 1 ? "is" : "are";

  const opportunityInsight =
    primaryDriver.count > 0
      ? `${primaryDriver.count} equipment ${workOrderNoun} ${workOrderVerb} remained open longer than ${primaryDriver.bucketThresholdDays} days and ${workOrderBeVerb} currently creating the largest Repair Drag penalty. ` +
        "Resolving these oldest repairs first will produce the greatest readiness improvement before addressing the remaining aging backlog."
      : "No aging work-order backlog is currently present in the tracked Repair Drag buckets.";

  const recommendedActionInstruction = `Begin with the ${primaryDriver.count} ${workOrderNoun} older than ${primaryDriver.bucketThresholdDays} days. Once completed, continue reducing the remaining aging backlog in descending age order.`;

  return (
    <main className="min-h-screen bg-[#f7fcfa] text-[#0f2238]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-12">
        <header className="rounded-[32px] border border-[#dcebe6] bg-white p-7 shadow-[0_28px_80px_-40px_rgba(15,34,56,0.35)] sm:p-8 lg:p-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto lg:w-1/4 lg:min-w-[18rem]">
              <span className="inline-flex w-[340px] max-w-full shrink-0 items-center justify-start">
                <Image src="/logo.png" alt="ERS logo" width={340} height={58} className="h-auto w-full object-contain" priority />
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold text-[#0f2238]">Executive Intelligence</p>
              </div>
            </div>

            <Link
              href="/opportunities/repair-drag"
              className="inline-flex items-center rounded-full border border-[#dcebe6] bg-[#f7fcfa] px-4 py-2 text-sm font-semibold text-[#0f2238] transition hover:border-[#0f766e] hover:text-[#0f766e]"
            >
              Back to Repair Drag
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#4f627d]">
            <div className="rounded-full border border-[#dcebe6] bg-white px-4 py-2 font-semibold text-[#0f2238]">
              {workOrdersHeader.reportingPeriod}
            </div>
            <p className="rounded-full border border-[#dcebe6] bg-white px-4 py-2 text-[#4f627d]">
              Last updated: {workOrdersHeader.lastUpdated}
            </p>
          </div>
        </header>

        <section className="mt-8 rounded-[32px] border border-[#dcebe6] bg-white p-8 shadow-[0_24px_70px_-38px_rgba(15,34,56,0.28)] sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f766e]">
            {workOrdersSummary.sectionLabel}
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-[#0f2238] sm:text-4xl">
            {workOrdersSummary.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#4f627d]">
            {workOrdersSummary.supportingText}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workOrdersSummary.metrics.map((metric) => (
              <div key={metric.label} className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">
                  {metric.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{metric.value}</p>
              </div>
            ))}
          </div>

          <section className="mt-6 rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6">
            <h2 className="text-xl font-semibold text-[#0f2238]">Opportunity Insight</h2>
            <p className="mt-3 text-base leading-7 text-[#4f627d]">{opportunityInsight}</p>
          </section>

          <section className="mt-6 rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6">
            <h2 className="text-xl font-semibold text-[#0f2238]">Immediate Priority</h2>
            <p className="mt-3 text-base font-semibold text-[#0f2238]">Resolve the oldest equipment work orders first.</p>
            <p className="mt-2 text-base leading-7 text-[#4f627d]">{recommendedActionInstruction}</p>
          </section>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowAgingWorkOrders((value) => !value)}
              className="inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#15803d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/35"
            >
              {showAgingWorkOrders
                ? "Hide Aging Work Orders"
                : `View Supporting Work Orders (${contributingAgingWorkOrders})`}
            </button>
          </div>
        </section>

        {showAgingWorkOrders ? (
          <section className="mt-6 rounded-[32px] border border-[#dcebe6] bg-white p-6 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] sm:p-8">
            <div className="flex flex-col gap-4 border-b border-[#dcebe6] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#0f2238]">Affected work orders</h2>
                <p className="mt-1 text-sm text-[#4f627d]">
                  Sorted from oldest to newest to highlight repair drag exposure.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {workOrderFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className="rounded-full border border-[#dcebe6] bg-[#f7fcfa] px-4 py-2 text-sm font-semibold text-[#4f627d] transition hover:border-[#0f766e] hover:bg-white hover:text-[#0f2238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 overflow-x-auto rounded-[24px] border border-[#dcebe6] bg-white">
              <table className="min-w-full border-collapse text-left text-sm text-[#0f2238]">
                <thead>
                  <tr className="border-b border-[#dcebe6] bg-[#f7fcfa] text-xs font-semibold uppercase tracking-[0.24em] text-[#4f627d]">
                    <th className="px-4 py-3">Age</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Equipment</th>
                    <th className="px-4 py-3">Issue</th>
                    <th className="px-4 py-3">Current Status</th>
                    <th className="px-4 py-3">Delay Reason</th>
                    <th className="px-4 py-3">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWorkOrders.map((workOrder) => (
                    <tr key={workOrder.equipment} className="border-b border-[#eef6f2] align-top transition hover:bg-[#f9fdfb]">
                      <td className="px-4 py-4 font-semibold text-[#0f2238]">{workOrder.ageLabel}</td>
                      <td className="px-4 py-4 text-[#4f627d]">{workOrder.location}</td>
                      <td className="px-4 py-4 font-semibold text-[#0f2238]">{workOrder.equipment}</td>
                      <td className="px-4 py-4 text-[#4f627d]">{workOrder.issue}</td>
                      <td className="px-4 py-4 text-[#4f627d]">{workOrder.currentStatus}</td>
                      <td className="px-4 py-4 text-[#4f627d]">{workOrder.delayReason}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${workOrder.priorityTone}`}>
                          {workOrder.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
