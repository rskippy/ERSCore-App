"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { getReadinessStatus, getReadinessStatusBadgeClasses } from "@/lib/ers/readinessStatus";
import { useScenarioStore, type ScenarioLocation } from "@/lib/ers/scenario/store";
import { useDemoScope } from "@/lib/ers/demo-scope/store";
import { createEnterpriseDashboardViewModel } from "./data";

type SignalName = "Average Recovery" | "Detection" | "Repair Drag" | "Repair Durability";

const SIGNAL_GUIDANCE: Record<SignalName, { meaning: string; steps: readonly string[] }> = {
  "Average Recovery": {
    meaning: "How quickly equipment is returned to service after an issue is identified.",
    steps: [
      "Review long-duration completed repairs",
      "Identify delays involving parts, approvals, vendors, or technician response",
      "Focus first on locations with the lowest Average Recovery scores",
    ],
  },
  Detection: {
    meaning:
      "How effectively the operation identifies equipment issues before they remain unnoticed by members.",
    steps: [
      "Increase preventive maintenance equipment touches",
      "Improve staff and member issue reporting",
      "Review locations generating unusually few equipment work orders",
    ],
  },
  "Repair Drag": {
    meaning: "The burden created by equipment issues that remain unresolved beyond 15 days.",
    steps: [
      "Review aging equipment work orders",
      "Remove parts, approval, vendor, and service bottlenecks",
      "Prioritize the oldest member-impacting issues",
    ],
  },
  "Repair Durability": {
    meaning:
      "Whether equipment is requiring repeated repairs, potentially indicating recurring failures, ineffective repairs, or assets approaching replacement.",
    steps: [
      "Review assets with repeated repairs",
      "Identify recurring failure patterns",
      "Determine whether continued repair or replacement is the better operational decision",
    ],
  },
};

