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
  const reportingPeriod = ersSignalBundle.reportingContext.reportingPeriod.toLowerCase();
  const {
    workOrdersStartedScore,
    pmCoverageScore,
    memberReportingScore,
  } = getDetectionDriverScores(ersSignalBundle.input);

  const detectionDrivers = [
    {
      label: "Work Orders Started",
      score: workOrdersStartedScore,
      valueDescription: `${workOrdersStarted} equipment work orders initiated`,
      weaknessReason:
        `${workOrdersStarted} equipment work orders were initiated during ${reportingPeriod}, indicating lower issue-identification activity than the other detection drivers`,
      strengthDescription: `${workOrdersStarted} work orders started`,
    },
    {
      label: "PM Coverage",
      score: pmCoverageScore,
      valueDescription: `${pmTouches} preventive maintenance touches across ${totalFitnessAssets} monitored assets`,
      weaknessReason:
        `preventive maintenance coverage reflects ${pmTouches} preventive maintenance touches across ${totalFitnessAssets} monitored assets during ${reportingPeriod}, which trails the other detection drivers`,
      strengthDescription: `${pmTouches} PM touches across ${totalFitnessAssets} assets`,
    },
    {
      label: "Member Reporting",
      score: memberReportingScore,
      valueDescription: memberReportingAvailable,
      weaknessReason:
        `member reporting is ${memberReportingAvailable.toLowerCase()} during ${reportingPeriod}, reducing frontline issue visibility compared with the other detection drivers`,
      strengthDescription: memberReportingAvailable,
    },
  ];

  const sortedDrivers = [...detectionDrivers].sort((left, right) => left.score - right.score);
  const weakestDriver = sortedDrivers[0];
  const strongerDrivers = sortedDrivers.slice(1).sort((left, right) => right.score - left.score);

  const executiveSummary =
    `Detection is ${detectionSignal.status} primarily because ${weakestDriver.label} is the weakest driver ` +
    `(score ${formatScore(weakestDriver.score)}): ${weakestDriver.weaknessReason}. ` +
    `${strongerDrivers[0]?.label} (${strongerDrivers[0]?.strengthDescription}) and ${strongerDrivers[1]?.label} ` +
    `(${strongerDrivers[1]?.strengthDescription}) are stronger supporting drivers that partially offset this weakness but do not eliminate the overall Detection risk.`;

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
