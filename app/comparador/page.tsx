import type { Metadata } from "next";
import ComparadorView from "@/components/comparador/ComparadorView";
import { getAccountsByAllInstitutions, getBanks } from "@/lib/bancos";
import { ACCOUNTS_BALANCE } from "@/lib/bancos";
import type { Bank } from "@/lib/bancos";
import { buildAccountCell, toNumber } from "@/lib/format";
import { resolvePeriodParams } from "@/lib/params";

export const metadata: Metadata = {
  title: "Comparador de Bancos | CMF Chile",
  description:
    "Compara los estados de situación financiera de las instituciones bancarias registradas en la CMF, consultando el detalle de cada cuenta.",
};

export default async function ComparadorPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const { code: selectedCode, year, month } = resolvePeriodParams(params, "");

  let banks: Bank[] = [];
  let error = "";

  try {
    banks = await getBanks(year, month);
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Error al cargar los bancos.";
  }

  const accountMap = await getAccountsByAllInstitutions(
    ACCOUNTS_BALANCE.map((item) => item.code),
    year,
    month,
  );

  const baseCode = ACCOUNTS_BALANCE[0]?.code ?? "";

  const rows = banks.map((bank) => {
    const baseRaw = toNumber(accountMap[baseCode]?.[bank.CodigoInstitucion]);
    const cells = Object.fromEntries(
      ACCOUNTS_BALANCE.map((item) => [
        item.code,
        buildAccountCell(
          accountMap[item.code]?.[bank.CodigoInstitucion],
          baseRaw,
          item.code === baseCode,
        ),
      ]),
    );

    return {
      code: bank.CodigoInstitucion,
      bankName: bank.NombreInstitucion,
      cells,
    };
  });

  rows.sort(
    (a, b) =>
      toNumber(accountMap[baseCode]?.[b.code]) -
      toNumber(accountMap[baseCode]?.[a.code]),
  );

  return (
    <ComparadorView
      banks={banks}
      accounts={ACCOUNTS_BALANCE}
      rows={rows}
      selectedCode={selectedCode}
      error={error}
    />
  );
}
