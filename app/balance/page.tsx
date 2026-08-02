import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

export const metadata: Metadata = {
  title: "Balance de Institución | CMF Chile",
  description: "Consulta el balance general de una institución bancaria.",
};

// ==========================================
// 1. TIPOS Y HELPERS
// ==========================================

type Account = {
  CodigoCuenta?: string;
  DescripcionCuenta?: string;
  CodigoInstitucion?: string;
  NombreInstitucion?: string;
  Anho?: number | string;
  Mes?: number | string;
  MonedaChilenaNoReajustable?: string | number;
  MonedaReajustablePorIPC?: string | number;
  MonedaReajustablePorTipoDeCambio?: string | number;
  MonedaExtranjera?: string | number;
  MonedaTotal?: string | number;
};

function formatPeriod(year?: string, month?: string): string {
  const now = new Date();
  const y = parseInt(year || now.getFullYear().toString(), 10);
  const m = parseInt(month || (now.getMonth() + 1).toString(), 10) - 1;

  const date = new Date(y, m, 1);
  const monthName = new Intl.DateTimeFormat("es-CL", { month: "long" }).format(
    date,
  );
  const capitalizedMonth =
    monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return `${capitalizedMonth} de ${y}`;
}

function parseBalanceAccounts(data: any): Account[] {
  const raw = data?.CodigosBalances;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

async function getBalanceAccounts(
  code: string,
  year?: string,
  month?: string,
): Promise<Account[]> {
  const apiKey =
    process.env.CMF_API_KEY || "d3217c0d406feca58306af437eb4c783de05febb";

  const now = new Date();
  const selectedYear = year || now.getFullYear().toString();
  const selectedMonth = (month || (now.getMonth() + 1).toString()).padStart(
    2,
    "0",
  );

  // Endpoint oficial corregido: balances/<year>/<month>/instituciones/<code>
  const url = `https://api.cmfchile.cl/api-sbifv3/recursos_api/balances/${selectedYear}/${selectedMonth}/instituciones/${code}?apikey=${apiKey}&formato=json`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        `No se encontraron datos de balance para la institución ${code} en el período ${selectedMonth}/${selectedYear}.`,
      );
    }
    throw new Error(
      `Error al consultar la CMF (${res.status}): No se pudo obtener el balance.`,
    );
  }

  const data = await res.json();
  return parseBalanceAccounts(data);
}

function formatValue(value: string | number | undefined) {
  if (value === undefined || value === "") return "—";

  // Reemplaza puntos de miles y coma decimal del formato devuelto por CMF
  const number =
    typeof value === "number"
      ? value
      : Number(value.toString().replace(/\./g, "").replace(",", "."));

  return Number.isFinite(number)
    ? new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2 }).format(
        number,
      )
    : value;
}

// ==========================================
// 2. SUBCOMPONENTES
// ==========================================

function BalanceHeader({
  code,
  year,
  month,
  bankName,
}: {
  code: string;
  year?: string;
  month?: string;
  bankName?: string;
}) {
  const periodText = formatPeriod(year, month);

  return (
    <section className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="text-xs font-semibold text-brand-700 hover:underline"
        >
          ← Volver a instituciones
        </Link>
        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-600/20">
          Periodo: {periodText}
        </span>
      </div>

      <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Balance de Institución
      </h1>

      <p className="mt-4 text-lg leading-8 text-muted">
        Detalle del balance financiero para{" "}
        <span className="font-bold text-ink">
          {bankName ? bankName : `código ${code}`}
        </span>
        .
      </p>
    </section>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900"
    >
      <h2 className="font-bold">No se pudo cargar el balance</h2>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}

function BalanceTable({ accounts }: { accounts: Account[] }) {
  if (accounts.length === 0) {
    return (
      <p className="mt-6 rounded-xl border border-line bg-panel p-6 text-muted">
        No hay cuentas registradas para esta consulta.
      </p>
    );
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
      <div className="border-b border-line bg-slate-50 px-5 py-4">
        <h2 className="font-bold text-ink">Cuentas de Balance</h2>
        <p className="mt-1 text-sm text-muted">
          Se cargaron {accounts.length} registros desde el servicio de la CMF.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Cuenta</th>
              <th className="px-4 py-3 text-right">CLP no reaj.</th>
              <th className="px-4 py-3 text-right">Reaj. IPC</th>
              <th className="px-4 py-3 text-right">Tipo cambio</th>
              <th className="px-4 py-3 text-right">Moneda extranjera</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {accounts.map((account, index) => (
              <tr key={`${account.CodigoCuenta}-${index}`}>
                <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-brand-700">
                  {account.CodigoCuenta ?? "—"}
                </td>
                <th
                  scope="row"
                  className="px-4 py-3 font-medium text-slate-800"
                >
                  {account.DescripcionCuenta ?? "Sin descripción"}
                </th>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {formatValue(account.MonedaChilenaNoReajustable)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {formatValue(account.MonedaReajustablePorIPC)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {formatValue(account.MonedaReajustablePorTipoDeCambio)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {formatValue(account.MonedaExtranjera)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-ink">
                  {formatValue(account.MonedaTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 3. COMPONENTE PRINCIPAL (PÁGINA)
// ==========================================

export default async function BalancePage({
  searchParams,
}: {
  searchParams: Promise<{
    codigo?: string | string[];
    year?: string | string[];
    month?: string | string[];
  }>;
}) {
  const params = await searchParams;

  const rawCode = Array.isArray(params.codigo)
    ? params.codigo[0]
    : params.codigo;
  const rawYear = Array.isArray(params.year) ? params.year[0] : params.year;
  const rawMonth = Array.isArray(params.month) ? params.month[0] : params.month;

  const code = rawCode?.trim();
  const year = rawYear?.trim();
  const month = rawMonth?.trim();

  let accounts: Account[] = [];
  let error = "";

  if (!code) {
    error =
      "No se proporcionó un código de institución en la URL (?codigo=012).";
  } else {
    try {
      accounts = await getBalanceAccounts(code, year, month);
    } catch (err) {
      error =
        err instanceof Error ? err.message : "Error al cargar el balance.";
    }
  }

  const bankName = accounts[0]?.NombreInstitucion;

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {code && (
          <BalanceHeader
            code={code}
            year={year}
            month={month}
            bankName={bankName}
          />
        )}

        {error ? (
          <ErrorMessage message={error} />
        ) : (
          <BalanceTable accounts={accounts} />
        )}
      </main>

      <Footer />
    </div>
  );
}
