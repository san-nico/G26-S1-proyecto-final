import Image from "next/image";
import type { Metadata } from "next";
import { connection } from "next/server";
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

export const metadata: Metadata = {
  title: "Estado de Resultados | CMF Chile",
  description:
    "Consulta el estado de resultados detallado publicado por la CMF.",
};

type SearchParams = Promise<{
  codigo?: string | string[];
  year?: string | string[];
  month?: string | string[];
}>;

type Bank = {
  CodigoInstitucion: string;
  NombreInstitucion: string;
};

type BankFromApi = {
  CodigoInstitucion?: unknown;
  NombreInstitucion?: unknown;
};

type Account = {
  CodigoCuenta?: string;
  DescripcionCuenta?: string;
  CodigoInstitucion?: string;
  NombreInstitucion?: string;
  Anho?: number;
  Mes?: number;
  MonedaChilenaNoReajustable?: string;
  MonedaTotal?: string;
};

type ResultTone = "income" | "expense" | "result";

type ResultDetail = {
  code: string;
  label: string;
};

type ResultGroup = {
  category: string;
  title: string;
  description: string;
  totalCode: string;
  details: ResultDetail[];
  tone: ResultTone;
  featured?: boolean;
};

type Period = {
  year: number;
  month: number;
};

type BanksResponse = {
  DescripcionesCodigosDeInstituciones?: BankFromApi[] | BankFromApi;
};

type AccountsResponse = {
  CodigosEstadosDeResultado?: Account[] | Account;
};

const API_URL = "https://api.cmfchile.cl/api-sbifv3/recursos_api/resultados";

const BANK_LOGO_CODES = new Set([
  "001",
  "009",
  "012",
  "014",
  "016",
  "028",
  "031",
  "037",
  "039",
  "041",
  "051",
  "053",
  "055",
  "059",
  "060",
  "061",
  "062",
]);

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const RESULT_GROUPS: ResultGroup[] = [
  {
    category: "Ingresos",
    title: "Ingresos operacionales",
    description:
      "Intereses, comisiones, reajustes y otros resultados de la operación bancaria.",
    totalCode: "550000000",
    tone: "income",
    featured: true,
    details: [
      { code: "520000000", label: "Intereses netos" },
      { code: "525000000", label: "Reajustes netos por UF e IPC" },
      { code: "530000000", label: "Comisiones netas" },
      { code: "540000000", label: "Resultado financiero neto" },
      { code: "440000000", label: "Inversiones en sociedades" },
      { code: "450000000", label: "Activos disponibles para la venta" },
      { code: "455000000", label: "Otros ingresos operacionales" },
    ],
  },
  {
    category: "Gastos",
    title: "Gastos operacionales",
    description:
      "Personal, administración, depreciación y otros costos necesarios para operar.",
    totalCode: "560000000",
    tone: "expense",
    featured: true,
    details: [
      { code: "462000000", label: "Personal y beneficios a empleados" },
      { code: "464000000", label: "Administración" },
      { code: "466000000", label: "Depreciación y amortización" },
      { code: "468000000", label: "Deterioro de activos no financieros" },
      { code: "469000000", label: "Otros gastos operacionales" },
    ],
  },
  {
    category: "Costos",
    title: "Pérdidas crediticias",
    description:
      "Provisiones, recuperaciones y deterioros asociados al riesgo de crédito.",
    totalCode: "470000000",
    tone: "expense",
    details: [
      { code: "471000000", label: "Provisiones por riesgo de crédito" },
      { code: "472000000", label: "Provisiones especiales" },
      { code: "474000100", label: "Recuperación de créditos castigados" },
      { code: "476000000", label: "Deterioro de otros activos financieros" },
    ],
  },
  {
    category: "Resultado",
    title: "Resultado del período",
    description:
      "Camino desde la operación hasta la utilidad o pérdida final informada.",
    totalCode: "590000000",
    tone: "result",
    featured: true,
    details: [
      { code: "570000000", label: "Resultado antes de pérdidas crediticias" },
      { code: "470000000", label: "Pérdidas crediticias" },
      { code: "580000000", label: "Resultado operacional" },
      { code: "585000000", label: "Resultado antes de impuestos" },
      { code: "480000000", label: "Impuesto a la renta" },
      { code: "586000000", label: "Resultado después de impuestos" },
      { code: "603000000", label: "Otros resultados integrales" },
      { code: "690000000", label: "Resultado integral del período" },
    ],
  },
];

const RESULT_TONE_STYLES: Record<
  ResultTone,
  {
    card: string;
    badge: string;
    value: string;
    dot: string;
    disclosure: string;
  }
