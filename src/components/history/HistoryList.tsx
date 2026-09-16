import { useAnalysisStore } from "../../store/analysisStore";

const dateFormatter = new Intl.DateTimeFormat("pl-PL", { dateStyle: "short", timeStyle: "short" });

export function HistoryList() {
  const history = useAnalysisStore((state) => state.history);
  const loadFromHistory = useAnalysisStore((state) => state.loadFromHistory);
  const clearHistory = useAnalysisStore((state) => state.clearHistory);

  if (history.length === 0) return null;

  return (
    <section className="mt-10 border-t border-hairline pt-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
          Historia analiz
        </p>
        <button
          type="button"
          onClick={clearHistory}
          className="font-mono text-xs text-ink-soft underline-offset-2 hover:text-ink hover:underline"
        >
          Wyczyść
        </button>
      </div>

      <ul className="mt-3 flex flex-col gap-1">
        {history.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => loadFromHistory(entry.id)}
              className="flex w-full items-baseline justify-between gap-3 rounded-sm px-2 py-1.5 text-left transition-colors duration-150 ease-snappy hover:bg-paper-dim"
            >
              <span className="min-w-0 truncate font-sans text-sm text-ink">
                {entry.result.document.title || entry.result.document.fileName}
              </span>
              <span className="shrink-0 font-mono text-xs text-ink-soft">
                {dateFormatter.format(new Date(entry.analyzedAt))}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
