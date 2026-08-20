import type { Metadata } from "next";
import BancosView from "@/components/bancos/BancosView";
import PageLayout from "@/components/global/PageLayout";
import { getBanks } from "@/lib/app";
import type { Bank } from "@/lib/app";
import { resolvePeriodParams } from "@/lib/app";

export const metadata: Metadata = {
  title: "Instituciones bancarias | CMF Chile",
  description:
    "Consulta el listado de instituciones bancarias registradas en la CMF.",
};

export default async function BanksPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string | string[];
    month?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const { year, month } = resolvePeriodParams(params);

  let banks: Bank[] = [];
  let error = "";

  try {
    banks = await getBanks(year, month);
    banks = banks.filter((bank) => bank.CodigoInstitucion !== "999");
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar los bancos.";
  }

  const selectedYear = year;
  const selectedMonth = month;

  return (
    <PageLayout>
      <BancosView
        banks={banks}
        error={error}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
      />
    </PageLayout>
  );
}
