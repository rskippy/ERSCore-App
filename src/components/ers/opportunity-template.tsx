import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ExecutiveReadinessInsight, type ExecutiveReadinessInsightSection } from "@/components/ers/executive-readiness-insight";
import { getReadinessStatusBadgeClasses, getReadinessStatusCardClasses } from "@/lib/ers/readinessStatus";

export type OpportunityHeaderProps = {
  organizationLabel: string;
  reportingPeriod: string;
  lastUpdated: string;
  backHref?: string;
  backLabel?: string;
};

export type ScoreMetric = {
  label: string;
  value: string;
  description?: string;
};

export type SupportingMetric = {
  label: string;
  value: string;
};

export type AgingDistributionSegment = {
  label: string;
  value: number;
  color: string;
};

export type FormulaCardProps = {
  title: string;
  formula: string;
  description: string;
};

export type ScoreSummaryProps = {
  sectionLabel: string;
  title: string;
  priority: string;
  improvement: string;
  currentScore: number | string;
  statement: string;
  whyThisMatters: string;
  scoreLabel?: string;
};

export type RecommendationProps = {
  title: string;
  items: string[];
  ctaLabel: string;
  ctaHref: string;
};

export type ExpectedErsGainProps = {
  title: string;
  description: string;
};

export type EvidenceTableColumn = {
  key: string;
  label: string;
};

export type EvidenceTableRow = Record<string, string | number>;

export type ContributingRecordsTableProps = {
  title: string;
  description: string;
  informationalMessage: string;
  columns: EvidenceTableColumn[];
  rows: EvidenceTableRow[];
};

export type ScoreInputsProps = {
  title: string;
  description: string;
  metrics: ScoreMetric[];
};

export type SupportingMetricsProps = {
  title: string;
  metrics: SupportingMetric[];
};

export type OpportunityTemplateProps = {
  header: OpportunityHeaderProps;
  summary: ScoreSummaryProps;
  formula: FormulaCardProps;
  scoreInputs: ScoreInputsProps;
  supportingMetrics: SupportingMetricsProps;
  recommendation: RecommendationProps;
  expectedErsGain: ExpectedErsGainProps;
  evidenceTable: ContributingRecordsTableProps;
  agingDistribution: AgingDistributionSegment[];
  executiveReadinessInsight?: ExecutiveReadinessInsightSection[];
};

export type ExecutiveSignalHeader = {
  signalName: string;
  currentScore: number | string;
  status: string;
  estimatedErsImpact: string;
  trend: string;
};

export type LearnMoreSection = {
  title: string;
  content: ReactNode;
};

export type ExecutiveFirstOpportunityLayoutProps = {
  header: OpportunityHeaderProps;
  signalHeader: ExecutiveSignalHeader;
  executiveSummary: string;
  evidence: ReactNode;
  recommendedActions?: {
    title?: string;
    items: string[];
    ctaLabel?: string;
    ctaHref?: string;
  };
  learnMoreSections?: LearnMoreSection[];
  showHeaderLabel?: boolean;
  showSignalNameLabel?: boolean;
  showStatusPill?: boolean;
  showEstimatedErsImpact?: boolean;
  showRecommendedActions?: boolean;
  showLearnMore?: boolean;
};

export function OpportunityHeader({ organizationLabel, reportingPeriod, lastUpdated, backHref = "/dashboard", backLabel = "Back to Dashboard" }: OpportunityHeaderProps) {
  return (
    <header className="rounded-[32px] border border-[#dcebe6] bg-white p-7 shadow-[0_28px_80px_-40px_rgba(15,34,56,0.35)] sm:p-8 lg:p-9">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto lg:w-1/4 lg:min-w-[18rem]">
          <span className="inline-flex h-11 w-[260px] shrink-0 items-center justify-center">
            <Image src="/logo.png" alt="ERS logo" width={260} height={44} className="h-11 w-[260px] object-contain" priority />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#0f766e]">
              Equipment Readiness Score™
            </p>
            <p className="text-base font-semibold text-[#0f2238]">Opportunity Detail</p>
          </div>
        </div>

        <Link
          href={backHref}
          className="inline-flex items-center rounded-full border border-[#dcebe6] bg-[#f7fcfa] px-4 py-2 text-sm font-semibold text-[#0f2238] transition hover:border-[#0f766e] hover:text-[#0f766e]"
        >
          {backLabel}
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#4f627d]">
        <div className="rounded-full border border-[#dcebe6] bg-[#f9fdfb] px-4 py-2 font-semibold text-[#0f2238]">
          {organizationLabel}
        </div>
        <div className="rounded-full border border-[#dcebe6] bg-white px-4 py-2 font-semibold text-[#0f2238]">
          {reportingPeriod}
        </div>
        <p className="rounded-full border border-[#dcebe6] bg-white px-4 py-2 text-[#4f627d]">
          Last updated: {lastUpdated}
        </p>
      </div>
    </header>
  );
}

