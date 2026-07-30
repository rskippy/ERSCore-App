"use client";

import { useState } from "react";
import Link from "next/link";
import { calculateERS } from "@/lib/ers/scoreEngine";
import { getReadinessStatus, getReadinessStatusBadgeClasses } from "@/lib/ers/readinessStatus";
import {
  calculateRemainingErsOpportunity,
  formatRemainingErsOpportunity,
  signalWeights,
} from "@/lib/ers/remainingOpportunity";
import { FIXED_NPS } from "@/lib/ers/scenario/defaults";
import type { ScenarioInput } from "@/lib/ers/scenario/types";
import { useScenarioStore, type ScenarioLocation } from "@/lib/ers/scenario/store";

type NumericField = Exclude<keyof ScenarioInput, "memberReportingAvailable">;

function Field({
  label,
  value,
  min = 0,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (raw: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0f2238]">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-[#0f766e] bg-[#f2fbf8] px-4 py-3 text-base font-semibold text-[#0f2238] outline-none transition focus:border-[#0c5f58] focus:ring-2 focus:ring-[#0f766e]/30"
      />
    </label>
  );
}

export default function ScenarioBuilderPage() {
  const {
    selectedLocation,
    locations,
    scenarioInput,
    updateScenarioInput,
    resetScenarioInput,
    setSelectedLocation,
    ersSignalBundle,
  } = useScenarioStore();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const ersResult = calculateERS(ersSignalBundle.input);

  const opportunities = [
    {
      signalName: "Detection",
      score: ersSignalBundle.signals.detection.score,
      remaining: calculateRemainingErsOpportunity(
        ersSignalBundle.signals.detection.score,
        signalWeights.detection,
      ),
    },
    {
      signalName: "Average Recovery",
      score: ersSignalBundle.signals.averageRecovery.score,
      remaining: calculateRemainingErsOpportunity(
        ersSignalBundle.signals.averageRecovery.score,
        signalWeights.averageRecovery,
      ),
    },
    {
      signalName: "Repair Drag",
      score: ersSignalBundle.signals.repairDrag.score,
      remaining: calculateRemainingErsOpportunity(
        ersSignalBundle.signals.repairDrag.score,
        signalWeights.repairDrag,
      ),
    },
    {
      signalName: "Repair Durability",
      score: ersSignalBundle.signals.repairDurability.score,
      remaining: calculateRemainingErsOpportunity(
        ersSignalBundle.signals.repairDurability.score,
        signalWeights.repairDurability,
      ),
    },
  ].sort((left, right) => right.remaining - left.remaining);

  function commitCountField(field: NumericField, raw: string) {
    if (raw.trim() === "") {
      return;
    }

    const parsed = Number.parseInt(raw, 10);

    if (!Number.isFinite(parsed)) {
      return;
    }

    const result = updateScenarioInput({
      [field]: parsed,
    });

    if (!result.accepted) {
      setValidationMessage(result.error ?? "Input value is invalid.");
      return;
    }

    setValidationMessage(null);
  }

  function commitDaysField(raw: string) {
    if (raw.trim() === "") {
      return;
    }

    const parsed = Number.parseFloat(raw);

    if (!Number.isFinite(parsed)) {
      return;
    }

    const result = updateScenarioInput({
      averageDaysToClose: parsed,
    });

    if (!result.accepted) {
      setValidationMessage(result.error ?? "Input value is invalid.");
      return;
    }

    setValidationMessage(null);
  }

  function commitMemberReporting(available: boolean) {
    const result = updateScenarioInput({
      memberReportingAvailable: available,
    });

    if (!result.accepted) {
      setValidationMessage(result.error ?? "Input value is invalid.");
      return;
    }

    setValidationMessage(null);
  }

  return (
    <main className="min-h-screen bg-[#f7fcfa] text-[#0f2238]">
      <section className="mx-auto flex max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-12">
        <header className="rounded-[32px] border border-[#dcebe6] bg-white p-6 shadow-[0_24px_70px_-38px_rgba(15,34,56,0.28)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold text-[#0f2238] sm:text-4xl">ERS Scenario Builder</h1>
              <p className="mt-3 text-base leading-7 text-[#4f627d]">
                Model operational changes and instantly see their effect on Equipment Readiness Score.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-[#dcebe6] bg-[#f7fcfa] px-5 py-2.5 text-sm font-semibold text-[#0f2238] transition hover:border-[#0f766e] hover:bg-white hover:text-[#0f766e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-[#dcebe6] bg-[#f2fbf8] px-4 py-4">
            <label className="flex min-w-[16rem] flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f2238]">Location</span>
              <select
                value={selectedLocation}
                onChange={(event) => setSelectedLocation(event.target.value as ScenarioLocation)}
                className="rounded-2xl border border-[#0f766e] bg-white px-4 py-3 text-base font-semibold text-[#0f2238] outline-none transition focus:border-[#0c5f58] focus:ring-2 focus:ring-[#0f766e]/30"
                aria-label="Scenario location"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm font-semibold text-[#4f627d]">Editing this builder only affects {selectedLocation}.</p>
          </div>

          <div className="mt-6 rounded-2xl border border-[#0f766e] bg-[#f2fbf8] px-4 py-3 text-sm font-semibold text-[#0f766e]">
            Scenario Data Mode - Changes update the entire ERS application.
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <section className="space-y-5">
            <article className="rounded-[28px] border border-[#dcebe6] bg-white p-6 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] transition hover:shadow-[0_24px_64px_-40px_rgba(15,34,56,0.3)]">
              <h2 className="text-xl font-semibold text-[#0f2238]">Detection</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Work Orders Started"
                  value={scenarioInput.workOrdersStarted}
                  onChange={(raw) => commitCountField("workOrdersStarted", raw)}
                />
                <Field
                  label="Preventive Maintenance Touches"
                  value={scenarioInput.preventiveMaintenanceTouches}
                  onChange={(raw) => commitCountField("preventiveMaintenanceTouches", raw)}
                />
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0f2238]">Member Reporting Availability</span>
                  <select
                    value={scenarioInput.memberReportingAvailable ? "available" : "not-available"}
                    onChange={(event) => commitMemberReporting(event.target.value === "available")}
                    className="rounded-2xl border border-[#0f766e] bg-[#f2fbf8] px-4 py-3 text-base font-semibold text-[#0f2238] outline-none transition focus:border-[#0c5f58] focus:ring-2 focus:ring-[#0f766e]/30"
                  >
                    <option value="available">Available</option>
                    <option value="not-available">Not Available</option>
                  </select>
                </label>
              </div>
            </article>

            <article className="rounded-[28px] border border-[#dcebe6] bg-white p-6 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] transition hover:shadow-[0_24px_64px_-40px_rgba(15,34,56,0.3)]">
              <h2 className="text-xl font-semibold text-[#0f2238]">Average Recovery</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Average Days to Close"
                  value={scenarioInput.averageDaysToClose}
                  step={0.1}
                  onChange={commitDaysField}
                />
                <Field
                  label="Completed Equipment Work Orders"
                  value={scenarioInput.completedEquipmentWorkOrders}
                  onChange={(raw) => commitCountField("completedEquipmentWorkOrders", raw)}
                />
              </div>
            </article>

            <article className="rounded-[28px] border border-[#dcebe6] bg-white p-6 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] transition hover:shadow-[0_24px_64px_-40px_rgba(15,34,56,0.3)]">
              <h2 className="text-xl font-semibold text-[#0f2238]">Repair Drag</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Total Open Equipment Work Orders"
                  value={scenarioInput.totalOpenEquipmentWorkOrders}
                  onChange={(raw) => commitCountField("totalOpenEquipmentWorkOrders", raw)}
                />
                <Field
                  label="Older Than 15 Days"
                  value={scenarioInput.olderThan15Days}
                  max={scenarioInput.totalOpenEquipmentWorkOrders}
                  onChange={(raw) => commitCountField("olderThan15Days", raw)}
                />
                <Field
                  label="Older Than 30 Days"
                  value={scenarioInput.olderThan30Days}
                  max={scenarioInput.olderThan15Days}
                  onChange={(raw) => commitCountField("olderThan30Days", raw)}
                />
                <Field
                  label="Older Than 45 Days"
                  value={scenarioInput.olderThan45Days}
                  max={scenarioInput.olderThan30Days}
                  onChange={(raw) => commitCountField("olderThan45Days", raw)}
                />
              </div>
            </article>

            <article className="rounded-[28px] border border-[#dcebe6] bg-white p-6 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] transition hover:shadow-[0_24px_64px_-40px_rgba(15,34,56,0.3)]">
              <h2 className="text-xl font-semibold text-[#0f2238]">Repair Durability</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Total Monitored Assets"
                  value={scenarioInput.totalMonitoredAssets}
                  onChange={(raw) => commitCountField("totalMonitoredAssets", raw)}
                />
                <Field
                  label="Assets with 3+ Repairs"
                  value={scenarioInput.assetsWith3PlusRepairs}
                  max={scenarioInput.totalMonitoredAssets}
                  onChange={(raw) => commitCountField("assetsWith3PlusRepairs", raw)}
                />
              </div>
            </article>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  resetScenarioInput();
                  setValidationMessage(null);
                }}
                className="inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#15803d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/35"
              >
                Reset Sample Data
              </button>
              {validationMessage ? (
                <p className="text-sm font-semibold text-[#b91c1c]">{validationMessage}</p>
              ) : (
                <p className="text-sm text-[#4f627d]">Changes apply immediately across Dashboard, Analysis, and Opportunity pages.</p>
              )}
            </div>
          </section>

          <aside className="rounded-[28px] border border-[#dcebe6] bg-white p-6 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] lg:sticky lg:top-6 lg:self-start">
            <h2 className="text-xl font-semibold text-[#0f2238]">Projected Results</h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-[#dcebe6] bg-[#f7fcfa] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Overall ERS</p>
                <p className="mt-2 text-4xl font-semibold text-[#0f2238]">{ersResult.finalERS}</p>
                <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getReadinessStatusBadgeClasses(getReadinessStatus(ersResult.finalERS))}`}>
                  {getReadinessStatus(ersResult.finalERS)}
                </span>
              </div>

              <div className="rounded-2xl border border-[#dcebe6] bg-[#f7fcfa] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4f627d]">NPS Bonus (Fixed)</p>
                <p className="mt-2 text-2xl font-semibold text-[#0f2238]">+{ersResult.readinessBonus}</p>
                <p className="mt-1 text-sm text-[#4f627d]">Based on fixed NPS input: {FIXED_NPS}</p>
              </div>

              <div className="rounded-2xl border border-[#dcebe6] bg-[#f7fcfa] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Signal Scores</p>
                <div className="mt-3 space-y-2 text-sm text-[#0f2238]">
                  <div className="flex items-center justify-between">
                    <span>Detection</span>
                    <span className="font-semibold">{ersSignalBundle.signals.detection.score}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Recovery</span>
                    <span className="font-semibold">{ersSignalBundle.signals.averageRecovery.score}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Repair Drag</span>
                    <span className="font-semibold">{ersSignalBundle.signals.repairDrag.score}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Repair Durability</span>
                    <span className="font-semibold">{ersSignalBundle.signals.repairDurability.score}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#dcebe6] bg-[#f7fcfa] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Remaining ERS Opportunity</p>
                <div className="mt-3 space-y-2">
                  {opportunities.map((item) => (
                    <div key={item.signalName} className="flex items-center justify-between text-sm">
                      <span className="text-[#0f2238]">{item.signalName}</span>
                      <span className="font-semibold text-[#0f766e]">{formatRemainingErsOpportunity(item.remaining)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