> = {
  income: {
    card: "border-income-200 bg-income-50",
    badge: "bg-income-100 text-income-900",
    value: "text-income-700",
    dot: "bg-income-700",
    disclosure: "border-income-200",
  },
  expense: {
    card: "border-expense-200 bg-expense-50",
    badge: "bg-expense-100 text-expense-900",
    value: "text-expense-700",
    dot: "bg-expense-700",
    disclosure: "border-expense-200",
  },
  result: {
    card: "border-result-200 bg-result-50",
    badge: "bg-result-100 text-result-900",
    value: "text-result-700",
    dot: "bg-result-700",
    disclosure: "border-result-200",
  },
};

class CmfError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function getApiKey() {
  return (
    process.env.CMF_API_KEY ??
    process.env.API_CMF_KEY ??
    process.env.SBIF_API_KEY ??
    process.env.API_KEY ??
    process.env.APIKEY
  );
}

function asArray<T>(value: T[] | T | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseBanks(value: BankFromApi[] | BankFromApi | undefined): Bank[] {
  return asArray(value).flatMap((bank) => {
    const code =
      typeof bank.CodigoInstitucion === "string"
        ? bank.CodigoInstitucion.trim()
        : "";
    const apiName =
      typeof bank.NombreInstitucion === "string"
        ? bank.NombreInstitucion.trim()
        : "";
    const name = apiName || (code === "999" ? "SISTEMA FINANCIERO" : "");

    return code && name
      ? [{ CodigoInstitucion: code, NombreInstitucion: name }]
      : [];
  });
}

function errorMessageFromXml(body: string) {
  const match = body.match(
    /<(?:Mensaje|Message)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:Mensaje|Message)>/i,
  );
  return match?.[1]?.trim();
}

async function requestCmf<T>(path: string, apiKey: string): Promise<T> {
  const url = new URL(`${API_URL}/${path}`);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("formato", "json");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new CmfError(
      errorMessageFromXml(body) || "La CMF no pudo completar la consulta.",
      response.status,
    );
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new CmfError("La CMF devolvió una respuesta inválida.", 502);
  }
}

function recentPeriods(): Period[] {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - 1);

  return Array.from({ length: 24 }, (_, index) => {
    const period = new Date(date);
    period.setUTCMonth(period.getUTCMonth() - index);
    return { year: period.getUTCFullYear(), month: period.getUTCMonth() + 1 };
  });
}

async function getBanksByPeriod(apiKey: string, period: Period) {
  const monthStr = String(period.month).padStart(2, "0");
  const data = await requestCmf<BanksResponse>(
    `${period.year}/${monthStr}/instituciones`,
    apiKey,
  );
  return parseBanks(data.DescripcionesCodigosDeInstituciones);
}

async function resolveBanksAndPeriod(
  apiKey: string,
  requestedPeriod?: Period | null,
) {
  if (requestedPeriod) {
    try {
      const banks = await getBanksByPeriod(apiKey, requestedPeriod);
      if (banks.length > 0) return { banks, period: requestedPeriod };
    } catch (error) {
      if (!(error instanceof CmfError && error.status === 404)) throw error;
    }
  }

  let consecutiveServerErrors = 0;

  for (const period of recentPeriods()) {
    try {
      const banks = await getBanksByPeriod(apiKey, period);
      if (banks.length > 0) return { banks, period };
    } catch (error) {
      if (error instanceof CmfError && error.status === 404) continue;
      if (error instanceof CmfError && error.status >= 500) {
        consecutiveServerErrors += 1;
        if (consecutiveServerErrors <= 2) continue;
      }
      throw error;
    }
  }

  throw new CmfError("No hay resultados recientes disponibles.", 404);
}

async function getAccounts(apiKey: string, period: Period, code: string) {
  const month = String(period.month).padStart(2, "0");
  const data = await requestCmf<AccountsResponse>(
    `${period.year}/${month}/instituciones/${code}`,
    apiKey,
  );
  return asArray(data.CodigosEstadosDeResultado);
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseYearMonth(
  yearParam?: string,
  monthParam?: string,
): Period | null {
  if (!yearParam || !monthParam) return null;
  const year = Number(yearParam);
  const month = Number(monthParam);

  if (
    Number.isInteger(year) &&
    year >= 2000 &&
    year <= 2100 &&
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12
  ) {
    return { year, month };
  }
  return null;
}

function formatValue(value: string | number | undefined) {
  if (value === undefined || value === "") return "—";
  const number =
    typeof value === "number"
      ? value
      : Number(value.replace(/\./g, "").replace(",", "."));

  return Number.isFinite(number)
    ? new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2 }).format(
        number,
      )
    : value;
}

