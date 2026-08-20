import type { Metadata } from "next";
import BalanceView from "@/components/balance/BalanceView";
import { getBalancePageData, resolvePeriodParams } from "@/lib/app";

export const metadata: Metadata = {
  title: "Balance de la Institución | CMF Chile",
};

export default async function BalancePage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; year?: string; month?: string }>;
}) {
  const { code, year, month } = resolvePeriodParams(await searchParams);
  const { bankName, accounts, error } = await getBalancePageData(
    code,
    year,
    month,
  );

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