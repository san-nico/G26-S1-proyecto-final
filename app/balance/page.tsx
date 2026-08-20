import type { Metadata } from "next";
import BalanceView from "@/components/balance/BalanceView";
import { getFullBalance } from "@/lib/app";
import type { BalanceAccount } from "@/lib/cmf-bancos";
import { toNumber, resolvePeriodParams } from "@/lib/app";

export const metadata: Metadata = {
  title: "Balance de la Institución | CMF Chile",
};

export default async function BalancePage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const { code, year, month } = resolvePeriodParams(params);

  let bankName = "";
  let accounts: BalanceAccount[] = [];
  let error = "";

  try {
    const data = await getFullBalance(code, year, month);
    bankName = data.bankName;
    accounts = data.accounts.filter(
      (account) => toNumber(account.MonedaTotal ?? "") !== 0,
    );
  } catch {
    error = "No se pudieron consultar los datos del balance en la CMF.";
  }

  return (
    <BalanceView
      bankName={bankName}
      code={code}
      year={year}
      month={month}
      accounts={accounts}
      error={error}
    />
  );
}
