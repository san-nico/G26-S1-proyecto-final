import type { Metadata } from "next";
import ResultsView from "./ResultsView";
import { formatValue, getResultAccounts } from "@/lib/cmf";
import styles from "./ResultsView.module.css";

export const metadata: Metadata = {
  title: "Resumen de Resultados | CMF Chile",
};

const SUMMARY_GROUPS = [
  {
    code: "550000000",
    category: "Ingresos",
    title: "Ingresos operacionales",
    cardClass: styles.cardIncome,
    textClass: styles.textIncome,
  },
  {
    code: "560000000",
    category: "Gastos",
    title: "Gastos operacionales",
    cardClass: styles.cardExpense,
    textClass: styles.textExpense,
  },
  {
    code: "590000000",
    category: "Resultado",
    title: "Resultado del período",
    cardClass: styles.cardResult,
    textClass: styles.textResult,
  },
] as const;

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
