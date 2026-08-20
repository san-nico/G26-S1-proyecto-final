import type { Metadata } from "next";
import BancosView from "@/components/bancos/BancosView";
import PageLayout from "@/components/global/PageLayout";
import { getBanksPageData, resolvePeriodParams } from "@/lib/app";

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
  const { year, month } = resolvePeriodParams(await searchParams);
  const { banks, error } = await getBanksPageData(year, month);

  return (
    <PageLayout>
      <BancosView
        banks={banks}
        error={error}
        selectedYear={year}
        selectedMonth={month}
      />
    </PageLayout>
  );
}