function indexAccounts(accounts: Account[]) {
  const accountsByCode = new Map<string, Account>();
  for (const account of accounts) {
    const code = account.CodigoCuenta?.trim();
    if (code) accountsByCode.set(code, account);
  }
  return accountsByCode;
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="mt-1 size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none sm:mt-0"
    >
      <path
        d="m5 7.5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ResultSummaryCard({
  group,
  account,
}: {
  group: ResultGroup;
  account?: Account;
}) {
  const styles = RESULT_TONE_STYLES[group.tone];

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${styles.card}`}>
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`size-2.5 rounded-full ${styles.dot}`}
        />
        <p className={`text-sm font-bold ${styles.value}`}>{group.category}</p>
      </div>
      <h3 className="mt-3 font-semibold text-ink">{group.title}</h3>
      <p
        className={`mt-5 whitespace-nowrap font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl md:text-xl xl:text-2xl ${styles.value}`}
      >
        {formatValue(account?.MonedaTotal)}
      </p>
      <p className="mt-2 text-xs font-medium text-muted">
        CLP · Subtotal oficial CMF
      </p>
    </article>
  );
}

function ResultBreakdown({
  group,
  accountsByCode,
}: {
  group: ResultGroup;
  accountsByCode: Map<string, Account>;
}) {
  const styles = RESULT_TONE_STYLES[group.tone];
  const total = accountsByCode.get(group.totalCode);
  const rows = group.details.flatMap((detail) => {
    const account = accountsByCode.get(detail.code);
    return account ? [{ ...detail, account }] : [];
  });

  if (!total && rows.length === 0) return null;

  return (
    <details
      className={`group overflow-hidden rounded-2xl border bg-panel shadow-sm ${styles.disclosure}`}
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-start gap-3 px-4 py-4 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600 [&::-webkit-details-marker]:hidden sm:items-center sm:px-5">
        <span
          aria-hidden="true"
          className={`mt-1.5 size-2.5 shrink-0 rounded-full sm:mt-0 ${styles.dot}`}
        />
        <span className="min-w-0 flex-1">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles.badge}`}
          >
            {group.category}
          </span>
          <span className="mt-2 block font-bold text-ink">{group.title}</span>
          <span className="mt-1 block text-sm font-normal leading-6 text-muted">
            {group.description}
          </span>
          <span
            className={`mt-3 block font-mono text-lg font-bold tabular-nums sm:hidden ${styles.value}`}
          >
            {formatValue(total?.MonedaTotal)} CLP
          </span>
        </span>
        <span className="hidden shrink-0 text-right sm:block">
          <span
            className={`block font-mono text-lg font-bold tabular-nums ${styles.value}`}
          >
            {formatValue(total?.MonedaTotal)}
          </span>
          <span className="mt-1 block text-xs font-medium text-muted">CLP</span>
        </span>
        <ChevronIcon />
      </summary>

      <dl className="divide-y divide-slate-100 border-t border-line bg-white">
        {rows.map(({ code, label, account }) => (
          <div
            key={code}
            className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:px-5"
          >
            <dt className="text-sm font-medium text-slate-800">
              {label}
              <span className="ml-2 whitespace-nowrap font-mono text-xs font-normal text-muted">
                {code}
              </span>
            </dt>
            <dd className="font-mono text-sm font-semibold tabular-nums text-ink sm:text-right">
              {formatValue(account.MonedaTotal)} CLP
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

function periodName(period: Period) {
  return `${MONTHS[period.month - 1]} de ${period.year}`;
}

function publicError(error: unknown) {
  if (error instanceof CmfError && error.status === 420) {
    return "La API key alcanzó el límite mensual de consultas de la CMF.";
  }
  if (error instanceof CmfError && error.status === 421) {
    return "La API key de la CMF no es válida.";
  }
  if (error instanceof CmfError && error.status === 422) {
    return "La solicitud no incluyó la API key de la CMF.";
  }
  if (error instanceof CmfError && error.status >= 500) {
    return "La CMF presenta un problema temporal. Intenta nuevamente en unos minutos.";
  }
  return error instanceof Error
    ? error.message
    : "No fue posible conectar con la CMF.";
}

function BankLogo({ bank }: { bank: Bank }) {
  if (!BANK_LOGO_CODES.has(bank.CodigoInstitucion)) {
    return (
      <span className="grid size-14 place-items-center rounded-xl bg-brand-100 text-sm font-bold text-brand-800">
        {bank.NombreInstitucion.slice(0, 2)}
      </span>
    );
  }

  return (
    <span className="grid size-14 place-items-center rounded-xl border border-line bg-white p-2">
      <Image
        src={`/bank-logos/${bank.CodigoInstitucion}.png`}
        alt={`Logo de ${bank.NombreInstitucion}`}
        width={48}
        height={48}
        className="size-10 object-contain"
      />
    </span>
  );
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connection();

  const params = await searchParams;
  // Código por defecto "999" (Sistema Financiero) en caso de no proveer un código específico
  const selectedCode = firstValue(params.codigo)?.trim() || "999";
  const yearParam = firstValue(params.year)?.trim();
  const monthParam = firstValue(params.month)?.trim();

  const requestedPeriod = parseYearMonth(yearParam, monthParam);
  const apiKey = getApiKey();

  let banks: Bank[] = [];
  let accounts: Account[] = [];
  let period: Period | null = null;
  let error = "";

  if (!apiKey) {
    error = "Falta configurar CMF_API_KEY en el archivo .env.local.";
  } else {
    try {
      const resolved = await resolveBanksAndPeriod(apiKey, requestedPeriod);
      banks = resolved.banks;
      period = resolved.period;

      if (selectedCode && /^\d{3}$/.test(selectedCode)) {
        accounts = await getAccounts(apiKey, period, selectedCode);
      }
    } catch (requestError) {
      error = publicError(requestError);
    }
  }

  const selectedBank = banks.find(
    (bank) => bank.CodigoInstitucion === selectedCode,
  );
  const accountsByCode = indexAccounts(accounts);
  const featuredGroups = RESULT_GROUPS.filter((group) => group.featured);

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <section className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-700">
            Datos oficiales CMF Chile
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Estado de Resultados
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted">
            Consulta los ingresos, gastos y el resultado neto de las
            instituciones bancarias informadas a la CMF.
          </p>
        </section>

        {error ? (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900"
          >
            <h2 className="font-bold">No se pudo cargar la información</h2>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : (
          selectedBank &&
          period && (
            <div className="mt-10 space-y-10">
              <header className="rounded-2xl border border-line bg-panel p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-4">
                  <BankLogo bank={selectedBank} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-700">
                      Estado de Resultados
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-ink">
                      {selectedBank.NombreInstitucion}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      Código {selectedBank.CodigoInstitucion} · Período
                      informado: {periodName(period)}
                    </p>
                  </div>
                </div>
              </header>

              {/* Resumen en Tarjetas */}
              <section aria-labelledby="summary-title">
                <div className="max-w-3xl">
                  <p className="text-sm font-bold uppercase tracking-widest text-brand-700">
                    Vista rápida
                  </p>
                  <h3
                    id="summary-title"
                    className="mt-2 text-2xl font-bold text-ink"
                  >
                    Resumen del período
                  </h3>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {featuredGroups.map((group) => (
                    <ResultSummaryCard
                      key={group.totalCode}
                      group={group}
                      account={accountsByCode.get(group.totalCode)}
                    />
                  ))}
                </div>
              </section>

              {/* Desglose por Categorías */}
              <section aria-labelledby="breakdown-title">
                <h3
                  id="breakdown-title"
                  className="text-2xl font-bold text-ink"
                >
                  Composición del resultado
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                  Desglose de las principales cuentas operacionales y finales.
                </p>

                <div className="mt-5 space-y-3">
                  {RESULT_GROUPS.map((group) => (
                    <ResultBreakdown
                      key={group.totalCode}
                      group={group}
                      accountsByCode={accountsByCode}
                    />
                  ))}
                </div>
              </section>

              {/* Tabla Técnica Completa */}
              <details className="group overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 px-5 py-4 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink">
                      Detalle técnico completo
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {accounts.length.toLocaleString("es-CL")} cuentas y
                      códigos informados por la CMF
                    </span>
                  </span>
                  <ChevronIcon />
                </summary>

                <div className="border-t border-line">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <caption className="sr-only">
                        Detalle técnico del estado de resultados de{" "}
                        {selectedBank.NombreInstitucion}
                      </caption>
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Código</th>
                          <th className="px-4 py-3">Cuenta</th>
                          <th className="px-4 py-3 text-right">
                            Moneda Chilena No Reaj.
                          </th>
                          <th className="px-4 py-3 text-right">Moneda Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {accounts.map((account, index) => (
                          <tr key={`${account.CodigoCuenta}-${index}`}>
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-brand-700">
                              {account.CodigoCuenta ?? "—"}
                            </td>
                            <th
                              scope="row"
                              className="px-4 py-3 font-medium text-slate-800"
                            >
                              {account.DescripcionCuenta ?? "Sin descripción"}
                            </th>
                            <td className="whitespace-nowrap px-4 py-3 text-right font-mono">
                              {formatValue(account.MonedaChilenaNoReajustable)}{" "}
                              CLP
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-bold text-ink">
                              {formatValue(account.MonedaTotal)} CLP
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </details>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
