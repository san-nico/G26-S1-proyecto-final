import type { Metadata } from "next";
import BancosView from "@/components/bancos/BancosView";
import PageLayout from "@/components/global/PageLayout";
import { getBanks } from "@/lib/cmf";
import type { Bank } from "@/lib/types";

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
  const year = (
    Array.isArray(params.year) ? params.year[0] : params.year
  )?.trim();
  const month = (
    Array.isArray(params.month) ? params.month[0] : params.month
  )?.trim();

  let banks: Bank[] = [];
  let error = "";

  try {
    banks = await getBanks(year, month);
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar los bancos.";
  }

  const now = new Date();
  const selectedYear = year || now.getFullYear().toString();
  const selectedMonth = month || (now.getMonth() + 1).toString();

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
