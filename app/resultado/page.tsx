import type { Metadata } from "next";
import ResultsView from "@/components/resultado/ResultsView";
import { getResultAccounts } from "@/lib/cmf";
import { ACCOUNTS_RESULTADO } from "@/lib/types";
import { formatValue } from "@/lib/format";
import { resolvePeriodParams } from "@/lib/params";

export const metadata: Metadata = {
  title: "Resumen de Estado de Resultado | CMF Chile",
};

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const { code, year, month } = resolvePeriodParams(params);

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
    const data = await getResultAccounts(
      code,
      year,
      month,
      ACCOUNTS_RESULTADO.map((group) => group.code),
    );
    bankName = data.bankName;
    cards = ACCOUNTS_RESULTADO.map((group) => ({
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
      cards={cards}
      error={error}
    />
  );
}
