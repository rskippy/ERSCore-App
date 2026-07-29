import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7fcfa] text-[#0f2238]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-6 py-8 sm:px-8 lg:px-12">
        <header className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#0f2238]">
          <span className="inline-flex w-[340px] max-w-full shrink-0 items-center justify-start">
            <Image src="/logo.png" alt="ERS logo" width={340} height={58} className="h-auto w-full object-contain" priority />
          </span>
          <span className="text-lg font-semibold">Executive Intelligence</span>
        </header>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-16">
          <div className="w-full max-w-6xl rounded-[32px] border border-[#dcebe6] bg-white p-8 shadow-[0_30px_90px_-38px_rgba(15,34,56,0.35)] sm:p-10 lg:p-16">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl text-center lg:text-left">
                <p className="mb-6 inline-flex items-center rounded-full border border-[#c8e8de] bg-[#f2fbf8] px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
                  Executive readiness intelligence
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-[#0f2238] sm:text-5xl lg:text-6xl">
                  The Missing Metric
                </h1>
                <p className="mt-5 text-lg leading-8 text-[#4f627d] sm:text-xl">
                  Measure the result of your maintenance program—not just the activities it performs.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  <a
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-full bg-[#16a34a] px-8 py-3.5 text-base font-semibold text-white transition hover:bg-[#15803d]"
                  >
                    Enter Platform
                  </a>
                </div>
              </div>

              <div className="w-full max-w-md rounded-[24px] border border-[#dcebe6] bg-[#f7fcfa] p-8 text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#0f766e]">ERS</p>
                <h2 className="mt-4 text-3xl font-semibold text-[#0f2238] sm:text-4xl">
                  Equipment Readiness Score™
                </h2>
                <div className="mt-5 h-2 rounded-full bg-gradient-to-r from-[#16a34a] via-[#0f766e] to-[#14b8a6]" />
                <p className="mt-5 text-sm leading-7 text-[#4f627d] sm:text-base">
                  A clear, executive-ready view of operational availability and maintenance effectiveness.
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="px-1 pb-2 pt-4 text-center text-sm text-[#64748b] sm:text-left">
          ERS Version 1.0
        </footer>
      </section>
    </main>
  );
}
