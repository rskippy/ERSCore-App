"use client";

import { ExecutiveFirstOpportunityLayout } from "@/components/ers/opportunity-template";
import { useScenarioStore } from "@/lib/ers/scenario/store";
import Link from "next/link";
import { createAverageRecoveryAnalysisViewModel } from "./analysisViewModel";
import { createAverageRecoveryOpportunityViewModel } from "./data";

export default function AverageRecoveryOpportunityPage() {
  const { ersSignalBundle, scenarioInput } = useScenarioStore();
  const averageRecoverySignalBundle = ersSignalBundle.signals.averageRecovery;
  const analysisViewModel = createAverageRecoveryAnalysisViewModel(
    averageRecoverySignalBundle,
    ersSignalBundle.reportingContext.reportingPeriod,
  );
  const averageRecoveryOpportunityViewModel =
    createAverageRecoveryOpportunityViewModel(scenarioInput);

  const {
    summary,
  } = averageRecoveryOpportunityViewModel;

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
      whyItMatters={"Once an equipment issue is identified, every additional day it remains unresolved increases member exposure.\n\nFaster recovery reduces the time members encounter equipment that is unavailable or not performing as expected."}
      signalHeader={{
        signalName: summary.title,
        currentScore: analysisViewModel.currentScore,
        status: analysisViewModel.status,
        estimatedErsImpact: averageRecoverySignalBundle.estimatedErsImpact,
        trend: analysisViewModel.trend,
      }}
      executiveSummary={analysisViewModel.executiveSummary}
      evidence={(
        <div className="space-y-6">
          <section className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-[#0f2238]">Recovery Performance</h3>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-[#dcebe6] bg-white p-6 transition hover:border-[#c8e8de] hover:shadow-[0_16px_38px_-30px_rgba(15,34,56,0.24)]">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Average Days to Close</p>
                <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{analysisViewModel.averageDaysToClose}</p>
              </div>
            </div>
          </section>

          <Link
            href="/opportunities/average-recovery/work-orders"
            className="inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#15803d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/35"
          >
            Open Average Recovery Opportunity
          </Link>
        </div>
      )}
    />
  );
}