export function ScoreSummary({ sectionLabel, title, priority, improvement, currentScore, statement, whyThisMatters, scoreLabel = "Current Repair Drag score" }: ScoreSummaryProps) {
  return (
    <section className="rounded-[32px] border border-[#dcebe6] bg-white p-8 shadow-[0_24px_70px_-38px_rgba(15,34,56,0.28)] sm:p-9">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f766e]">{sectionLabel}</p>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f2238] sm:text-4xl">{title}</h1>
          <div className={`mt-4 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getReadinessStatusBadgeClasses(priority)}`}>
            Priority: {priority}
          </div>
        </div>

        <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Potential improvement</p>
          <p className="mt-2 text-2xl font-semibold text-[#0f2238]">{improvement}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">{scoreLabel}</p>
          <p className="mt-3 text-4xl font-semibold text-[#0f2238]">{currentScore}</p>
        </div>
        <div className="rounded-[24px] border border-[#c8e8de] bg-[#f2fbf8] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0f766e]">Supporting statement</p>
          <p className="mt-3 text-lg leading-8 text-[#0f2238]">{statement}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f766e]">Why this matters</p>
        <p className="mt-4 text-lg leading-8 text-[#0f2238]">{whyThisMatters}</p>
      </div>
    </section>
  );
}

export function FormulaCard({ title, formula, description }: FormulaCardProps) {
  return (
    <div className="rounded-[24px] border border-[#dcebe6] bg-white p-6 shadow-[0_16px_44px_-30px_rgba(15,34,56,0.22)]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">{title}</p>
      <p className="mt-4 whitespace-pre-line text-lg font-semibold text-[#0f2238]">{formula}</p>
      <p className="mt-3 text-sm leading-7 text-[#4f627d]">{description}</p>
    </div>
  );
}

