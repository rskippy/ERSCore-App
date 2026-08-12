"use client";

import { ExecutiveFirstOpportunityLayout } from "@/components/ers/opportunity-template";
import { getDetectionDriverScores } from "@/lib/ers/detection";
import { useScenarioStore } from "@/lib/ers/scenario/store";
import Link from "next/link";

function formatScore(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export default function DetectionOpportunityPage() {
  const { ersSignalBundle } = useScenarioStore();
  const detectionSignal = ersSignalBundle.signals.detection;
  const totalFitnessAssets = ersSignalBundle.input.totalFitnessAssets;
  const workOrdersStarted = ersSignalBundle.input.repairWorkOrdersStarted90Days;
  const pmTouches = ersSignalBundle.input.equipmentPMTouches90Days;
  const memberReportingAvailable = ersSignalBundle.input.equipmentSpecificReporting ? "Available" : "Not Available";
  const {
    workOrdersStartedScore,
    pmCoverageScore,
    memberReportingScore,
  } = getDetectionDriverScores(ersSignalBundle.input);

  // Rank drivers by weighted points lost (opportunity gap) rather than raw score.
  const woLost = 50 - workOrdersStartedScore * 0.5;
  const pmLost = 30 - pmCoverageScore * 0.3;
  const mrLost = 20 - memberReportingScore * 0.2;

  const gapOrder = [
    { key: "wo" as const, lost: woLost },
    { key: "pm" as const, lost: pmLost },
    { key: "mr" as const, lost: mrLost },
  ].sort((a, b) => b.lost - a.lost);

  const WEAK_THRESHOLD = 8;
  const weakCount = gapOrder.filter((g) => g.lost > WEAK_THRESHOLD).length;
  const largestKey = gapOrder[0].key;

  const woPrimary = `Work Order activity is the largest current gap, with only ${workOrdersStarted} equipment work orders started during the last 90 days`;
  const woSecondary = `Work Order activity is also below target at ${workOrdersStarted} equipment work orders started`;
  const pmPrimary = `Preventive Maintenance coverage is the largest current gap, with only ${pmTouches} PM touches across ${totalFitnessAssets} assets during the last 90 days`;
  const pmSecondary = `Preventive Maintenance coverage is also below target at ${pmTouches} PM touches across ${totalFitnessAssets} assets`;
  const mrClause = memberReportingAvailable === "Available"
    ? "Member Reporting is available, providing frontline issue visibility"
    : "Member Reporting is not available";

  function phraseFor(key: "wo" | "pm" | "mr", primary: boolean): string {
    if (key === "wo") return primary ? woPrimary : woSecondary;
    if (key === "pm") return primary ? pmPrimary : pmSecondary;
    return (primary ? mrClause : mrClause.charAt(0).toLowerCase() + mrClause.slice(1));
  }

  let executiveSummary: string;

  if (weakCount >= 3) {
    const [first, second, third] = gapOrder;
    executiveSummary =
      `Detection is ${detectionSignal.status} because issue-identification activity is weak across all three detection channels. ` +
      `${phraseFor(first.key, true)}. ` +
      `${phraseFor(second.key, false)}, and ${phraseFor(third.key, false)}.`;
  } else if (weakCount === 2) {
    const weak = gapOrder.filter((g) => g.lost > WEAK_THRESHOLD);
    const strong = gapOrder.find((g) => g.lost <= WEAK_THRESHOLD)!;
    const [w1, w2] = weak;
    const strongLabel = strong.key === "wo"
      ? `Work Order activity (${workOrdersStarted} work orders started)`
      : strong.key === "pm"
        ? `Preventive Maintenance coverage (${pmTouches} PM touches across ${totalFitnessAssets} assets)`
        : `Member Reporting (${memberReportingAvailable})`;
    executiveSummary =
      `Detection is ${detectionSignal.status} because two detection channels have meaningful gaps. ` +
      `${phraseFor(w1.key, true)}. ` +
      `${phraseFor(w2.key, false)}. ` +
      `${strongLabel} is the strongest current detection channel.`;
  } else {
    const [primary, ...supporting] = gapOrder;
    const supportingDesc = supporting
      .map((g) => phraseFor(g.key, false).charAt(0).toLowerCase() + phraseFor(g.key, false).slice(1))
      .join(", and ");
    executiveSummary =
      `Detection is ${detectionSignal.status} primarily because ${phraseFor(primary.key, true).charAt(0).toLowerCase() + phraseFor(primary.key, true).slice(1)}. ` +
      `${supportingDesc.charAt(0).toUpperCase() + supportingDesc.slice(1)}.`;
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
      whyItMatters={"The sooner an equipment issue is detected, the sooner it can be repaired — reducing the number of members exposed to unavailable or underperforming equipment.\n\nDetection can come from staff observations, preventive maintenance inspections, or member reporting. Each provides another opportunity to identify a problem before it affects more members."}
      signalHeader={{
        signalName: "Detection",
        currentScore: detectionSignal.score,
        status: detectionSignal.status,
        estimatedErsImpact: detectionSignal.estimatedErsImpact,
        trend: detectionSignal.trend,
      }}
      executiveSummary={executiveSummary}
      evidence={(
        <div className="space-y-6">
          <section className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-[#0f2238]">Detection Performance</h3>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[24px] border border-[#dcebe6] bg-white p-6 transition hover:border-[#c8e8de] hover:shadow-[0_16px_38px_-30px_rgba(15,34,56,0.24)]">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">
                  Work Orders Started (90 Days)
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{workOrdersStarted}</p>
              </div>
              <div className="rounded-[24px] border border-[#dcebe6] bg-white p-6 transition hover:border-[#c8e8de] hover:shadow-[0_16px_38px_-30px_rgba(15,34,56,0.24)]">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">
                  Preventive Maintenance Touches (90 Days)
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{pmTouches}</p>
              </div>
              <div className="rounded-[24px] border border-[#dcebe6] bg-white p-6 transition hover:border-[#c8e8de] hover:shadow-[0_16px_38px_-30px_rgba(15,34,56,0.24)]">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">
                  Member Reporting Availability
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{memberReportingAvailable}</p>
              </div>
            </div>
          </section>

          <Link
            href="/opportunities/detection/work-orders"
            className="inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#15803d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/35"
          >
            Open Detection Opportunity
          </Link>
        </div>
      )}
    />
  );
}
