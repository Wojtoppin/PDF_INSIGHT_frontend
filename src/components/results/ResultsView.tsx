import { Button } from "../common/Button";
import { SummaryCard } from "./SummaryCard";
import { KeyPoints } from "./KeyPoints";
import { EntityChips } from "./EntityChips";
import { JsonPanel } from "./JsonPanel";
import type { DocumentAnalysis } from "../../types/documentAnalysis.schema/documentAnalysis.schema";
import { useAnalysisStore } from "../../store/analysisStore";

interface ResultsViewProps {
  result: DocumentAnalysis;
}

export function ResultsView({ result }: ResultsViewProps) {
  const reset = useAnalysisStore((state) => state.reset);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Wynik analizy</p>
        <Button variant="ghost" onClick={reset}>
          Nowa analiza
        </Button>
      </div>

      <SummaryCard document={result.document} summary={result.summary} />
      <KeyPoints points={result.keyPoints} />
      <EntityChips
        entities={result.entities}
        amounts={result.amounts}
        dates={result.dates}
        keywords={result.keywords}
      />
      <JsonPanel result={result} />
    </div>
  );
}