export default function EnterpriseDashboardPage() {
  const router = useRouter();
  const { selectedLocation, locations, locationScenarioInputs, setSelectedLocation } = useScenarioStore();
  const { role, getVisibleLocations } = useDemoScope();

  // Demo-only: filter locations based on current role scope
  const visibleLocations = useMemo(
    () => getVisibleLocations(locations),
    [locations, getVisibleLocations],
  );

  // Manager role should not see enterprise view — redirect to dashboard
  if (role === "Manager") {
    return (
      <main className="bg-[#f7fcfa] text-[#0f2238]">
        <section className="mx-auto flex max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
          <div className="rounded-[36px] border border-[#dcebe6] bg-white p-8 text-center shadow-[0_30px_90px_-38px_rgba(15,34,56,0.55)]">
            <p className="text-lg font-semibold text-[#0f2238]">
              Manager role is limited to single-location dashboard.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 rounded-full border border-[#0f766e] bg-[#f2fbf8] px-4 py-2 font-semibold text-[#0f766e] transition hover:bg-[#e8f7f1]"
            >
              Go to Dashboard
            </button>
          </div>
        </section>
      </main>
    );
  }

  const enterpriseViewModel = useMemo(
    () => createEnterpriseDashboardViewModel(visibleLocations, locationScenarioInputs),
    [locationScenarioInputs, visibleLocations],
  );

  const { summary } = enterpriseViewModel;

  // Derive organizational opportunity from existing location results — no new scoring logic
  const orgOpportunity = useMemo(() => {
    const locs = enterpriseViewModel.locations;
    if (locs.length === 0) return null;
    const counts = new Map<string, number>();
    for (const loc of locs) {
      counts.set(loc.greatestOpportunity, (counts.get(loc.greatestOpportunity) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return {
      signal: sorted[0][0],
      count: sorted[0][1],
      total: locs.length,
      distribution: sorted.map(([signal, count]) => ({ signal, count })),
    };
  }, [enterpriseViewModel]);

  function openLocationDashboard(locationName: ScenarioLocation) {
    setSelectedLocation(locationName);
    router.push("/dashboard");
  }

  const guidance = orgOpportunity
    ? (SIGNAL_GUIDANCE[orgOpportunity.signal as SignalName] ?? null)
    : null;

  const locationWord = (n: number) => (n === 1 ? "location" : "locations");

  return (
    <main className="min-h-screen bg-[#f7fcfa] text-[#0f2238]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">

        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-[#dcebe6] bg-white/90 px-4 py-3 shadow-[0_18px_55px_-32px_rgba(15,34,56,0.4)] backdrop-blur">
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto lg:w-1/4 lg:min-w-[18rem]">
            <span className="inline-flex w-[340px] max-w-full shrink-0 items-center justify-start">
              <Image src="/logo.png" alt="ERS logo" width={340} height={58} className="h-auto w-full object-contain" priority />
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold text-[#0f2238]">Enterprise Intelligence</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[#4f627d] lg:flex-1 lg:justify-end">
            <Link
              href="/scenario-builder"
              className="rounded-full border border-[#0f766e] bg-[#f2fbf8] px-4 py-2 font-semibold text-[#0f766e] transition hover:bg-[#e8f7f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
            >
              Scenario Builder
            </Link>
          </div>
        </header>

        {/* HOW ARE WE DOING + WHERE IS THE OPPORTUNITY */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">

          {/* Organization ERS hero */}
          <section className="rounded-[36px] border border-[#dcebe6] bg-[#0f2238] p-6 text-white shadow-[0_30px_90px_-38px_rgba(15,34,56,0.55)] sm:p-7 lg:self-start lg:p-8">
            <div className="space-y-6">
              <div className="max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7dd3c0]">
                  Organization ERS
                </p>
                <div className="mt-4 flex flex-wrap items-end gap-4">
                  <div className="text-7xl font-semibold leading-none sm:text-8xl lg:text-[6.75rem]">
                    {summary.organizationErs}
                  </div>
                  <div className="space-y-2">
                    <p className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold uppercase tracking-[0.25em] ${getReadinessStatusBadgeClasses(getReadinessStatus(summary.organizationErs))}`}>
                      {getReadinessStatus(summary.organizationErs)}
                    </p>
                    <p className="text-sm text-[#8ba8b7]">
                      Across {summary.totalLocations} {locationWord(summary.totalLocations)}
                    </p>
                    <p className="text-sm text-[#8ba8b7]">
                      <span className="text-[#d7f5ea]">ERS Benchmark: 69.78</span>
                      {summary.organizationErs >= 69.78 ? (
                        <span className="ml-1 text-[#7dd3c0]">· +{(summary.organizationErs - 69.78).toFixed(2)} above benchmark</span>
                      ) : (
                        <span className="ml-1 text-[#f6b7b7]">· {(summary.organizationErs - 69.78).toFixed(2)} below benchmark</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7dd3c0]">
                  Portfolio Distribution
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Strong", count: summary.strongLocations, range: "85+" },
                    { label: "Stable", count: summary.stableLocations, range: "70–84" },
                    { label: "At Risk", count: summary.atRiskLocations, range: "55–69" },
                    { label: "Critical", count: summary.criticalLocations, range: "<55" },
                  ].map((band) => (
                    <div key={band.label} className="rounded-[16px] border border-white/10 bg-[#123447] px-3 py-3 text-center">
                      <p className="text-2xl font-semibold text-white">{band.count}</p>
                      <p className="mt-1 text-sm font-semibold text-[#d7f5ea]">{band.label}</p>
                      <p className="text-xs text-[#8ba8b7]">{band.range}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Greatest Organizational Opportunity */}
          {orgOpportunity ? (
            <aside className="rounded-[32px] border border-[#dcebe6] bg-white p-6 shadow-[0_25px_70px_-38px_rgba(15,34,56,0.3)] sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0f766e]">
                Greatest Organizational Opportunity
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[#0f2238]">{orgOpportunity.signal}</h2>
              <div className="mt-3 inline-flex rounded-full border border-[#c8e8de] bg-[#f2fbf8] px-4 py-2 text-sm font-semibold text-[#0f766e]">
                {orgOpportunity.count} of {orgOpportunity.total} {locationWord(orgOpportunity.total)}
              </div>
              <p className="mt-4 text-lg leading-7 text-[#4f627d]">
                {orgOpportunity.signal} is the leading improvement opportunity across{" "}
                {orgOpportunity.count} of {orgOpportunity.total} {locationWord(orgOpportunity.total)}.
              </p>

              {guidance ? (
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">What It Means</p>
                    <p className="mt-2 text-sm leading-7 text-[#4f627d]">{guidance.meaning}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">How To Improve</p>
                    <ul className="mt-2 space-y-1">
                      {guidance.steps.map((step) => (
                        <li key={step} className="flex items-start gap-2 text-sm leading-6 text-[#4f627d]">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0f766e]" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              <div className="mt-5 rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">By Signal</p>
                <div className="mt-3 space-y-2">
                  {orgOpportunity.distribution.map(({ signal, count }) => (
                    <div key={signal} className="flex items-center justify-between text-sm">
                      <span className={signal === orgOpportunity.signal ? "font-semibold text-[#0f2238]" : "text-[#4f627d]"}>
                        {signal}
                      </span>
                      <span className={signal === orgOpportunity.signal ? "font-semibold text-[#0f766e]" : "text-[#4f627d]"}>
                        {count} {locationWord(count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          ) : null}
        </div>

        {/* WHERE SHOULD I LOOK — ranked location detail */}
        <section className="mt-5 rounded-[32px] border border-[#dcebe6] bg-white p-6 shadow-[0_25px_70px_-38px_rgba(15,34,56,0.3)] sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f766e]">Locations by ERS</p>
            <p className="text-sm text-[#4f627d]">Highest to lowest</p>
          </div>

          <div className="mt-5 overflow-x-auto rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa]">
            <table className="min-w-full border-collapse text-left text-sm text-[#0f2238]">
              <thead>
                <tr className="border-b border-[#dcebe6] bg-white text-xs font-semibold uppercase tracking-[0.2em] text-[#4f627d]">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">ERS</th>
                  <th className="px-4 py-3">Detection</th>
                  <th className="px-4 py-3">Average Recovery</th>
                  <th className="px-4 py-3">Repair Drag</th>
                  <th className="px-4 py-3">Repair Durability</th>
                  <th className="px-4 py-3">Greatest Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {enterpriseViewModel.locations.map((location, index) => (
                  <tr
                    key={location.locationName}
                    className="cursor-pointer border-b border-[#e7f2ee] align-top transition hover:bg-[#edf8f5] focus-visible:bg-[#edf8f5]"
                    onClick={() => openLocationDashboard(location.locationName)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openLocationDashboard(location.locationName);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`Open ${location.locationName} dashboard`}
                    data-location-row={location.locationName}
                  >
                    <td className="px-4 py-4 font-semibold text-[#4f627d]">#{index + 1}</td>
                    <td className="px-4 py-4 font-semibold text-[#0f766e]">{location.locationName}</td>
                    <td className="px-4 py-4 font-semibold text-[#0f2238]">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getReadinessStatusBadgeClasses(getReadinessStatus(location.overallErs))}`}>
                        {location.overallErs}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#0f2238]">{location.detection}</td>
                    <td className="px-4 py-4 font-semibold text-[#0f2238]">{location.averageRecovery}</td>
                    <td className="px-4 py-4 font-semibold text-[#0f2238]">{location.repairDrag}</td>
                    <td className="px-4 py-4 font-semibold text-[#0f2238]">{location.repairDurability}</td>
                    <td className="px-4 py-4 text-[#4f627d]">{location.greatestOpportunity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </section>
    </main>
  );
}

