import { Dropzone } from "../components/upload/Dropzone";
import { ProcessingStamp } from "../components/upload/ProcessingStamp";
import { ErrorStamp } from "../components/upload/ErrorStamp";
import { ResultsView } from "../components/results/ResultsView";
import { HistoryList } from "../components/history/HistoryList";
import { useAnalysisStore } from "../store/analysisStore";

export function Home() {
  const status = useAnalysisStore((state) => state.status);
  const file = useAnalysisStore((state) => state.file);
  const result = useAnalysisStore((state) => state.result);

  return (
    <main className="flex min-h-screen justify-center px-6 py-16">
      <div className="w-full max-w-2xl">
        {status !== "success" && (
          <header className="mb-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink-soft">
              PDF Insight
            </p>
            {status === "idle" && (
              <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
                Wgraj dokument.
                <br />
                Zobacz, co się w nim kryje.
              </h1>
            )}
          </header>
        )}

        {status === "idle" && (
          <>
            <Dropzone />
            <HistoryList />
          </>
        )}
        {status === "processing" && <ProcessingStamp fileName={file?.name ?? ""} />}
        {status === "error" && <ErrorStamp />}
        {status === "success" && result && <ResultsView result={result} />}
      </div>
    </main>
  );
}
