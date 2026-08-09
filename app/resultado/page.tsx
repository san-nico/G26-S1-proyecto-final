import type { Metadata } from "next";
import ResultsView from "@/components/resultado/ResultsView";
import { getResultAccounts } from "@/lib/cmf";
import { SUMMARY_GROUPS } from "@/lib/types";
import { formatValue } from "@/lib/format";

export const metadata: Metadata = {
  title: "Resumen de Estado de Resultado | CMF Chile",
};

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const code = params.codigo || "999";
  const year = params.year || String(now.getFullYear());
  const month = params.month || String(now.getMonth() + 1).padStart(2, "0");

  let bankName = "";
  let cards: {
    category: string;
    title: string;
    amount: string;
    cardClass: string;
    textClass: string;
  }[] = [];
  let error = "";

  try {
    const data = await getResultAccounts(code, year, month);
    bankName = data.bankName;
    cards = SUMMARY_GROUPS.map((group) => ({
      category: group.category,
      title: group.title,
      amount: formatValue(data.accounts[group.code]),
      cardClass: group.cardClass,
      textClass: group.textClass,
    }));
  } catch {
    error = "No se pudieron consultar los datos en la CMF.";
  }

  return (
    <ResultsView
      bankName={bankName}
      code={code}
      year={year}
      month={month}
      cards={cards}
      error={error}
    />
  );
}
