"use client";

import { useState } from "react";
import { OpportunityHeader } from "@/components/ers/opportunity-template";
import {
  calculateRemainingErsOpportunity,
  formatRemainingErsOpportunity,
  signalWeights,
} from "@/lib/ers/remainingOpportunity";
import { useScenarioStore } from "@/lib/ers/scenario/store";
import { createRepairDurabilityOpportunityViewModel } from "../data";

export default function RepairDurabilityOpportunityWorkOrdersPage() {
  const [showSupportingAssets, setShowSupportingAssets] = useState(false);
  const { ersSignalBundle, scenarioInput } = useScenarioStore();
  const repairDurabilitySignal = ersSignalBundle.signals.repairDurability;
  const repeatRepairAssets = ersSignalBundle.input.equipmentWith3PlusRepairs90Days;
  const totalFitnessAssets = ersSignalBundle.input.totalFitnessAssets;
  const repeatRepairShare =
    totalFitnessAssets > 0 ? Math.round((repeatRepairAssets / totalFitnessAssets) * 1000) / 10 : 0;
  const repeatFailureNoun = repeatRepairAssets === 1 ? "asset" : "assets";
  const repeatFailureVerb = repeatRepairAssets === 1 ? "has" : "have";
  const remainingErsOpportunity = formatRemainingErsOpportunity(
    calculateRemainingErsOpportunity(
      repairDurabilitySignal.score,
      signalWeights.repairDurability,
    ),
  );

  const opportunityInsight =
    `${repeatRepairAssets} ${repeatFailureNoun} ${repeatFailureVerb} exceeded the repeat repair threshold, representing ${repeatRepairShare}% of monitored equipment. ` +
    "These recurring failures indicate chronic equipment issues that should be evaluated individually to improve long-term readiness.";

  const repairDurabilityOpportunityViewModel = createRepairDurabilityOpportunityViewModel(
    scenarioInput,
    ersSignalBundle,
  );
  const supportingAssets = repairDurabilityOpportunityViewModel.opportunityRows;

  return (
    <main className="min-h-screen bg-[#f7fcfa] text-[#0f2238]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-12">
        <OpportunityHeader
          organizationLabel={ersSignalBundle.reportingContext.organizationLabel}
          reportingPeriod={ersSignalBundle.reportingContext.reportingPeriod}
          lastUpdated={ersSignalBundle.reportingContext.lastUpdated}
          backHref="/opportunities/repair-durability"
          backLabel="Back to Repair Durability Analysis"
        />

        <section className="mt-8 rounded-[32px] border border-[#dcebe6] bg-white p-8 shadow-[0_24px_70px_-38px_rgba(15,34,56,0.28)] sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f766e]">Opportunity</p>
          <h1 className="mt-4 text-3xl font-semibold text-[#0f2238] sm:text-4xl">Repair Durability Opportunity</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-[#4f627d]">
            Improve equipment readiness by reducing recurring equipment failures.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Current Signal Score</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{repairDurabilitySignal.score}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Remaining ERS Opportunity</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{remainingErsOpportunity}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Assets with 3+ Repairs</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{repeatRepairAssets}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Repeat-Failure Assets</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{repeatRepairShare}%</p>
            </div>
          </div>

          <section className="mt-6 rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6">
            <h2 className="text-xl font-semibold text-[#0f2238]">Opportunity Insight</h2>
            <p className="mt-3 text-base leading-7 text-[#4f627d]">{opportunityInsight}</p>
          </section>

          <section className="mt-6 rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6">
            <h2 className="text-xl font-semibold text-[#0f2238]">Immediate Priority</h2>
            <p className="mt-3 text-base font-semibold text-[#0f2238]">Review each repeat-failure asset individually.</p>
            <p className="mt-2 text-base leading-7 text-[#4f627d]">
              For each asset, determine whether continued repair, root-cause correction, warranty action, refurbishment, relocation, or replacement represents the best long-term readiness decision.
            </p>
          </section>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowSupportingAssets((value) => !value)}
              className="inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#15803d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/35"
            >
              {showSupportingAssets
                ? "Hide Supporting Assets"
                : `View Supporting Assets (${repeatRepairAssets})`}
            </button>
          </div>
        </section>

        {showSupportingAssets ? (
          <section className="mt-6 rounded-[32px] border border-[#dcebe6] bg-white p-6 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] sm:p-8">
            <div className="flex flex-col gap-4 border-b border-[#dcebe6] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#0f2238]">Supporting Assets</h2>
                <p className="mt-1 text-sm text-[#4f627d]">
                  Assets with recurring failures that require individual management attention.
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto rounded-[24px] border border-[#dcebe6] bg-white">
              <table className="min-w-full border-collapse text-left text-sm text-[#0f2238]">
                <thead>
                  <tr className="border-b border-[#dcebe6] bg-[#f7fcfa] text-xs font-semibold uppercase tracking-[0.24em] text-[#4f627d]">
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Repair Count (90 Days)</th>
                    <th className="px-4 py-3">Last Repair Date</th>
                    <th className="px-4 py-3">Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {supportingAssets.map((asset) => (
                    <tr key={`${asset.asset}-${asset.location}`} className="border-b border-[#eef6f2] align-top transition hover:bg-[#f9fdfb]">
                      <td className="px-4 py-4 font-semibold text-[#0f2238]">{asset.asset}</td>
                      <td className="px-4 py-4 text-[#4f627d]">{asset.location}</td>
                      <td className="px-4 py-4 text-[#4f627d]">{asset.repairCount}</td>
                      <td className="px-4 py-4 text-[#4f627d]">{asset.lastRepairDate}</td>
                      <td className="px-4 py-4 text-[#4f627d]">{asset.riskLevel}</td>
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
