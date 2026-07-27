"use client";

import { ExecutiveFirstOpportunityLayout } from "@/components/ers/opportunity-template";
import { useScenarioStore } from "@/lib/ers/scenario/store";
import Link from "next/link";

export default function RepairDurabilityOpportunityPage() {
  const { ersSignalBundle } = useScenarioStore();
  const repairDurabilitySignal = ersSignalBundle.signals.repairDurability;
  const repeatRepairAssets = ersSignalBundle.input.equipmentWithMoreThan3Repairs90Days;
  const totalFitnessAssets = ersSignalBundle.input.totalFitnessAssets;
  const repeatRepairShare =
    totalFitnessAssets > 0 ? Math.round((repeatRepairAssets / totalFitnessAssets) * 1000) / 10 : 0;
  const executiveSummary =
    `Repair Durability is ${repairDurabilitySignal.status} because ${repeatRepairAssets} assets exceeded the three-repair threshold ` +
    `during the ${ersSignalBundle.reportingContext.reportingPeriod.toLowerCase()}, representing ${repeatRepairShare}% of monitored equipment. ` +
    "These recurring failures indicate persistent reliability issues affecting equipment readiness.";

  return (
    <ExecutiveFirstOpportunityLayout
      header={{
        organizationLabel: ersSignalBundle.reportingContext.organizationLabel,
        reportingPeriod: ersSignalBundle.reportingContext.reportingPeriod,
        lastUpdated: ersSignalBundle.reportingContext.lastUpdated,
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
        signalName: "Repair Durability",
        currentScore: repairDurabilitySignal.score,
        status: repairDurabilitySignal.status,
        estimatedErsImpact: repairDurabilitySignal.estimatedErsImpact,
        trend: repairDurabilitySignal.trend,
      }}
      executiveSummary={executiveSummary}
      evidence={(
        <div className="space-y-6">
          <section className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-[#0f2238]">Repair Performance</h3>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-[#dcebe6] bg-white p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">
                  Assets with 3+ Repairs
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{repeatRepairAssets}</p>
              </div>
              <div className="rounded-[24px] border border-[#dcebe6] bg-white p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">
                  Repeat Failure Rate
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{repeatRepairShare}%</p>
              </div>
            </div>
          </section>

          <Link
            href="/opportunities/repair-durability/work-orders"
            className="inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#15803d]"
          >
            Open Repair Durability Opportunity
          </Link>
        </div>
      )}
    />
  );
}
