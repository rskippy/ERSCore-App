"use client";

import Image from "next/image";
import Link from "next/link";
import { getReadinessStatus, getReadinessStatusBadgeClasses, getReadinessStatusCardClasses } from "@/lib/ers/readinessStatus";
import { useScenarioStore } from "@/lib/ers/scenario/store";
import { createDashboardViewModel } from "./data";

function DriverCard({
  label,
  score,
  status,
  trend,
  explanation,
  href,
  opportunity,
  isGreatestOpportunity = false,
}: {
  label: string;
  score: number;
  status: string;
  trend: string;
  explanation: string;
  href?: string;
  opportunity?: string;
  isGreatestOpportunity?: boolean;
}) {
  const trendStyles =
    trend === "Improving"
      ? {
          pillClass: "border-[#c8e8de] bg-[#f2fbf8] text-[#0f766e]",
          dotClass: "bg-[#16a34a]",
        }
      : trend === "Declining"
        ? {
            pillClass: "border-[#f6d7d7] bg-[#fef4f4] text-[#b91c1c]",
            dotClass: "bg-[#dc2626]",
          }
        : {
            pillClass: "border-[#dcebe6] bg-[#f7fcfa] text-[#4f627d]",
            dotClass: "bg-[#0f2238]",
          };

  const cardClasses = `rounded-[24px] border p-5 transition hover:border-[#0f766e] hover:shadow-[0_16px_40px_-28px_rgba(15,34,56,0.28)] ${
    isGreatestOpportunity
      ? "border-[#0f766e] bg-[#f2fbf8] shadow-[0_16px_40px_-28px_rgba(15,34,56,0.28)]"
      : "border-[#dcebe6] bg-[#f7fcfa]"
  }`;

  const content = (
    <div className={cardClasses}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="text-lg font-semibold text-[#0f2238]">{label}</h4>
            {isGreatestOpportunity ? (
              <span className="rounded-full border border-[#c8e8de] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
                Greatest Opportunity
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold text-[#0f2238]">{score}</span>
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] ${getReadinessStatusBadgeClasses(status)}`}>
              {status}
            </span>
          </div>
        </div>

        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${trendStyles.pillClass}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${trendStyles.dotClass}`} />
          <span>{trend}</span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-7 text-[#4f627d]">{explanation}</p>
      {opportunity ? (
        <div className="mt-3 inline-flex rounded-full border border-[#c8e8de] bg-[#f2fbf8] px-3 py-2 text-sm font-semibold text-[#0f766e]">
          Opportunity: {opportunity}
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default function DashboardPage() {
  const { ersSignalBundle, scenarioInput } = useScenarioStore();
  const dashboardViewModel = createDashboardViewModel(ersSignalBundle, scenarioInput);

  const {
    organizationLabel,
    reportingPeriod,
    lastUpdated,
    overallScore,
    potentialImprovement,
    trendValue,
    trendLabel,
    opportunity,
    executiveSummary,
    readinessDrivers,
  } = dashboardViewModel;

  const opportunityHrefMap: Record<string, string> = {
    Detection: "/opportunities/detection",
    "Average Recovery": "/opportunities/average-recovery",
    "Repair Drag": "/opportunities/repair-drag",
    "Repair Durability": "/opportunities/repair-durability",
  };

  const opportunityHref =
    opportunity.signalName === "Repair Drag"
      ? "/opportunities/repair-drag/work-orders"
      : opportunityHrefMap[opportunity.signalName] ?? "/opportunities/repair-drag";
  const sortedReadinessDrivers = [...readinessDrivers].sort((left, right) => left.score - right.score);

  return (
    <main className="bg-[#f7fcfa] text-[#0f2238]">
      <section className="mx-auto flex max-w-7xl flex-col px-6 py-5 sm:px-8 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-[#dcebe6] bg-white/90 px-4 py-3 shadow-[0_18px_55px_-32px_rgba(15,34,56,0.4)] backdrop-blur">
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto lg:w-1/4 lg:min-w-[18rem]">
            <span className="inline-flex h-11 w-[260px] shrink-0 items-center justify-center">
              <Image src="/logo.png" alt="ERS logo" width={260} height={44} className="h-11 w-[260px] object-contain" priority />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#0f766e]">
                Equipment Readiness Score™
              </p>
              <p className="text-base font-semibold text-[#0f2238]">Executive Intelligence</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[#4f627d] lg:flex-1 lg:justify-end">
            <div className="flex items-center gap-2 rounded-full border border-[#dcebe6] bg-[#f9fdfb] px-4 py-2 font-semibold text-[#0f2238]">
              <span className="text-[#0f766e]">◉</span>
              <span>{organizationLabel}</span>
            </div>
            <Link
              href="/scenario-builder"
              className="rounded-full border border-[#0f766e] bg-[#f2fbf8] px-4 py-2 font-semibold text-[#0f766e] transition hover:bg-[#e8f7f1]"
            >
              Scenario Builder
            </Link>
            <div className="rounded-full border border-[#dcebe6] bg-white px-4 py-2 font-semibold text-[#0f2238]">
              {reportingPeriod}
            </div>
            <p className="text-sm text-[#4f627d]">{lastUpdated}</p>
          </div>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
          <section className="rounded-[36px] border border-[#dcebe6] bg-[#0f2238] p-6 text-white shadow-[0_30px_90px_-38px_rgba(15,34,56,0.55)] sm:p-7 lg:p-8">
            <div className="space-y-6">
              <div className="max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7dd3c0]">
                  Equipment Readiness Score™
                </p>
                <div className="mt-4 flex flex-wrap items-end gap-4">
                  <div className="text-7xl font-semibold leading-none sm:text-8xl lg:text-[6.75rem]">
                    {overallScore}
                  </div>
                  <div className="space-y-2">
                    <p className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold uppercase tracking-[0.25em] ${getReadinessStatusBadgeClasses(getReadinessStatus(overallScore))}`}>
                      {getReadinessStatus(overallScore)}
                    </p>
                    <p className="text-lg font-semibold text-[#d7f5ea]">{trendValue}</p>
                    <p className="text-sm text-[#8ba8b7]">{trendLabel}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-[18px] border border-white/10 bg-[#123447] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8ba8b7]">
                    Highest Impact Opportunity
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#d7f5ea]">{potentialImprovement}</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7dd3c0]">
                    Readiness Drivers
                  </p>
                  <p className="text-xs text-[#8ba8b7]">Live signal scoring</p>
                </div>

                <div className="mt-3 rounded-[18px] border border-white/10 bg-[#123447] p-4">
                  <div className="grid grid-cols-[1.5fr_0.6fr_0.9fr] gap-2 border-b border-white/10 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8ba8b7]">
                    <p>Signal</p>
                    <p className="text-right">Score</p>
                    <p className="text-right">Status</p>
                  </div>

                  <div className="mt-2 space-y-2">
                    {sortedReadinessDrivers.map((driver) => (
                      <Link
                        key={driver.signalName}
                        href={opportunityHrefMap[driver.signalName] ?? "/dashboard"}
                        className="block cursor-pointer"
                      >
                        <div className="grid grid-cols-[1.5fr_0.6fr_0.9fr] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#edf8f5] transition hover:bg-white/10 hover:border-white/20">
                          <p className="font-semibold">{driver.signalName}</p>
                          <p className="text-right font-semibold">{driver.score}</p>
                          <div className="text-right">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getReadinessStatusBadgeClasses(getReadinessStatus(driver.score))}`}>
                              {getReadinessStatus(driver.score)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7dd3c0]">
                    Executive Summary
                  </p>
                  <p className="mt-3 text-base leading-7 text-[#edf8f5]">{executiveSummary}</p>
                </div>
              </div>
            </div>
          </section>

          <Link href={opportunityHref} className="block rounded-[32px] outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7fcfa]">
          <aside className="rounded-[32px] border border-[#dcebe6] bg-white p-6 shadow-[0_25px_70px_-38px_rgba(15,34,56,0.3)] transition hover:border-[#0f766e] sm:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0f766e]">
                {opportunity.title}
              </p>
              <span className="rounded-full border border-[#c8e8de] bg-[#f2fbf8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
                Greatest Opportunity
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[#0f2238]">{opportunity.heading}</h2>
            <div className="mt-3 inline-flex rounded-full border border-[#c8e8de] bg-[#f2fbf8] px-4 py-2 text-sm font-semibold text-[#0f766e]">
              {opportunity.improvement}
            </div>
            <p className="mt-4 text-lg leading-7 text-[#4f627d]">{opportunity.statement}</p>

            <div className="mt-5 rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Signal</p>
                  <p className="mt-2 text-lg font-semibold text-[#0f2238]">{opportunity.signalName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Current Signal Score</p>
                  <p className="mt-2 text-lg font-semibold text-[#0f2238]">{opportunity.currentSignalScore}</p>
                </div>
                <div className={`rounded-[16px] border p-3 ${getReadinessStatusCardClasses(getReadinessStatus(opportunity.currentSignalScore))}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Status</p>
                  <p className="mt-2 text-lg font-semibold text-[#0f2238]">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getReadinessStatusBadgeClasses(getReadinessStatus(opportunity.currentSignalScore))}`}>
                      {getReadinessStatus(opportunity.currentSignalScore)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Remaining ERS Opportunity</p>
                  <p className="mt-2 text-lg font-semibold text-[#0f2238]">{opportunity.remainingErsOpportunity}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm leading-7 text-[#4f627d]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">Primary Driver</p>
                  <p className="mt-2 text-[#0f2238]">{opportunity.primaryDriver}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">Supporting Driver</p>
                  <p className="mt-2 text-[#0f2238]">{opportunity.supportingDriver}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">Recommended Action</p>
                  <p className="mt-2 text-[#0f2238]">{opportunity.recommendedAction}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#15803d]">
              {opportunity.buttonLabel}
            </div>
          </aside>
          </Link>
        </div>

      </section>
    </main>
  );
}
