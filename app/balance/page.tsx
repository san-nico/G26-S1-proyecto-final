import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

export const metadata: Metadata = {
  title: "Resumen de Balance | CMF Chile",
  description:
    "Consulta el resumen del balance general de una institución bancaria.",
};

// ==========================================
// 1. TIPOS Y CONSTANTES
// ==========================================

type Account = {
  CodigoCuenta?: string;
  DescripcionCuenta?: string;
  NombreInstitucion?: string;
  MonedaTotal?: string | number;
};

type BalanceGroup = {
  category: string;
  title: string;
  totalCode: string;
  tone: "activo" | "pasivo" | "patrimonio";
};

// Cuentas de nivel general CMF para el resumen
const BALANCE_SUMMARY_GROUPS: BalanceGroup[] = [
  {
    category: "Activo",
    title: "Activo Total",
    totalCode: "100000000",
    tone: "activo",
  },
  {
    category: "Pasivo",
    title: "Pasivo Total",
    totalCode: "200000000",
    tone: "pasivo",
  },
  {
    category: "Patrimonio",
    title: "Patrimonio Total",
    totalCode: "300000000",
    tone: "patrimonio",
  },
];

const BALANCE_TONE_STYLES: Record<
  BalanceGroup["tone"],
  { card: string; dot: string; value: string }
> = {
  activo: {
    card: "border-emerald-200 bg-emerald-50/50",
    dot: "bg-emerald-600",
    value: "text-emerald-700",
  },
  pasivo: {
    card: "border-amber-200 bg-amber-50/50",
    dot: "bg-amber-600",
    value: "text-amber-700",
  },
  patrimonio: {
    card: "border-sky-200 bg-sky-50/50",
    dot: "bg-sky-600",
    value: "text-sky-700",
  },
};

// ==========================================
// 2. HELPERS Y SERVICIOS
// ==========================================

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

async function getBalanceSummary(
  code: string,
  year?: string,
  month?: string,
): Promise<{ bankName: string; accountsByCode: Map<string, Account> }> {
  const apiKey =
    process.env.CMF_API_KEY || "d3217c0d406feca58306af437eb4c783de05febb";

  const now = new Date();
  const selectedYear = year || now.getFullYear().toString();
  const selectedMonth = (month || (now.getMonth() + 1).toString()).padStart(
    2,
    "0",
  );

  const url = `https://api.cmfchile.cl/api-sbifv3/recursos_api/balances/${selectedYear}/${selectedMonth}/instituciones/${code}?apikey=${apiKey}&formato=json`;

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
  const raw = data?.CodigosBalances;
  const accounts: Account[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

  const accountsByCode = new Map<string, Account>();
  let bankName = "";

  for (const acc of accounts) {
    const accountCode = acc.CodigoCuenta?.trim();
    if (accountCode) {
      accountsByCode.set(accountCode, acc);
    }
    if (!bankName && acc.NombreInstitucion) {
      bankName = acc.NombreInstitucion;
    }
  }

  return { bankName, accountsByCode };
}

// ==========================================
// 3. COMPONENTES VISUALES
// ==========================================

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

function BalanceSummaryCard({
  group,
  account,
}: {
  group: BalanceGroup;
  account?: Account;
}) {
  const styles = BALANCE_TONE_STYLES[group.tone];

  return (
    <article
      className={`overflow-hidden rounded-2xl border p-5 shadow-sm ${styles.card}`}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`size-2.5 shrink-0 rounded-full ${styles.dot}`}
        />
        <p className={`text-sm font-bold truncate ${styles.value}`}>
          {group.category}
        </p>
      </div>
      <h3 className="mt-2 font-semibold text-ink truncate">{group.title}</h3>

      {/* Monto adaptado: tamaño más pequeño, prevención de desbordamiento y tooltip nativo */}
      <p
        className={`mt-3 truncate font-mono text-xl font-bold tracking-tight tabular-nums sm:text-2xl ${styles.value}`}
      >
        {formatValue(account?.MonedaTotal)}
      </p>

      <p className="mt-1 truncate text-xs font-medium text-muted">
        CLP · Subtotal oficial CMF
      </p>
    </article>
  );
}

// ==========================================
// 4. COMPONENTE PRINCIPAL (PÁGINA)
// ==========================================

export default async function BalancePage(props: {
  searchParams?: Promise<{
    codigo?: string | string[];
    year?: string | string[];
    month?: string | string[];
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

  const code = rawCode?.trim();
  const year = rawYear?.trim();
  const month = rawMonth?.trim();

  const periodText = formatPeriod(year, month);

  let bankName = "";
  let accountsByCode = new Map<string, Account>();
  let error = "";

  if (code) {
    try {
      const data = await getBalanceSummary(code, year, month);
      bankName = data.bankName;
      accountsByCode = data.accountsByCode;
    } catch (err) {
      error =
        err instanceof Error ? err.message : "Error al cargar el balance.";
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
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
            Resumen de Balance
          </h1>

          {code && (
            <p className="mt-3 text-base text-muted">
              Principales agregados patrimoniales de la institución{" "}
              <span className="font-mono font-bold text-ink">{code}</span>
              {bankName ? ` (${bankName})` : ""}.
            </p>
          )}
        </section>

        {!code ? (
          <ErrorMessage message="No se proporcionó un código de institución en la URL (?codigo=012)." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <section className="mt-8" aria-label="Tarjetas de resumen de balance">
            <div className="grid gap-4 md:grid-cols-3">
              {BALANCE_SUMMARY_GROUPS.map((group) => (
                <BalanceSummaryCard
                  key={group.totalCode}
                  group={group}
                  account={accountsByCode.get(group.totalCode)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
