interface ProcessingStampProps {
  fileName: string;
}

export function ProcessingStamp({ fileName }: ProcessingStampProps) {
  return (
    <div
      className="flex flex-col items-center gap-6 py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="animate-stamp-in rounded-sm border-[3px] border-ink px-8 py-5">
        <p className="font-mono text-sm font-medium uppercase tracking-[0.2em] text-ink">
          Analiza dokumentu
        </p>
      </div>

      <p className="max-w-xs truncate font-mono text-xs text-ink-soft">{fileName}</p>

      <div className="flex gap-2" aria-hidden>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="animate-dot-pulse h-2 w-2 rounded-full bg-ink"
            style={{ animationDelay: `${index * 160}ms` }}
          />
        ))}
      </div>

      <span className="sr-only">Analizowanie dokumentu, proszę czekać.</span>
    </div>
  );
}
