import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
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

type ProcessedAccount = Account & {
  tipoCuenta: string;
  tag: string;
  profundidad: string;
};

function analizarCuentaCMF(codigo: string | number | undefined) {
  const codigoStr = String(codigo ?? "").padStart(9, "0");

  const tiposCuenta: Record<string, { nombre: string; tag: string }> = {
    "1": { nombre: "Activo", tag: "activo" },
    "2": { nombre: "Pasivo", tag: "pasivo" },
    "3": { nombre: "Patrimonio", tag: "patrimonio" },
    "4": { nombre: "Resultado", tag: "resultado" },
    "5": { nombre: "Cuentas de orden", tag: "cuentas_orden" },
  };

  let profundidad: string;

  if (codigoStr.endsWith("00000000")) {
    profundidad = "L0";
  } else if (codigoStr.endsWith("000000")) {
    profundidad = "L1";
  } else if (codigoStr.endsWith("000")) {
    profundidad = "L2";
  } else {
    profundidad = "L3";
  }

  const tipo = tiposCuenta[codigoStr[0]] || {
    nombre: "Desconocido",
    tag: "desconocido",
  };

  return {
    codigo: codigoStr,
    tipoCuenta: tipo.nombre,
    tag: tipo.tag,
    profundidad,
  };
}

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

function parseBalanceAccounts(
  data: any,
  showL3: boolean = true,
): ProcessedAccount[] {
  const raw = data?.CodigosBalances;
  if (!raw) return [];
  const rawAccounts: Account[] = Array.isArray(raw) ? raw : [raw];

  const isZero = (val?: string | number) => {
    if (val === undefined || val === null || val === "") return false;
    const num =
      typeof val === "number"
        ? val
        : Number(val.toString().replace(/\./g, "").replace(",", "."));
    return Number.isFinite(num) && num === 0;
  };

  const nonZeroAccounts = rawAccounts.filter((acc) => !isZero(acc.MonedaTotal));

  const sorted = nonZeroAccounts.sort((a, b) =>
    (a.CodigoCuenta ?? "").localeCompare(b.CodigoCuenta ?? "", undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );

  const processed = sorted.map((acc) => {
    const analisis = analizarCuentaCMF(acc.CodigoCuenta);
    return {
      ...acc,
      tipoCuenta: analisis.tipoCuenta,
      tag: analisis.tag,
      profundidad: analisis.profundidad,
    };
  });

  if (!showL3) {
    return processed.filter((acc) => acc.profundidad !== "L3");
  }

  return processed;
}

async function getBalanceAccounts(
  code: string,
  year?: string,
  month?: string,
  showL3: boolean = true,
): Promise<ProcessedAccount[]> {
  const apiKey =
    process.env.CMF_API_KEY || "d3217c0d406feca58306af437eb4c783de05febb";

  const now = new Date();
  const selectedYear = year || now.getFullYear().toString();
  const selectedMonth = (month || (now.getMonth() + 1).toString()).padStart(
    2,
    "0",
  );

  const url = `https://api.cmfchile.cl/api-sbifv3/recursos_api/balances/${selectedYear}/${selectedMonth}/instituciones/${code}?apikey=${apiKey}&formato=json`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(
          `No se encontraron datos de balance para la institución ${code} en el período ${selectedMonth}/${selectedYear}.`,
        );
      }
      throw new Error(`Error al consultar la CMF (${res.status}).`);
    }

    const data = await res.json();
    return parseBalanceAccounts(data, showL3);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudo conectar con el servicio de la CMF.");
  }
}

function parseNumber(value: string | number | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const number =
    typeof value === "number"
      ? value
      : Number(value.toString().replace(/\./g, "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function formatValue(value: string | number | undefined) {
  const num = parseNumber(value);
  if (num === null) return value ?? "—";
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2 }).format(
    num,
  );
}

function getValueColorClass(value: string | number | undefined) {
  const num = parseNumber(value);
  if (num === null) return "text-slate-900";
  if (num > 0) return "text-blue-600";
  if (num < 0) return "text-red-600";
  return "text-slate-900";
}

