interface KeyPointsProps {
  points: string[];
}

export function KeyPoints({ points }: KeyPointsProps) {
  return (
    <section className="border-b border-hairline py-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
        Kluczowe punkty
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {points.map((point, index) => (
          <li key={point} className="relative w-fit py-0.5">
            <span
              aria-hidden
              className="animate-highlight absolute -inset-y-0.5 -inset-x-1 -z-10 rounded-[1px] bg-highlighter/80"
              style={{ animationDelay: `${300 + index * 110}ms` }}
            />
            <span className="relative font-sans text-ink">{point}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
