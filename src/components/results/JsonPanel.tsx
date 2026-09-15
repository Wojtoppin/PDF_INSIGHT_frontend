import { Button } from "../common/Button";
import type { DocumentAnalysis } from "../../types/documentAnalysis.schema";

interface JsonPanelProps {
  result: DocumentAnalysis;
}

export function JsonPanel({ result }: JsonPanelProps) {
  const json = JSON.stringify(result, null, 2);
  const downloadName = result.document.fileName.replace(/\.pdf$/i, "") + ".json";

  const handleDownload = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
          {downloadName}
        </p>
        <Button variant="primary" onClick={handleDownload}>
          Pobierz JSON
        </Button>
      </div>

      <pre className="mt-3 max-h-80 overflow-auto rounded-sm bg-panel p-4 font-mono text-xs leading-relaxed text-paper">
        {json}
      </pre>
    </section>
  );
}
