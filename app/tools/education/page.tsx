import Link from "next/link";
import { EducationToolCard } from "@/components/education/tool-card";
import { AdPlaceholder } from "@/components/ui/ad-placeholder";
import { FaqList } from "@/components/ui/faq-list";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildFaqJsonLd, buildMetadata } from "@/lib/seo";
import { educationToolGroups, educationTools, getEducationToolsByGroup, getPopularEducationTools } from "@/lib/education-tools";

const educationFaq = [
  {
    question: "Are these educational tools free to use?",
    answer: "Yes. Every education tool in this section is free to use directly in your browser.",
  },
  {
    question: "Do I need an account to use the education tools?",
    answer: "No. These tools are designed for fast access without sign-up forms or paid plans.",
  },
  {
    question: "Do the planners and flashcards save data?",
    answer: "Some education tools save data in LocalStorage on your device so you can keep your notes or study items locally.",
  },
];

export const metadata = buildMetadata({
  title: "Free Educational Tools Online",
  description: "Use free educational tools online for grades, writing, unit conversion, planners, quizzes, timers, and study productivity.",
  pathname: "/tools/education",
  keywords: ["educational tools", "study tools", "free educational tools", "online calculators for students"],
});

export default function EducationToolsPage() {
  const popularTools = getPopularEducationTools(8);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", pathname: "/" },
    { name: "Tools", pathname: "/tools" },
    { name: "Educational Tools", pathname: "/tools/education" },
  ]);
  const collectionJsonLd = buildCollectionPageJsonLd({
    name: "Educational Tools",
    description: "A collection of free educational tools for grades, writing, studying, productivity, and practice.",
    pathname: "/tools/education",
    items: educationTools.map((tool) => ({
      name: tool.name,
      pathname: `/tools/education/${tool.slug}`,
    })),
  });
  const faqJsonLd = buildFaqJsonLd(educationFaq);

  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="site-hero app-panel rounded-[2rem] p-7 sm:p-10">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
            Educational tools
          </span>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
          Educational Tools
        </p>
        <h1 className="site-hero-title mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Free Educational Tools for Grades, Writing, Study Planning, and More
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
          Browse GPA calculators, word counters, unit converters, Pomodoro timers, flashcards, quiz builders, and more. Every tool is free and built to run fast in the browser.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="#popular-education-tools"
            className="rounded-full bg-[color:var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
          >
            Start with popular tools
          </Link>
          <Link
            href="#education-directory"
            className="rounded-full border border-[color:var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
          >
            Browse the directory
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <AdPlaceholder
          slot="education-directory-leaderboard-top"
          label="Advertisement"
          format="leaderboard"
        />
      </section>

      <section id="popular-education-tools" className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">Popular Education Tools</p>
        <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Start with the highest-demand tools</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {popularTools.map((tool) => (
            <EducationToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section id="education-directory" className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">Directory</p>
        <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Browse all educational tools</h2>
        <div className="mt-6 space-y-8">
          {educationToolGroups.map((group) => (
            <section key={group.slug} className="site-card app-panel rounded-[2rem] p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">{group.name}</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">{group.name}</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">{group.blurb}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {getEducationToolsByGroup(group.slug).map((tool) => (
                  <EducationToolCard key={tool.slug} tool={tool} compact />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="site-card app-panel mt-10 rounded-[2rem] p-7 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">Why this category works</p>
        <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Designed for fast study workflows</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            "Free tools with no account walls",
            "Mobile-first layouts for quick study sessions",
            "Keyword-rich pages for search visibility",
            "LocalStorage support for notes, goals, and flashcards",
          ].map((item) => (
            <div key={item} className="rounded-3xl bg-[color:var(--surface-alt)] px-5 py-4 text-sm font-semibold text-[color:var(--foreground)]">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <AdPlaceholder
          slot="education-directory-banner-bottom"
          label="Advertisement"
          format="banner"
        />
      </section>

      <section className="site-card app-panel mt-10 rounded-[2rem] p-7 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">FAQ</p>
        <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Common questions</h2>
        <div className="mt-6">
          <FaqList items={educationFaq} />
        </div>
      </section>
    </div>
  );
}
