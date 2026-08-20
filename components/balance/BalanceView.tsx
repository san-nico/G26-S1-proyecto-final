import PageLayout from "@/components/global/PageLayout";
import type { BalanceAccount } from "@/lib/cmf-bancos";
import { formatValue } from "@/lib/app";
import BankLogo from "../global/BankLogo";

type BalanceViewProps = {
  bankName: string;
  code: string;
  year: string;
  month: string;
  accounts: BalanceAccount[];
  error: string;
};

export default function BalanceView({
  bankName,
  code,
  year,
  month,
  accounts,
  error,
}: BalanceViewProps) {
  return (
    <PageLayout mainClassName="container-main">
      <section className="max-w-3xl"></section>

      {error ? (
        <div role="alert" className="alert">
          <h2 className="font-bold">No se pudo cargar la información</h2>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : (
        <section className="" aria-labelledby="balance-title">
          <h1 id="balance-title" className="text-3xl font-bold text-ink">
            Estado de Situación Financiera
          </h1>

          {accounts.length === 0 ? (
            <p className="card mt-6 rounded-xl p-6 text-muted">
              No se encontraron cuentas para los parámetros seleccionados.
            </p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                <BankLogo>{code}</BankLogo>
                <h3 className="text-lg font-bold text-ink">{bankName}</h3>
                <span className="meta">Código {code}</span>
              </div>

              <div className="card mt-4 overflow-x-auto p-0">
                <table className="w-full table-fixed border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-surface-1">
                      <th className="w-28 px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted">
                        Código
                      </th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted">
                        Cuenta
                      </th>
                      <th className="w-44 px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-muted">
                        Moneda Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr
                        key={account.CodigoCuenta}
                        className="border-b border-line-soft last:border-0 hover:bg-surface-2"
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-muted">
                          {account.CodigoCuenta}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            title={account.DescripcionCuenta}
                            className="block truncate text-ink"
                          >
                            {account.DescripcionCuenta}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-bold tabular-nums text-ink">
                          {formatValue(account.MonedaTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}
    </PageLayout>
  );
}