export function ScoreInputs({ title, description, metrics }: ScoreInputsProps) {
  return (
    <section className="rounded-[32px] border border-[#dcebe6] bg-white p-8 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] sm:p-9">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[#0f2238]">{title}</h2>
        <p className="text-sm text-[#4f627d]">{description}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{metric.value}</p>
            {metric.description ? (
              <p className="mt-3 text-sm leading-7 text-[#4f627d]">{metric.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function SupportingMetrics({ title, metrics }: SupportingMetricsProps) {
  return (
    <section className="rounded-[32px] border border-[#dcebe6] bg-[#f7fcfa] p-8 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.2)] sm:p-9">
      <h2 className="text-xl font-semibold text-[#0f2238]">{title}</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[18px] border border-[#dcebe6] bg-white p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f627d]">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#0f2238]">{metric.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Recommendation({ title, items, ctaLabel, ctaHref }: RecommendationProps) {
  return (
    <section className="rounded-[32px] border border-[#dcebe6] bg-white p-8 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] sm:p-9">
      <h2 className="text-xl font-semibold text-[#0f2238]">{title}</h2>
      <ol className="mt-6 space-y-4">
        {items.map((action, index) => (
          <li key={action} className="flex gap-3 rounded-[20px] border border-[#dcebe6] bg-[#f7fcfa] p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f766e] text-sm font-semibold text-white">
              {index + 1}
            </span>
            <p className="text-base leading-7 text-[#0f2238]">{action}</p>
          </li>
        ))}
      </ol>

      <Link
        href={ctaHref}
        className="mt-8 inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#15803d]"
      >
        {ctaLabel}
      </Link>
    </section>
  );
}

export function ExpectedErsGain({ title, description }: ExpectedErsGainProps) {
  return (
    <aside className="rounded-[32px] border border-[#dcebe6] bg-[#0f2238] p-8 text-white shadow-[0_20px_60px_-38px_rgba(15,34,56,0.3)] sm:p-9">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7dd3c0]">{title}</p>
      <p className="mt-5 whitespace-pre-line text-2xl leading-10 font-semibold text-[#edf8f5]">{description}</p>
    </aside>
  );
}

export function ContributingRecordsTable({ title, description, informationalMessage, columns, rows }: ContributingRecordsTableProps) {
  return (
    <section className="mt-6 rounded-[32px] border border-[#dcebe6] bg-white p-6 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] sm:p-8">
      <div className="flex flex-col gap-3 border-b border-[#dcebe6] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0f2238]">{title}</h2>
          <p className="mt-1 text-sm text-[#4f627d]">{description}</p>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-[#dcebe6] bg-[#f7fcfa] p-4 text-sm leading-7 text-[#4f627d]">
        {informationalMessage}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm text-[#0f2238]">
          <thead>
            <tr className="border-b border-[#dcebe6] bg-[#f7fcfa] text-xs font-semibold uppercase tracking-[0.24em] text-[#4f627d]">
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.location ?? "row"}-${index}`} className="border-b border-[#eef6f2] align-top">
                {columns.map((column) => {
                  const cellValue = row[column.key];
                  const isStatusColumn = column.key.toLowerCase().includes("status");
                  return (
                    <td key={`${column.key}-${index}`} className="px-4 py-4 text-[#4f627d]">
                      {isStatusColumn && typeof cellValue === "string" ? (
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getReadinessStatusBadgeClasses(cellValue)}`}>
                          {cellValue}
                        </span>
                      ) : (
                        cellValue ?? "-"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ExecutiveFirstOpportunityLayout({
  header,
  signalHeader,
  executiveSummary,
  evidence,
  recommendedActions,
  learnMoreSections,
  showHeaderLabel = true,
  showSignalNameLabel = true,
  showStatusPill = true,
  showEstimatedErsImpact = true,
  showRecommendedActions = true,
  showLearnMore = true,
}: ExecutiveFirstOpportunityLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f7fcfa] text-[#0f2238]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-12">
        <OpportunityHeader
          organizationLabel={header.organizationLabel}
          reportingPeriod={header.reportingPeriod}
          lastUpdated={header.lastUpdated}
          backHref={header.backHref}
          backLabel={header.backLabel}
        />

        <section className="mt-8 rounded-[32px] border border-[#dcebe6] bg-white p-8 shadow-[0_24px_70px_-38px_rgba(15,34,56,0.28)] sm:p-9">
          {showHeaderLabel ? (
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f766e]">Header</p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
            <div>
              {showSignalNameLabel ? (
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Signal Name</p>
              ) : null}
              <h1 className="mt-2 text-3xl font-semibold text-[#0f2238] sm:text-4xl">{signalHeader.signalName}</h1>
            </div>
            {showStatusPill ? (
              <div className="inline-flex rounded-full border border-[#dcebe6] bg-[#f7fcfa] px-4 py-2 text-sm font-semibold text-[#0f2238]">
                Status: <span className={`ml-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${getReadinessStatusBadgeClasses(signalHeader.status)}`}>{signalHeader.status}</span>
              </div>
            ) : null}
          </div>

          <div className={`mt-8 grid gap-4 ${showEstimatedErsImpact ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Current Score</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{signalHeader.currentScore}</p>
            </div>
            <div className={`rounded-[24px] border p-5 ${getReadinessStatusCardClasses(signalHeader.status)}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Status</p>
              <div className="mt-3">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getReadinessStatusBadgeClasses(signalHeader.status)}`}>
                  {signalHeader.status}
                </span>
              </div>
            </div>
            {showEstimatedErsImpact ? (
              <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Estimated ERS Impact</p>
                <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{signalHeader.estimatedErsImpact}</p>
              </div>
            ) : null}
            <div className="rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f627d]">Trend</p>
              <p className="mt-3 text-3xl font-semibold text-[#0f2238]">{signalHeader.trend}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[32px] border border-[#dcebe6] bg-[#0f2238] p-8 text-white shadow-[0_20px_60px_-38px_rgba(15,34,56,0.3)] sm:p-9">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7dd3c0]">Executive Summary</h2>
          <p className="mt-5 text-lg leading-8 text-[#edf8f5]">{executiveSummary}</p>
        </section>

        <section className="mt-6 rounded-[32px] border border-[#dcebe6] bg-white p-8 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] sm:p-9">
          <h2 className="text-xl font-semibold text-[#0f2238]">Evidence</h2>
          <div className="mt-6">{evidence}</div>
        </section>

        {showRecommendedActions && recommendedActions ? (
          <section className="mt-6 rounded-[32px] border border-[#dcebe6] bg-white p-8 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.24)] sm:p-9">
            <h2 className="text-xl font-semibold text-[#0f2238]">{recommendedActions.title ?? "Recommended Actions"}</h2>
            <ol className="mt-6 space-y-4">
              {recommendedActions.items.map((action, index) => (
                <li key={action} className="flex gap-3 rounded-[20px] border border-[#dcebe6] bg-[#f7fcfa] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f766e] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-base leading-7 text-[#0f2238]">{action}</p>
                </li>
              ))}
            </ol>

            {recommendedActions.ctaLabel && recommendedActions.ctaHref ? (
              <Link
                href={recommendedActions.ctaHref}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#15803d]"
              >
                {recommendedActions.ctaLabel}
              </Link>
            ) : null}
          </section>
        ) : null}

        {showLearnMore && learnMoreSections ? (
          <section className="mt-6 rounded-[32px] border border-[#dcebe6] bg-[#f7fcfa] p-8 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.2)] sm:p-9">
            <h2 className="text-xl font-semibold text-[#0f2238]">Learn More</h2>
            <div className="mt-6 space-y-4">
              {learnMoreSections.map((section) => (
                <details key={section.title} className="rounded-[20px] border border-[#dcebe6] bg-white p-5">
                  <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
                    {section.title}
                  </summary>
                  <div className="mt-4 text-[15px] leading-7 text-[#0f2238]">{section.content}</div>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

export function ERSOpportunityTemplate({
  header,
  summary,
  formula,
  scoreInputs,
  supportingMetrics,
  recommendation,
  expectedErsGain,
  evidenceTable,
  agingDistribution,
  executiveReadinessInsight,
}: OpportunityTemplateProps) {
  const totalAgingWorkOrders = agingDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <main className="min-h-screen bg-[#f7fcfa] text-[#0f2238]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-12">
        <OpportunityHeader
          organizationLabel={header.organizationLabel}
          reportingPeriod={header.reportingPeriod}
          lastUpdated={header.lastUpdated}
          backHref={header.backHref}
          backLabel={header.backLabel}
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ScoreSummary
            sectionLabel={summary.sectionLabel}
            title={summary.title}
            priority={summary.priority}
            improvement={summary.improvement}
            currentScore={summary.currentScore}
            statement={summary.statement}
            whyThisMatters={summary.whyThisMatters}
            scoreLabel={summary.scoreLabel}
          />

          <aside className="rounded-[32px] border border-[#dcebe6] bg-[#0f2238] p-8 text-white shadow-[0_24px_70px_-38px_rgba(15,34,56,0.35)] sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7dd3c0]">Why this matters</p>
            <p className="mt-5 text-lg leading-8 text-[#edf8f5]">{summary.whyThisMatters}</p>
          </aside>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <FormulaCard title={formula.title} formula={formula.formula} description={formula.description} />
            <ScoreInputs title={scoreInputs.title} description={scoreInputs.description} metrics={scoreInputs.metrics} />
          </div>

          <div className="space-y-6">
            <SupportingMetrics title={supportingMetrics.title} metrics={supportingMetrics.metrics} />
            <section className="rounded-[32px] border border-[#dcebe6] bg-[#f7fcfa] p-8 shadow-[0_20px_60px_-38px_rgba(15,34,56,0.2)] sm:p-9">
              <h2 className="text-xl font-semibold text-[#0f2238]">Aging distribution</h2>
              <p className="mt-3 text-base leading-7 text-[#4f627d]">
                Current aging concentration across unresolved work.
              </p>

              <div className="mt-6 rounded-[24px] border border-[#dcebe6] bg-white p-5">
                <div className="flex h-3 overflow-hidden rounded-full bg-[#eef6f2]">
                  {agingDistribution.map((segment) => (
                    <div
                      key={segment.label}
                      className="h-3"
                      style={{ width: `${(segment.value / totalAgingWorkOrders) * 100}%`, backgroundColor: segment.color }}
                    />
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {agingDistribution.map((segment) => (
                    <div key={segment.label} className="flex items-center justify-between gap-3 text-sm text-[#4f627d]">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="font-semibold text-[#0f2238]">{segment.label}</span>
                      </div>
                      <span>{segment.value} work orders</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Recommendation
            title={recommendation.title}
            items={recommendation.items}
            ctaLabel={recommendation.ctaLabel}
            ctaHref={recommendation.ctaHref}
          />
          <ExpectedErsGain title={expectedErsGain.title} description={expectedErsGain.description} />
        </div>

        <ContributingRecordsTable
          title={evidenceTable.title}
          description={evidenceTable.description}
          informationalMessage={evidenceTable.informationalMessage}
          columns={evidenceTable.columns}
          rows={evidenceTable.rows}
        />
      </section>
    </main>
  );
}
