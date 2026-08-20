import PageLayout from "@/components/global/PageLayout";
import ComparadorTable from "@/components/comparador/ComparadorTable";
import type { AccountCell, AccountTarget } from "@/lib/app";

type YearRow = {
  year: number;
  cells: Record<string, AccountCell>;
};

type HistorialViewProps = {
  code: string;
  bankName: string;
  accounts: AccountTarget[];
  rows: YearRow[];
};

export default function HistorialView({
  code,
  bankName,
  accounts,
  rows,
}: HistorialViewProps) {
  const hasData = rows.some((row) => Object.keys(row.cells).length > 0);
  const displayName =
    bankName || (code === "999" ? "SISTEMA FINANCIERO" : `Institución ${code}`);

  return (
    <PageLayout mainClassName="container-main">
      <section className="max-w-3xl">
        <p className="badge">Datos oficiales CMF Chile</p>
        <h1 className="page-title">Historial de {displayName}</h1>
        <p className="mt-4 text-lg leading-7 text-muted">
          Evolución de {displayName} en los últimos 10 años: Activo, Pasivo y
          Patrimonio total.
        </p>
        <p className="meta mt-3">
          El Pasivo y el Patrimonio se calculan sobre el Activo Total. Montos en{" "}
          <span className="font-semibold text-ink">billones de CLP</span>.
        </p>
      </section>

      {hasData ? (
        <section className="mt-10" aria-labelledby="historial-title">
          <h2 id="historial-title" className="text-2xl font-bold text-ink">
            Últimos 10 años
          </h2>
          <ComparadorTable accounts={accounts} firstColumnLabel="Año">
            {rows.map((row) => (
              <tr
                key={row.year}
                className="border-b border-line-soft last:border-0 hover:bg-surface-2"
              >
                <td className="px-4 py-3">
                  <span className="block font-bold text-ink">{row.year}</span>
                </td>
                {accounts.map((item) => {
                  const cell = row.cells[item.code];
                  const empty =
                    !cell || (cell.percent === "—" && cell.money === "—");
                  return (
                    <td key={item.code} className="px-4 py-3 text-right">
                      {empty ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <>
                          <span className="block font-mono text-lg font-bold tabular-nums text-ink">
                            {cell.percent}
                          </span>
                          <span className="block font-mono text-xs tabular-nums text-muted">
                            {cell.money}
                          </span>
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </ComparadorTable>
        </section>
      ) : (
        <p className="card mt-10 rounded-xl p-6 text-muted">
          No se pudo cargar la información del historial.
        </p>
      )}
    </PageLayout>
  );
}