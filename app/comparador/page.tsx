import type { Metadata } from "next";
import { Suspense } from "react";
import ComparadorView from "@/components/comparador/ComparadorView";
import BankRow from "@/components/comparador/BankRow";
import BankRowSkeleton from "@/components/comparador/BankRowSkeleton";
import { getBanks } from "@/lib/cmf";
import { TARGET_ACCOUNTS } from "@/lib/types";
import type { Bank } from "@/lib/types";

export const metadata: Metadata = {
  title: "Comparador de bancos | CMF Chile",
  description:
    "Compara los estados de situación financiera de las instituciones bancarias registradas en la CMF.",
};

export default async function ComparadorPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year || String(now.getFullYear());
  const month = params.month || String(now.getMonth() + 1).padStart(2, "0");

  let banks: Bank[] = [];
  let error = "";

  try {
    banks = await getBanks(year, month);
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Error al cargar los bancos.";
  }

  return (
    <ComparadorView
      banks={banks}
      accounts={TARGET_ACCOUNTS}
      year={year}
      month={month}
      error={error}
    >
      {banks.map((bank) => (
        <Suspense
          key={bank.CodigoInstitucion}
          fallback={
            <BankRowSkeleton
              code={bank.CodigoInstitucion}
              bankName={bank.NombreInstitucion}
              accounts={TARGET_ACCOUNTS}
            />
          }
        >
          <BankRow
            code={bank.CodigoInstitucion}
            bankName={bank.NombreInstitucion}
            accounts={TARGET_ACCOUNTS}
            year={year}
            month={month}
          />
        </Suspense>
      ))}
    </ComparadorView>
  );
}
