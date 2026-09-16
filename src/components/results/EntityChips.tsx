import type { DocumentAnalysis } from "../../types/documentAnalysis.schema/documentAnalysis.schema";

interface EntityChipsProps {
  entities: DocumentAnalysis["entities"];
  amounts: DocumentAnalysis["amounts"];
  dates: DocumentAnalysis["dates"];
  keywords: string[];
}

function ChipGroup({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-sm border border-hairline bg-paper-dim px-3 py-1 font-mono text-xs text-ink"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function formatAmount(value: number, currency: string) {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("pl-PL", { style: "currency", currency });
    currencyFormatters.set(currency, formatter);
  }
  return formatter.format(value);
}

export function EntityChips({ entities, amounts, dates, keywords }: EntityChipsProps) {
  return (
    <section className="flex flex-col gap-6 border-b border-hairline py-8">
      <ChipGroup label="Podmioty" items={entities.organizations} />
      <ChipGroup label="Osoby" items={entities.people} />
      <ChipGroup
        label="Kwoty"
        items={amounts.map(
          (amount) => `${formatAmount(amount.value, amount.currency)} — ${amount.context}`,
        )}
      />
      <ChipGroup label="Daty" items={dates.map((date) => `${date.date} — ${date.context}`)} />
      <ChipGroup label="Słowa kluczowe" items={keywords} />
    </section>
  );
}
