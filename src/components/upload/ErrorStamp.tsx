import { Button } from "../common/Button";
import { useAnalysisStore } from "../../store/analysisStore";

export function ErrorStamp() {
  const { errorMessage, errorKind, retry, reset } = useAnalysisStore((state) => ({
    errorMessage: state.errorMessage,
    errorKind: state.errorKind,
    retry: state.retry,
    reset: state.reset,
  }));

  const needsNewFile = errorKind === "file";

  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center" role="alert">
      <div className="animate-stamp-in-reject rounded-sm border-[3px] border-stamp px-8 py-5">
        <p className="font-mono text-sm font-medium uppercase tracking-[0.2em] text-stamp">
          Odrzucono
        </p>
      </div>

      <p className="max-w-sm font-sans text-sm text-ink-soft">{errorMessage}</p>

      <Button variant="ghost" onClick={needsNewFile ? reset : retry}>
        {needsNewFile ? "Wybierz inny plik" : "Spróbuj ponownie"}
      </Button>
    </div>
  );
}
