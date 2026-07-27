"use client";

import { useState } from "react";
import { OpportunityHeader } from "@/components/ers/opportunity-template";
import { getDetectionDriverScores } from "@/lib/ers/detection";
import { useScenarioStore } from "@/lib/ers/scenario/store";
import {
  calculateRemainingErsOpportunity,
  formatRemainingErsOpportunity,
  signalWeights,
} from "@/lib/ers/remainingOpportunity";

function formatScore(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export default function DetectionOpportunityWorkOrdersPage() {
  const [showDetectionEvidence, setShowDetectionEvidence] = useState(false);
  const { ersSignalBundle } = useScenarioStore();
  const detectionSignal = ersSignalBundle.signals.detection;
  const totalFitnessAssets = ersSignalBundle.input.totalFitnessAssets;
  const workOrdersStarted = ersSignalBundle.input.repairWorkOrdersStarted90Days;
  const pmTouches = ersSignalBundle.input.equipmentPMTouches90Days;
  const memberReportingEnabled = ersSignalBundle.input.equipmentSpecificReporting;
  const memberReportingAvailability = memberReportingEnabled ? "Available" : "Not Available";

  const workOrderLabel = workOrdersStarted === 1 ? "work order" : "work orders";
  const workOrderVerb = workOrdersStarted === 1 ? "was" : "were";
  const pmInspectionLabel = pmTouches === 1 ? "inspection" : "inspections";
  const pmInspectionVerb = pmTouches === 1 ? "was" : "were";

  const remainingErsOpportunity = formatRemainingErsOpportunity(
    calculateRemainingErsOpportunity(detectionSignal.score, signalWeights.detection),
  );

  const {
    workOrdersStartedScore,
    pmCoverageScore,
    memberReportingScore,
  } = getDetectionDriverScores(ersSignalBundle.input);

  const detectionDrivers = [
    { label: "Work Orders Started", score: workOrdersStartedScore },
    { label: "PM Completion", score: pmCoverageScore },
    { label: "Member Reporting", score: memberReportingScore },
  ];

  const weakestDriver = [...detectionDrivers].sort((left, right) => left.score - right.score)[0];

  const immediatePriority =
    weakestDriver.label === "Member Reporting" && !memberReportingEnabled
      ? "Enable member equipment reporting to improve issue visibility."
      : weakestDriver.label === "PM Completion"
        ? "Increase preventive maintenance completion to improve early issue detection."
        : "Increase equipment issue identification by encouraging earlier reporting and technician inspections.";

  const opportunityInsight =
    `The Detection score is primarily influenced by equipment issue visibility. During ${ersSignalBundle.reportingContext.reportingPeriod.toLowerCase()}, ` +
    `${workOrdersStarted} equipment ${workOrderLabel} ${workOrderVerb} initiated, ${pmTouches} preventive maintenance ${pmInspectionLabel} ${pmInspectionVerb} completed, ` +
    `and member reporting is ${memberReportingAvailability}. Improving issue detection earlier increases equipment readiness before failures become member experiences.`;

  return (
    <main className="min-h-screen bg-[#f7fcfa] text-[#0f2238]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-12">
        <OpportunityHeader
          organizationLabel={ersSignalBundle.reportingContext.organizationLabel}
          reportingPeriod={ersSignalBundle.reportingContext.reportingPeriod}
          lastUpdated={ersSignalBundle.reportingContext.lastUpdated}
          backHref="/opportunities/detection"
          backLabel="Back to Detection Analysis"
        />

        <section className="mt-8 rounded-[32px] border border-[#dcebe6] bg-white p-8 shadow-[0_24px_70px_-38px_rgba(15,34,56,0.28)] sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f766e]">Opportunity</p>
          <h1 className="mt-4 text-3xl font-semibold text-[#0f2238] sm:text-4xl">Detection Opportunity</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-[#4f627d]">
            Improve equipment readiness by increasing the early detection of equipment issues.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Current Signal Score</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{detectionSignal.score}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Remaining ERS Opportunity</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{remainingErsOpportunity}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Work Orders Started (90 Days)</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{workOrdersStarted}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Preventive Maintenance Touches (90 Days)</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{pmTouches}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Member Reporting Availability</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{memberReportingAvailability}</p>
            </div>
          </div>

          <section className="mt-6 rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6">
            <h2 className="text-xl font-semibold text-[#0f2238]">Opportunity Insight</h2>
            <p className="mt-3 text-base leading-7 text-[#4f627d]">{opportunityInsight}</p>
          </section>

          <section className="mt-6 rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6">
            <h2 className="text-xl font-semibold text-[#0f2238]">Immediate Priority</h2>
            <p className="mt-3 text-base font-semibold text-[#0f2238]">{immediatePriority}</p>
            <p className="mt-2 text-base leading-7 text-[#4f627d]">
              Strengthening the weakest Detection driver will produce the greatest improvement in Detection readiness.
            </p>
          </section>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowDetectionEvidence((value) => !value)}
              className="inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#15803d]"
            >
              {showDetectionEvidence ? "Hide Detection Evidence" : "View Detection Evidence"}
            </button>
          </div>
        </section>

        {showDetectionEvidence ? (
          <section className="mt-6 rounded-[32px] border border-[#dcebe6] bg-white p-6 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] sm:p-8">
            <div className="flex flex-col gap-4 border-b border-[#dcebe6] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#0f2238]">Detection Evidence</h2>
                <p className="mt-1 text-sm text-[#4f627d]">
                  Current Detection evidence derived from shared ERS inputs.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Work Orders Started (90 Days)</p>
                <p className="mt-3 text-2xl font-semibold text-[#0f2238]">{workOrdersStarted}</p>
              </div>
              <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Preventive Maintenance Touches (90 Days)</p>
                <p className="mt-3 text-2xl font-semibold text-[#0f2238]">{pmTouches}</p>
              </div>
              <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Member Reporting Availability</p>
                <p className="mt-3 text-2xl font-semibold text-[#0f2238]">{memberReportingAvailability}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-[#dcebe6] bg-white p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Work Orders Driver Score</p>
                <p className="mt-3 text-2xl font-semibold text-[#0f2238]">{formatScore(workOrdersStartedScore)}</p>
              </div>
              <div className="rounded-[24px] border border-[#dcebe6] bg-white p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">PM Completion Driver Score</p>
                <p className="mt-3 text-2xl font-semibold text-[#0f2238]">{formatScore(pmCoverageScore)}</p>
              </div>
              <div className="rounded-[24px] border border-[#dcebe6] bg-white p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Member Reporting Driver Score</p>
                <p className="mt-3 text-2xl font-semibold text-[#0f2238]">{formatScore(memberReportingScore)}</p>
              </div>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
