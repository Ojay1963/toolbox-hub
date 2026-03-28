type StaticPageSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type StaticPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: StaticPageSection[];
};

export function StaticPage({ eyebrow, title, intro, sections }: StaticPageProps) {
  return (
    <div className="site-shell mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="site-hero rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
          {eyebrow}
        </p>
        <h1 className="site-hero-title mt-4 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--muted)]">{intro}</p>
      </section>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="site-card rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-7 shadow-sm sm:p-8"
          >
            <h2 className="site-section-title text-2xl font-black tracking-tight">{section.title}</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {section.bullets?.length ? (
              <ul className="mt-5 space-y-3 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="rounded-2xl bg-stone-50 px-4 py-3">
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
