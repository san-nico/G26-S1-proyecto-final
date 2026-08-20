import PageLayout from "@/components/global/PageLayout";
import ComparadorHeader from "@/components/comparador/ComparadorHeader";
import ComparadorTable from "@/components/comparador/ComparadorTable";
import BankTableRow from "@/components/comparador/BankTableRow";
import type { AccountCell, AccountTarget, Bank } from "@/lib/app";

type BankRow = {
  code: string;
  bankName: string;
  cells: Record<string, AccountCell>;
};

type ComparadorViewProps = {
  banks: Bank[];
  accounts: AccountTarget[];
  rows: BankRow[];
  selectedCode: string;
  error: string;
};

export default function ComparadorView({
  banks,
  accounts,
  rows,
  selectedCode,
  error,
}: ComparadorViewProps) {
  return (
    <PageLayout mainClassName="container-main">
      <ComparadorHeader description="Compara los estados de situación financiera de cada institución consultando el detalle de cada cuenta." />

      {error ? (
        <div role="alert" className="alert">
          <h2 className="font-bold">No se pudo cargar la información</h2>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : banks.length === 0 ? (
        <p className="card mt-10 rounded-xl p-6 text-muted">
          No se encontraron instituciones para los parámetros seleccionados.
        </p>
      ) : (
        <section className="mt-10" aria-labelledby="comparador-title">
          <h2 id="comparador-title" className="text-2xl font-bold text-ink">
            Instituciones
          </h2>
          <ComparadorTable accounts={accounts}>
            {rows.map((row) => (
              <BankTableRow
                key={row.code}
                code={row.code}
                bankName={row.bankName}
                cells={row.cells}
                accounts={accounts}
                selectedCode={selectedCode}
              />
            ))}
          </ComparadorTable>
        </section>
      )}
    </PageLayout>
  );
}
