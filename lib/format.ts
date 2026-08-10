export function formatValue(value?: string) {
  if (!value) return "—";
  const num = Math.round(Number(value.replace(",", ".")));
  return Number.isNaN(num) ? value : num.toLocaleString("es-CL");
}

export function toNumber(value?: string): number {
  if (!value) return Number.NaN;
  const num = Number(value.replace(",", "."));
  return Number.isFinite(num) ? num : Number.NaN;
}

const BILLION = 1_000_000_000;

export function formatBillions(value?: string): string {
  const num = toNumber(value);
  if (!Number.isFinite(num)) return "—";
  const billions = num / BILLION;
  return `${billions.toLocaleString("es-CL", { maximumFractionDigits: 2 })}`;
}
