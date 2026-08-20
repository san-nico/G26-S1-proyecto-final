import type { Metadata } from "next";
import HistorialView from "@/components/historial/HistorialView";
import {
  ACCOUNTS_BALANCE,
  getHistorialPageData,
  resolvePeriodParams,
} from "@/lib/app";

export const metadata: Metadata = {
  title: "Historial | CMF Chile",
  description:
    "Evolución de una institución bancaria en los últimos 10 años: Activo, Pasivo y Patrimonio total, según la CMF.",
};

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; year?: string; month?: string }>;
}) {
  const { code, year, month } = resolvePeriodParams(await searchParams, "999");
  const { bankName, rows } = await getHistorialPageData(code, year, month);

  return (
    <HistorialView
      code={code}
      bankName={bankName}
      accounts={ACCOUNTS_BALANCE}
      rows={rows}
    />
  );
}