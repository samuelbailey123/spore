import type { Metadata } from "next";
import { pollenTypeSections, faqs } from "@/data/learn-content";
import { ThresholdTable } from "@/components/learn/threshold-table";
import { BookOpen, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Learn About Pollen",
  description:
    "Everything you need to know about pollen: types, counts, thresholds, cross-reactivity, seasonal patterns, and how climate change is affecting allergy seasons.",
};

export default function LearnPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Learn About Pollen</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Deep dive into pollen science: what it is, how it&apos;s measured, and what the numbers mean
        </p>
      </div>

      {/* Quick reference table */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold">NAB Pollen Count Thresholds</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Quick reference: what the numbers mean (grains/m³)
        </p>
        <div className="mt-4">
          <ThresholdTable />
        </div>
      </div>

      {/* Content sections */}
      <div className="space-y-6">
        {pollenTypeSections.map((section) => (
          <article
            key={section.slug}
            id={section.slug}
            className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>
            <div className="prose prose-zinc dark:prose-invert mt-4 max-w-none text-sm leading-relaxed">
              {section.content.split("\n\n").map((paragraph, i) => {
                if (paragraph.startsWith("|")) {
                  return (
                    <div key={i} className="overflow-x-auto">
                      <pre className="text-xs">{paragraph}</pre>
                    </div>
                  );
                }
                if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                  return (
                    <h3 key={i} className="mt-4 text-base font-semibold">
                      {paragraph.replace(/\*\*/g, "")}
                    </h3>
                  );
                }
                return (
                  <p
                    key={i}
                    className="text-zinc-600 dark:text-zinc-300"
                    dangerouslySetInnerHTML={{
                      __html: paragraph
                        .replace(
                          /\*\*(.+?)\*\*/g,
                          '<strong class="text-zinc-900 dark:text-zinc-100">$1</strong>'
                        )
                        .replace(/\n- /g, "<br/>&#8226; ")
                        .replace(/\n\| /g, "<br/>| "),
                    }}
                  />
                );
              })}
            </div>
          </article>
        ))}
      </div>

      {/* FAQ */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
        </div>
        <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4 first:pt-0 last:pb-0">
              <h3 className="font-medium">{faq.question}</h3>
              <p
                className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300"
                dangerouslySetInnerHTML={{
                  __html: faq.answer.replace(
                    /\*\*(.+?)\*\*/g,
                    '<strong class="text-zinc-900 dark:text-zinc-100">$1</strong>'
                  ),
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
