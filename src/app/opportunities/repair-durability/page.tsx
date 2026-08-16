"use client";

import { ExecutiveFirstOpportunityLayout } from "@/components/ers/opportunity-template";
import { getDriverStatusLabel } from "@/lib/ers/readinessStatus";
import { useScenarioStore } from "@/lib/ers/scenario/store";
import Link from "next/link";

export default function RepairDurabilityOpportunityPage() {
  const { ersSignalBundle } = useScenarioStore();
  const repairDurabilitySignal = ersSignalBundle.signals.repairDurability;
  const repeatRepairAssets = ersSignalBundle.input.equipmentWith3PlusRepairs90Days;
  const totalFitnessAssets = ersSignalBundle.input.totalFitnessAssets;
  const repeatRepairShare =
    totalFitnessAssets > 0 ? Math.round((repeatRepairAssets / totalFitnessAssets) * 1000) / 10 : 0;
  const reportingPeriod = ersSignalBundle.reportingContext.reportingPeriod.toLowerCase();
  const displayStatus = getDriverStatusLabel(repairDurabilitySignal.status);
  const score = repairDurabilitySignal.score;

  let executiveSummary: string;
  if (score >= 80) {
    // Exceptional or Strong — frame as minimal remaining opportunity.
    executiveSummary =
      `Repair Durability remains ${displayStatus}, with repeat failures limited to ${repeatRepairAssets} assets ` +
      `(${repeatRepairShare}% of monitored equipment) during the ${reportingPeriod}. ` +
      `These assets represent the remaining durability opportunity and should be reviewed for recurring failure causes.`;
  } else if (score >= 60) {
    // Acceptable or Needs Improvement — frame as growing concern.
    executiveSummary =
      `Repair Durability is ${displayStatus}. ${repeatRepairAssets} assets (${repeatRepairShare}% of monitored equipment) ` +
      `experienced repeat failures during the ${reportingPeriod}. ` +
      `These recurring failures represent a growing durability concern and should be reviewed to prevent further score decline.`;
  } else {
    // At Risk or Critical — frame as serious issue.
    executiveSummary =
      `Repair Durability is ${displayStatus}. ${repeatRepairAssets} assets (${repeatRepairShare}% of monitored equipment) ` +
      `experienced repeat failures during the ${reportingPeriod}. ` +
      `These recurring failures indicate persistent reliability issues affecting equipment readiness.`;
  }

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
      whyItMatters={"A fast repair is only valuable if it lasts.\n\nEquipment that repeatedly fails may appear successfully repaired in maintenance reporting while members continue encountering the same problem. Durable repairs reduce repeat disruption and improve equipment readiness."}
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
              <div className="rounded-[24px] border border-[#dcebe6] bg-white p-6 transition hover:border-[#c8e8de] hover:shadow-[0_16px_38px_-30px_rgba(15,34,56,0.24)]">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">
                  Assets with 3+ Repairs
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{repeatRepairAssets}</p>
              </div>
              <div className="rounded-[24px] border border-[#dcebe6] bg-white p-6 transition hover:border-[#c8e8de] hover:shadow-[0_16px_38px_-30px_rgba(15,34,56,0.24)]">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">
                  Repeat-Failure Assets
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{repeatRepairShare}%</p>
              </div>
            </div>
          </section>

          <Link
            href="/opportunities/repair-durability/work-orders"
            className="inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#15803d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/35"
          >
            Open Repair Durability Opportunity
          </Link>
        </div>
      )}
    />
  );
}
