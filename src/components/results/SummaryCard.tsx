import type { DocumentAnalysis } from "../../types/documentAnalysis.schema/documentAnalysis.schema";

interface SummaryCardProps {
  document: DocumentAnalysis["document"];
  summary: string;
}

export function SummaryCard({ document, summary }: SummaryCardProps) {
  return (
    <section className="animate-rise border-b border-hairline pb-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Dokument</p>
      <h2 className="mt-1 font-display text-3xl text-ink">{document.title}</h2>

      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-ink-soft">
        <div className="flex gap-1">
          <dt className="uppercase">typ</dt>
          <dd>{document.type}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="uppercase">język</dt>
          <dd>{document.language}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="uppercase">strony</dt>
          <dd>{document.pages}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="uppercase">data</dt>
          <dd>{document.date ?? "—"}</dd>
        </div>
      </dl>

      <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
        Podsumowanie
      </p>
      <p className="mt-1 max-w-2xl font-sans leading-relaxed text-ink">{summary}</p>
    </section>
  );
}
