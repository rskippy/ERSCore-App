"use client";

import { useState } from "react";
import { OpportunityHeader } from "@/components/ers/opportunity-template";
import { getDashboardSignalSnapshot } from "@/app/dashboard/data";
import { useScenarioStore } from "@/lib/ers/scenario/store";
import {
  calculateRemainingErsOpportunity,
  formatRemainingErsOpportunity,
  signalWeights,
} from "@/lib/ers/remainingOpportunity";
import { createAverageRecoveryOpportunityViewModel } from "../data";

export default function AverageRecoveryOpportunityPage() {
  const [showSupportingWorkOrders, setShowSupportingWorkOrders] = useState(false);
  const { ersSignalBundle, scenarioInput } = useScenarioStore();
  const dashboardSignalSnapshot = getDashboardSignalSnapshot("Average Recovery", ersSignalBundle);
  const averageRecoveryOpportunityViewModel =
    createAverageRecoveryOpportunityViewModel(scenarioInput);
  const {
    header,
    primaryMetrics,
    supportingMetrics,
    filters,
    opportunityRows,
    recommendations,
  } = averageRecoveryOpportunityViewModel;

  const averageDaysToClose = primaryMetrics.find((metric) => metric.label === "Average Days to Close")?.value ?? "-";
  const completedWorkOrders = supportingMetrics.find((metric) => metric.label === "Completed Equipment Work Orders")?.value ?? "-";
  const completedWorkOrdersCount = Number(completedWorkOrders);
  const completedWorkOrdersNoun = completedWorkOrdersCount === 1 ? "work order" : "work orders";
  const remainingErsOpportunity = formatRemainingErsOpportunity(
    calculateRemainingErsOpportunity(
      dashboardSignalSnapshot.currentScore,
      signalWeights.averageRecovery,
    ),
  );
  const longCycleRepairs = opportunityRows.filter((row) => row.daysToClose > 7).length;

  return (
    <main className="min-h-screen bg-[#f7fcfa] text-[#0f2238]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-12">
        <OpportunityHeader
          organizationLabel={header.organizationLabel}
          reportingPeriod={header.reportingPeriod}
          lastUpdated={header.lastUpdated}
          backHref="/opportunities/average-recovery"
          backLabel="Back to Average Recovery Analysis"
        />

        <section className="mt-8 rounded-[32px] border border-[#dcebe6] bg-white p-8 shadow-[0_24px_70px_-38px_rgba(15,34,56,0.28)] sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f766e]">Opportunity</p>
          <h1 className="mt-4 text-3xl font-semibold text-[#0f2238] sm:text-4xl">Average Recovery Opportunity</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-[#4f627d]">
            Improve equipment readiness by reducing the time required to complete equipment repairs.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Current Signal Score</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{dashboardSignalSnapshot.currentScore}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Remaining ERS Opportunity</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{remainingErsOpportunity}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Average Days to Close</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{averageDaysToClose}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Completed Work Orders</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{completedWorkOrders}</p>
            </div>
          </div>

          <section className="mt-6 rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6">
            <h2 className="text-xl font-semibold text-[#0f2238]">Opportunity Insight</h2>
            <p className="mt-3 text-base leading-7 text-[#4f627d]">
              Average Recovery is currently limited by an average closure time of {averageDaysToClose} days across {completedWorkOrders} completed equipment {completedWorkOrdersNoun}. Reducing the time required to complete repairs will improve equipment readiness and increase the Average Recovery score.
            </p>
          </section>
        </section>

        <section className="mt-6 rounded-[32px] border border-[#dcebe6] bg-white p-8 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] sm:p-9">
          <h2 className="text-xl font-semibold text-[#0f2238]">Recovery Improvement Checklist</h2>
          <ul className="mt-6 space-y-3">
            {recommendations.map((recommendation) => (
              <li key={recommendation} className="flex items-start gap-3 rounded-[20px] border border-[#dcebe6] bg-[#f7fcfa] p-4">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0f766e]" />
                <p className="text-base leading-7 text-[#0f2238]">{recommendation}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowSupportingWorkOrders((value) => !value)}
              className="inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#15803d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/35"
            >
              {showSupportingWorkOrders
                ? "Hide Supporting Work Orders"
                : `View Supporting Work Orders (${completedWorkOrders})`}
            </button>
          </div>
        </section>

        {showSupportingWorkOrders ? (
          <section className="mt-6 rounded-[32px] border border-[#dcebe6] bg-white p-6 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] sm:p-8">
            <div className="flex flex-col gap-4 border-b border-[#dcebe6] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#0f2238]">Prioritized Work Orders</h2>
                <p className="mt-1 text-sm text-[#4f627d]">
                  Focus on the longest recovery repairs first; {longCycleRepairs} sampled items are over 7 days to close.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {filters.map((filter) => (
                <label key={filter.label} className="flex flex-col gap-2 text-sm font-semibold text-[#0f2238]">
                  <span>{filter.label}</span>
                  <select className="rounded-full border border-[#dcebe6] bg-white px-4 py-3 text-sm font-medium text-[#4f627d] outline-none ring-0 transition focus:border-[#0f766e]">
                    {filter.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div className="mt-6 overflow-x-auto rounded-[24px] border border-[#dcebe6] bg-white">
              <table className="min-w-full border-collapse text-left text-sm text-[#0f2238]">
                <thead>
                  <tr className="border-b border-[#dcebe6] bg-[#f7fcfa] text-xs font-semibold uppercase tracking-[0.24em] text-[#4f627d]">
                    <th className="px-4 py-3">Source Work Order ID</th>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Opened Date</th>
                    <th className="px-4 py-3">Closed Date</th>
                    <th className="px-4 py-3">Days to Close</th>
                    <th className="px-4 py-3">Recovery Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...opportunityRows]
                    .sort((left, right) => right.daysToClose - left.daysToClose)
                    .map((row) => (
                      <tr key={row.sourceWorkOrderId} className="border-b border-[#eef6f2] align-top transition hover:bg-[#f9fdfb]">
                        <td className="px-4 py-4 font-semibold text-[#0f2238]">{row.sourceWorkOrderId}</td>
                        <td className="px-4 py-4 text-[#4f627d]">{row.asset}</td>
                        <td className="px-4 py-4 text-[#4f627d]">{row.location}</td>
                        <td className="px-4 py-4 text-[#4f627d]">{row.openedDate}</td>
                        <td className="px-4 py-4 text-[#4f627d]">{row.closedDate}</td>
                        <td className="px-4 py-4 text-[#4f627d]">{row.daysToClose}</td>
                        <td className="px-4 py-4 text-[#4f627d]">{row.recoveryStatus}</td>
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
