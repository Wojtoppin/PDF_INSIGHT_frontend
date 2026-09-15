import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { useAnalysisStore } from "../../store/analysisStore";

export function Dropzone() {
  const submit = useAnalysisStore((state) => state.submit);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void submit(file);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Wgraj plik PDF, przeciągnij i upuść lub kliknij, aby wybrać"
        onClick={openPicker}
        onKeyDown={onKeyDown}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center gap-3 rounded-sm border-2 border-dashed px-8 py-16 text-center transition-colors duration-150 ease-snappy cursor-pointer ${
          isDragging ? "border-ink bg-highlighter/15" : "border-hairline hover:border-ink-soft"
        }`}
      >
        <span
          aria-hidden
          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-transform duration-150 ease-snappy ${
            isDragging ? "scale-110 border-ink" : "border-ink-soft"
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M12 3v12m0-12 4 4m-4-4-4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="font-display text-xl text-ink">Upuść PDF tutaj</p>
        <p className="font-sans text-sm text-ink-soft">
          albo kliknij, aby wybrać plik — maks. 10&nbsp;MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void submit(file);
            event.target.value = "";
          }}
        />
      </div>
      <p className="mt-3 text-center font-mono text-xs text-ink-soft">
        Plik trafia wyłącznie do modelu AI w celu analizy. Nic nie zapisujemy na serwerze.
      </p>
    </div>
  );
}
