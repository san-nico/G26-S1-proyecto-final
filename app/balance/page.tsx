import type { Metadata } from "next";
import BalanceView from "@/components/balance/BalanceView";
import { getBalanceAccounts } from "@/lib/cmf";
import { ACCOUNTS_BALANCE } from "@/lib/types";
import { formatValue } from "@/lib/format";
import { resolvePeriodParams } from "@/lib/params";

export const metadata: Metadata = {
  title: "Resumen de Estado de Situación Financiera | CMF Chile",
};

export default async function BalancePage({
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
    const data = await getBalanceAccounts(
      code,
      year,
      month,
      ACCOUNTS_BALANCE.map((item) => item.code),
    );
    bankName = data.bankName;
    cards = ACCOUNTS_BALANCE.map((item) => ({
      category: item.category,
      title: item.title,
      amount: formatValue(data.accounts[item.code]),
      cardClass: item.cardClass,
      textClass: item.textClass,
    }));
  } catch {
    error = "No se pudieron consultar los datos del estado de situación financiera en la CMF.";
  }

  return (
    <BalanceView
      bankName={bankName}
      code={code}
      cards={cards}
      error={error}
    />
  );
}
