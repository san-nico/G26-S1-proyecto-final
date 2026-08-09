import type { Metadata } from "next";
import BalanceView from "@/components/balance/BalanceView";
import { formatValue, getBalanceAccounts } from "@/lib/cmf";
import styles from "@/components/balance/BalanceView.module.scss";

export const metadata: Metadata = {
  title: "Resumen de Balance | CMF Chile",
};

const TARGET_ACCOUNTS = [
  {
    code: "100000000",
    category: "Activo",
    title: "Activo Total",
    style: styles.cardActivo,
  },
  {
    code: "200000000",
    category: "Pasivo",
    title: "Pasivo Total",
    style: styles.cardPasivo,
  },
  {
    code: "300000000",
    category: "Patrimonio",
    title: "Patrimonio Total",
    style: styles.cardPatrimonio,
  },
];

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
    error = "No se pudieron consultar los datos del balance en la CMF.";
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
