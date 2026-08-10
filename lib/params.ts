type PeriodSearchParams = {
  codigo?: string | string[];
  year?: string | string[];
  month?: string | string[];
};

export type PeriodParams = {
  code: string;
  year: string;
  month: string;
};

export function resolvePeriodParams(
  searchParams: PeriodSearchParams,
  fallbackCode = "999",
): PeriodParams {
  const now = new Date();
  const first = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  return {
    code: first(searchParams.codigo)?.trim() || fallbackCode,
    year: first(searchParams.year)?.trim() || String(now.getFullYear()),
    month:
      first(searchParams.month)?.trim() ||
      String(now.getMonth() + 1).padStart(2, "0"),
  };
}
