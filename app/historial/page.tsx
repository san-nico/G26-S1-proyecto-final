import type { Metadata } from "next";
import HistorialView from "@/components/historial/HistorialView";
import { ACCOUNTS_BALANCE, getFullBalance } from "@/lib/app";
import { buildAccountCell, toNumber, resolvePeriodParams } from "@/lib/app";

export const metadata: Metadata = {
  title: "Historial | CMF Chile",
  description:
    "Evolución de una institución bancaria en los últimos 10 años: Activo, Pasivo y Patrimonio total, según la CMF.",
};

const YEARS_TO_SHOW = 10;

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const { code, year, month } = resolvePeriodParams(params, "999");

  const parsedYear = Number(year);
  const baseYear = Number.isFinite(parsedYear)
    ? parsedYear
    : new Date().getFullYear();
  const years = Array.from({ length: YEARS_TO_SHOW }, (_, i) => baseYear - i);

  const baseCode = ACCOUNTS_BALANCE[0]?.code ?? "";

  const results = await Promise.all(
    years.map(async (y) => {
      try {
        const full = await getFullBalance(code, String(y), month);
        const accounts = new Map(
          full.accounts.map((acc) => [acc.CodigoCuenta, acc]),
        );
        const baseRaw = toNumber(accounts.get(baseCode)?.MonedaTotal ?? undefined);
        const cells = Object.fromEntries(
          ACCOUNTS_BALANCE.map((item) => [
            item.code,
            buildAccountCell(
              accounts.get(item.code)?.MonedaTotal ?? undefined,
              baseRaw,
              item.code === baseCode,
            ),
          ]),
        );
        return { year: y, cells, bankName: full.bankName };
      } catch (error) {
        console.warn(`[CMF] Failed to fetch historial year ${y}:`, error);
        return { year: y, cells: {}, bankName: "" };
      }
    }),
  );

  const bankName = results[0]?.bankName ?? "";

  return (
    <HistorialView
      code={code}
      bankName={bankName}
      accounts={ACCOUNTS_BALANCE}
      rows={results}
    />
  );
}