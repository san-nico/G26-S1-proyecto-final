import type { Metadata } from "next";
import BalanceView from "@/components/balance/BalanceView";
import { getBalanceAccounts } from "@/lib/cmf";
import { TARGET_ACCOUNTS } from "@/lib/types";
import { formatValue } from "@/lib/format";

export const metadata: Metadata = {
  title: "Resumen de Estado de Situación Financiera | CMF Chile",
};

export default async function BalancePage({
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
    style: string;
  }[] = [];
  let error = "";

  try {
    const data = await getBalanceAccounts(code, year, month);
    bankName = data.bankName;
    cards = TARGET_ACCOUNTS.map((item) => ({
      category: item.category,
      title: item.title,
      amount: formatValue(data.accounts[item.code]),
      style: item.style,
    }));
  } catch {
    error = "No se pudieron consultar los datos del estado de situación financiera en la CMF.";
  }

  return (
    <BalanceView
      bankName={bankName}
      code={code}
      year={year}
      month={month}
      cards={cards}
      error={error}
    />
  );
}
