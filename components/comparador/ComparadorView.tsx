import PageLayout from "@/components/global/PageLayout";
import type { BalanceTarget, Bank } from "@/lib/types";

type ComparadorViewProps = {
  banks: Bank[];
  accounts: BalanceTarget[];
  year: string;
  month: string;
  error: string;
  children: React.ReactNode;
};

export default function ComparadorView({
  banks,
  accounts,
  year,
  month,
  error,
  children,
}: ComparadorViewProps) {
  return (
    <PageLayout mainClassName="container-main">
      <section className="max-w-3xl">
        <p className="badge">Datos oficiales CMF Chile</p>
        <h1 className="page-title">Comparador de Bancos</h1>
        <p className="mt-4 text-lg leading-7 text-muted">
          Compara los estados de situación financiera de cada institución para
          el período{" "}
          <span className="font-semibold text-ink">
            {month}/{year}
          </span>
          . Los porcentajes del Pasivo y el Patrimonio se calculan sobre el
          Activo Total.
        </p>
      </section>

      {error ? (
        <div role="alert" className="alert">
          <h2 className="font-bold">No se pudo cargar la información</h2>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : banks.length === 0 ? (
        <p className="card mt-10 rounded-xl p-6 text-muted">
          No se encontraron instituciones para el período seleccionado.
        </p>
      ) : (
        <section className="mt-10" aria-labelledby="comparador-title">
          <h2 id="comparador-title" className="text-2xl font-bold text-ink">
            Instituciones
          </h2>

          <div className="card mt-6 overflow-x-auto p-0">
            <table className="w-full min-w-max border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-1">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted">
                    Institución
                  </th>
                  {accounts.map((item) => (
                    <th
                      key={item.code}
                      className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-muted"
                    >
                      {item.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{children}</tbody>
            </table>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
