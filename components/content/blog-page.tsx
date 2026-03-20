import Link from "next/link";
import { FaqList } from "@/components/ui/faq-list";
import { RelatedTools } from "@/components/ui/related-tools";
import type { BlogArticle } from "@/lib/blog";
import type { ToolDefinition } from "@/lib/tools";

export function BlogPage({
  article,
  relatedTools,
}: {
  article: BlogArticle;
  relatedTools: ToolDefinition[];
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
          Guides
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{article.h1}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--muted)]">{article.intro}</p>
      </section>

      <div className="mt-8 space-y-6">
        {article.sections.map((section) => (
          <section
            key={section.title}
            className="rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-7 shadow-sm sm:p-8"
          >
            <h2 className="text-2xl font-black tracking-tight">{section.title}</h2>
            <div className="prose-content mt-5 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
              {section.content}
            </div>
          </section>
        ))}

        <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-7 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black tracking-tight">{article.h1} FAQs</h2>
          <div className="mt-5">
            <FaqList items={article.faq} />
          </div>
        </section>

        <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-7 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black tracking-tight">Related tools</h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            Ready to try it yourself? Start with the tools below or browse the full{" "}
            <Link href="/" className="font-semibold text-[color:var(--primary)]">
              tools directory
            </Link>
            .
          </p>
          <div className="mt-5">
            <RelatedTools tools={relatedTools} />
          </div>
        </section>
      </div>
    </div>
  );
}
