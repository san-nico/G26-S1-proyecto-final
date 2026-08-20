import type { Metadata } from "next";
import ComparadorView from "@/components/comparador/ComparadorView";
import {
  ACCOUNTS_BALANCE,
  getComparadorPageData,
  resolvePeriodParams,
} from "@/lib/app";

export const metadata: Metadata = {
  title: "Comparador de Bancos | CMF Chile",
  description:
    "Compara los estados de situación financiera de las instituciones bancarias registradas en la CMF, consultando el detalle de cada cuenta.",
};

export default async function ComparadorPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; year?: string; month?: string }>;
}) {
  const { code: selectedCode, year, month } = resolvePeriodParams(
    await searchParams,
    "",
  );
  const { banks, rows, error } = await getComparadorPageData(year, month);

  return (
    <ComparadorView
      banks={banks}
      accounts={ACCOUNTS_BALANCE}
      rows={rows}
      selectedCode={selectedCode}
      error={error}
    />
  );
}