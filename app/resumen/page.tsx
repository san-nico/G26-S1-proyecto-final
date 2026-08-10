import type { Metadata } from "next";
import { Suspense } from "react";
import ResumenView from "@/components/resumen/ResumenView";
import SectionSkeleton from "@/components/resumen/SectionSkeleton";
import FichaSection from "@/components/resumen/sections/FichaSection";
import BalanceSection from "@/components/resumen/sections/BalanceSection";
import ResultadoSection from "@/components/resumen/sections/ResultadoSection";
import { resolvePeriodParams } from "@/lib/params";

export const metadata: Metadata = {
  title: "Resumen | CMF Chile",
};

export default async function ResumenPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const { code, year, month } = resolvePeriodParams(params);

  return (
    <ResumenView>
      <Suspense fallback={<SectionSkeleton title="Ficha" />}>
        <FichaSection code={code} year={year} month={month} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton title="Estado de Situación Financiera" />}>
        <BalanceSection code={code} year={year} month={month} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton title="Estado de Resultado" />}>
        <ResultadoSection code={code} year={year} month={month} />
      </Suspense>
    </ResumenView>
  );
}
