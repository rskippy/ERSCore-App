export type ExecutiveReadinessInsightSection = {
  heading: string;
  paragraph: string;
};

export type ExecutiveReadinessInsightProps = {
  sections: ExecutiveReadinessInsightSection[];
};

export function ExecutiveReadinessInsight({ sections }: ExecutiveReadinessInsightProps) {
  return (
    <section className="mt-6 rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-6 shadow-[0_16px_44px_-30px_rgba(15,34,56,0.2)] sm:p-7">
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.heading} className="rounded-[20px] border border-[#dcebe6] bg-white p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0f766e]">
              {section.heading}
            </p>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#0f2238]">
              {section.paragraph}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
