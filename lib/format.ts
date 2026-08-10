import type { AccountCell } from "@/lib/types";

export function bankLogoPath(code: string): string {
  const ext = code === "999" ? "svg" : "png";
  return `/bank-logos/${code}.${ext}`;
}

export function formatValue(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "—";
  return formatBillionsWithSuffix(String(value));
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
  return `${billions.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatBillionsWithSuffix(value?: string): string {
  const formatted = formatBillions(value);
  return formatted === "—" ? "—" : `${formatted} B`;
}

export function formatPercent(value: number, base: number): string | null {
  if (!Number.isFinite(value) || !Number.isFinite(base) || base <= 0) {
    return null;
  }
  const percent = (value / base) * 100;
  return `${percent.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

export function buildAccountCell(
  rawValue: string | undefined,
  baseRaw: number,
  isBase: boolean,
): AccountCell {
  const valueRaw = toNumber(rawValue);
  const hasValue = rawValue != null && Number.isFinite(valueRaw);

  if (isBase) {
    const valid = hasValue && baseRaw > 0;
    return {
      money: valid ? formatBillionsWithSuffix(rawValue) : "—",
      percent: valid ? "100%" : "—",
    };
  }

  return {
    money: hasValue ? formatBillionsWithSuffix(rawValue) : "—",
    percent: formatPercent(valueRaw, baseRaw) ?? "—",
  };
}