function getBadgeColor(tag: string) {
  switch (tag) {
    case "activo":
      return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
    case "pasivo":
      return "bg-amber-50 text-amber-800 border-amber-200/80";
    case "patrimonio":
      return "bg-sky-50 text-sky-800 border-sky-200/80";
    case "resultado":
      return "bg-purple-50 text-purple-800 border-purple-200/80";
    case "cuentas_orden":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function renderIndentedAccountName(nombre: string, profundidad: string) {
  switch (profundidad) {
    case "L0":
      return (
        <span className="font-bold text-slate-900 uppercase tracking-wide text-xs sm:text-sm">
          {nombre}
        </span>
      );
    case "L1":
      return (
        <div className="flex items-center gap-2 pl-4">
          <span className="h-2 w-2 rounded-full bg-slate-400"></span>
          <span className="font-semibold text-slate-800">{nombre}</span>
        </div>
      );
    case "L2":
      return (
        <div className="flex items-center gap-2 border-l-2 border-slate-200 pl-8 ml-3">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
          <span className="font-medium text-slate-700">{nombre}</span>
        </div>
      );
    case "L3":
      return (
        <div className="flex items-center gap-2 border-l-2 border-dashed border-slate-200 pl-12 ml-3">
          <span className="text-slate-300">└</span>
          <span className="text-slate-600 text-xs">{nombre}</span>
        </div>
      );
    default:
      return <span>{nombre}</span>;
  }
}

// ==========================================
// 2. COMPONENTES VISUALES
// ==========================================

function TableSkeleton() {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-panel shadow-sm animate-pulse">
      <div className="border-b border-line bg-slate-50 px-5 py-4">
        <div className="h-5 w-48 rounded-md bg-slate-200"></div>
        <div className="mt-2 h-4 w-64 rounded-md bg-slate-200"></div>
      </div>
      <div className="p-4 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-full rounded-lg bg-slate-100"></div>
        ))}
      </div>
    </div>
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

async function BalanceDataFetcher({
  code,
  year,
  month,
  showL3,
}: {
  code: string;
  year?: string;
  month?: string;
  showL3: boolean;
}) {
  let accounts: ProcessedAccount[] = [];
  try {
    accounts = await getBalanceAccounts(code, year, month, showL3);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar el balance.";
    return <ErrorMessage message={message} />;
  }

  if (accounts.length === 0) {
    return (
      <p className="mt-6 rounded-xl border border-line bg-panel p-6 text-muted">
        No hay cuentas registradas con saldo mayor a cero para esta consulta.
      </p>
    );
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
      <div className="border-b border-line bg-slate-50 px-5 py-4">
        <h2 className="font-bold text-ink">
          Cuentas de Balance{" "}
          {accounts[0]?.NombreInstitucion
            ? `— ${accounts[0].NombreInstitucion}`
            : ""}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Se cargaron {accounts.length} registros desde el servicio de la CMF.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Código</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Cuenta</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {accounts.map((account, index) => {
              const isL0 = account.profundidad === "L0";
              const colorClass = getValueColorClass(account.MonedaTotal);

              return (
                <tr
                  key={`${account.CodigoCuenta}-${index}`}
                  className={isL0 ? "bg-slate-50/70" : "hover:bg-slate-50/40"}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-brand-700">
                    {account.CodigoCuenta ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${getBadgeColor(
                        account.tag,
                      )}`}
                    >
                      {account.tipoCuenta}
                    </span>
                  </td>
                  <th scope="row" className="px-4 py-3 text-left font-normal">
                    {renderIndentedAccountName(
                      account.DescripcionCuenta ?? "Sin descripción",
                      account.profundidad,
                    )}
                  </th>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right ${colorClass} ${
                      isL0 ? "font-bold text-base" : "font-semibold"
                    }`}
                  >
                    {formatValue(account.MonedaTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 3. COMPONENTE PRINCIPAL (PÁGINA)
// ==========================================

export default async function BalancePage(props: {
  searchParams?: Promise<{
    codigo?: string | string[];
    year?: string | string[];
    month?: string | string[];
    l3?: string | string[];
  }>;
}) {
  const searchParams = await props.searchParams;

  const rawCode = Array.isArray(searchParams?.codigo)
    ? searchParams.codigo[0]
    : searchParams?.codigo;
  const rawYear = Array.isArray(searchParams?.year)
    ? searchParams.year[0]
    : searchParams?.year;
  const rawMonth = Array.isArray(searchParams?.month)
    ? searchParams.month[0]
    : searchParams?.month;
  const rawL3 = Array.isArray(searchParams?.l3)
    ? searchParams.l3[0]
    : searchParams?.l3;

  const code = rawCode?.trim();
  const year = rawYear?.trim();
  const month = rawMonth?.trim();

  // Evaluamos el valor de l3. Si no viene en los params, por defecto es true.
  const showL3 = rawL3 === undefined ? true : rawL3.toLowerCase() !== "false";

  const periodText = formatPeriod(year, month);

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
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

          {code && (
            <p className="mt-4 text-lg leading-8 text-muted">
              Detalle del balance financiero para la institución{" "}
              <span className="font-mono font-bold text-ink">{code}</span>.
            </p>
          )}
        </section>

        {!code ? (
          <ErrorMessage message="No se proporcionó un código de institución en la URL (?codigo=012)." />
        ) : (
          <Suspense
            key={`${code}-${year}-${month}-${showL3}`}
            fallback={<TableSkeleton />}
          >
            <BalanceDataFetcher
              code={code}
              year={year}
              month={month}
              showL3={showL3}
            />
          </Suspense>
        )}
      </main>

      <Footer />
    </div>
  );
}
