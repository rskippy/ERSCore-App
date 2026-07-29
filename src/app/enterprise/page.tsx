"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { getReadinessStatus, getReadinessStatusBadgeClasses } from "@/lib/ers/readinessStatus";
import { useScenarioStore, type ScenarioLocation } from "@/lib/ers/scenario/store";
import { createEnterpriseDashboardViewModel } from "./data";

export default function EnterpriseDashboardPage() {
  const router = useRouter();
  const { selectedLocation, locations, locationScenarioInputs, setSelectedLocation } = useScenarioStore();

  const enterpriseViewModel = useMemo(
    () => createEnterpriseDashboardViewModel(locations, locationScenarioInputs),
    [locationScenarioInputs, locations],
  );

  const { summary } = enterpriseViewModel;

  function openLocationDashboard(locationName: ScenarioLocation) {
    setSelectedLocation(locationName);
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f7fcfa] text-[#0f2238]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-[#dcebe6] bg-white/90 px-4 py-3 shadow-[0_18px_55px_-32px_rgba(15,34,56,0.4)] backdrop-blur">
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto lg:w-1/4 lg:min-w-[18rem]">
            <span className="inline-flex w-[340px] max-w-full shrink-0 items-center justify-start">
              <Image src="/logo.png" alt="ERS logo" width={340} height={58} className="h-auto w-full object-contain" priority />
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold text-[#0f2238]">Enterprise Dashboard</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[#4f627d] lg:flex-1 lg:justify-end">
            <div className="flex items-center gap-2 rounded-full border border-[#dcebe6] bg-[#f9fdfb] px-4 py-2 font-semibold text-[#0f2238]">
              <span className="text-[#0f766e]">o</span>
              <span>All Locations</span>
            </div>
            <div className="rounded-full border border-[#dcebe6] bg-white px-4 py-2 font-semibold text-[#0f2238]">
              Selected: {selectedLocation}
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-[32px] border border-[#dcebe6] bg-white p-6 shadow-[0_25px_70px_-38px_rgba(15,34,56,0.3)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f766e]">Organization Summary</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 shadow-[0_14px_34px_-30px_rgba(15,34,56,0.28)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Organization ERS</p>
              <div className="mt-3">
                <span className={`inline-flex rounded-full border px-4 py-2 text-2xl font-semibold ${getReadinessStatusBadgeClasses(getReadinessStatus(summary.organizationErs))}`}>
                  {summary.organizationErs}
                </span>
              </div>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Total Locations</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{summary.totalLocations}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Strong (85+)</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{summary.strongLocations}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Stable (70-84.9)</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{summary.stableLocations}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">At Risk (55-69.9)</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{summary.atRiskLocations}</p>
            </div>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5 transition hover:border-[#c8e8de] hover:bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Critical (&lt;55)</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{summary.criticalLocations}</p>
            </div>
          </div>
        </section>

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
