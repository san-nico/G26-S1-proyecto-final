import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

export const metadata: Metadata = {
  title: "Balances bancarios | CMF Bancos",
  description: "Entiende los activos pasivos y patrimonio publicados por la CMF Chile.",
};

type SearchParams = Promise<{
  codigo?: string | string[];
  q?: string | string[];
}>;

type Bank = {
  CodigoInstitucion: string;
  NombreInstitucion: string;
};

type BankFromApi = {
  CodigoInstitucion?: unknown;
  NombreInstitucion?: unknown;
};

type BalanceAccount = {
  CodigoCuenta?: string;
  DescripcionCuenta?: string;
  MonedaChilenaNoReajustable?: string | number;
  MonedaReajustablePorIPC?: string | number;
  MonedaReajustablePorTipoDeCambio?: string | number;
  MonedaExtranjera?: string | number;
  MonedaTotal?: string | number;
};

type BalanceTone = "assets" | "liabilities" | "equity";

type BalanceDetail = {
  code: string;
  label: string;
};

type BalanceGroup = {
  category: string;
  title: string;
  description: string;
  totalCode: string;
  details: BalanceDetail[];
  tone: BalanceTone;
};

type Period = {
  year: number;
  month: number;
};

type BanksResponse = {
  DescripcionesCodigosDeInstituciones?: BankFromApi[] | BankFromApi;
};

type BalancesResponse = {
  CodigosBalances?: BalanceAccount[] | BalanceAccount;
};

const API_URL = "https://api.cmfchile.cl/api-sbifv3/recursos_api/balances";

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

// La CMF ya entrega los totales y subtotales oficiales. Esta vista usa esos
// valores directamente para no duplicar montos al mezclar cuentas y detalles.
const BALANCE_GROUPS: BalanceGroup[] = [
  {
    category: "Recursos",
    title: "Activos",
    description: "Lo que el banco posee y lo que otras personas o empresas le deben.",
    totalCode: "100000000",
    tone: "assets",
    details: [
      { code: "105000000", label: "Efectivo y depósitos en bancos" },
      { code: "107000000", label: "Operaciones en liquidación" },
      { code: "110000000", label: "Activos financieros para negociar" },
      { code: "115000000", label: "Activos no destinados a negociación a valor razonable" },
      { code: "118000000", label: "Activos designados a valor razonable" },
      { code: "120000000", label: "Inversiones con cambios en otro resultado integral" },
      { code: "130000000", label: "Contratos de cobertura financiera" },
      { code: "140000000", label: "Créditos y otras inversiones a costo amortizado" },
      { code: "150000000", label: "Inversiones en sociedades" },
      { code: "160000000", label: "Activos intangibles" },
      { code: "170000000", label: "Propiedades y equipos" },
      { code: "175000000", label: "Derechos de uso por arrendamiento" },
      { code: "180000000", label: "Impuestos corrientes" },
      { code: "185000000", label: "Impuestos diferidos" },
      { code: "190000000", label: "Otros activos" },
      { code: "195000000", label: "Activos no corrientes para la venta" },
    ],
  },
  {
    category: "Obligaciones",
    title: "Pasivos",
    description: "Lo que el banco debe a clientes y a otras instituciones.",
    totalCode: "200000000",
    tone: "liabilities",
    details: [
      { code: "207000000", label: "Operaciones en liquidación" },
      { code: "210000000", label: "Pasivos financieros para negociar" },
      { code: "218000000", label: "Pasivos designados a valor razonable" },
      { code: "230000000", label: "Contratos de cobertura financiera" },
      { code: "240000000", label: "Depósitos de clientes y otras obligaciones" },
      { code: "250000000", label: "Obligaciones por arrendamientos" },
      { code: "255000000", label: "Instrumentos de capital regulatorio emitidos" },
      { code: "260000000", label: "Provisiones por contingencias" },
      { code: "265000000", label: "Provisiones para dividendos e instrumentos de capital" },
      { code: "270000000", label: "Provisiones especiales por riesgo de crédito" },
      { code: "280000000", label: "Impuestos corrientes" },
      { code: "285000000", label: "Impuestos diferidos" },
      { code: "290000000", label: "Otros pasivos" },
      { code: "295000000", label: "Pasivos asociados a grupos para la venta" },
    ],
  },
  {
    category: "Recursos propios",
    title: "Patrimonio",
    description: "El capital las reservas y los resultados que pertenecen a sus propietarios.",
    totalCode: "300000000",
    tone: "equity",
    details: [
      { code: "310000000", label: "Capital aportado" },
      { code: "320000000", label: "Reservas" },
      { code: "330000000", label: "Otro resultado integral acumulado" },
      { code: "340000000", label: "Utilidades o pérdidas de años anteriores" },
      { code: "350000000", label: "Utilidad o pérdida del ejercicio" },
      { code: "360000000", label: "Provisiones para dividendos e instrumentos de capital" },
      { code: "365000000", label: "Provisiones para remesas a casa matriz" },
      { code: "390000000", label: "Interés no controlador" },
    ],
  },
];

const BALANCE_TONE_STYLES: Record<
  BalanceTone,
  {
    card: string;
    badge: string;
    value: string;
    dot: string;
    disclosure: string;
  }
> = {
  assets: {
    card: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-900",
    value: "text-blue-700",
    dot: "bg-blue-700",
    disclosure: "border-blue-200",
  },
  liabilities: {
    card: "border-rose-200 bg-rose-50",
    badge: "bg-rose-100 text-rose-900",
    value: "text-rose-700",
    dot: "bg-rose-700",
    disclosure: "border-rose-200",
  },
  equity: {
    card: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-900",
    value: "text-emerald-700",
    dot: "bg-emerald-700",
    disclosure: "border-emerald-200",
  },
};

class CmfError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function asArray<T>(value: T[] | T | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseBanks(value: BankFromApi[] | BankFromApi | undefined): Bank[] {
  // La API a veces devuelve un objeto y otras veces una lista. También puede
  // omitir el nombre del código 999 que representa al sistema financiero.
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
  // La CMF puede responder errores en XML aunque se haya solicitado JSON.
  const match = body.match(/<(?:Mensaje|Message)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:Mensaje|Message)>/i);
  return match?.[1]?.trim();
}

async function requestCmf<T>(path: string, apiKey: string): Promise<T> {
  // La URL completa se construye dentro del componente de servidor para
  // mantener la API Key fuera del código JavaScript enviado al cliente.
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
  // Los informes mensuales se publican con desfase. Se revisan los últimos
  // 24 periodos comenzando por el mes anterior.
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - 1);

  return Array.from({ length: 24 }, (_, index) => {
    const period = new Date(date);
    period.setUTCMonth(period.getUTCMonth() - index);
    return { year: period.getUTCFullYear(), month: period.getUTCMonth() + 1 };
  });
}

async function getLatestBanks(apiKey: string) {
  // Se prueba cada periodo hasta encontrar el último que tenga instituciones.
  let consecutiveServerErrors = 0;

  for (const period of recentPeriods()) {
    const month = String(period.month).padStart(2, "0");

    try {
      const data = await requestCmf<BanksResponse>(
        `${period.year}/${month}/instituciones`,
        apiKey,
      );
      const banks = parseBanks(data.DescripcionesCodigosDeInstituciones);

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

  throw new CmfError("No hay balances recientes disponibles.", 404);
}

async function getBalance(apiKey: string, period: Period, code: string) {
  const month = String(period.month).padStart(2, "0");
  const data = await requestCmf<BalancesResponse>(
    `${period.year}/${month}/instituciones/${code}`,
    apiKey,
  );
  return asArray(data.CodigosBalances);
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatValue(value: string | number | undefined) {
  // Los montos de la CMF pueden venir como texto con separadores chilenos.
  if (value === undefined || value === "") return "—";
  const number =
    typeof value === "number"
      ? value
      : Number(value.replace(/\./g, "").replace(",", "."));

  return Number.isFinite(number)
    ? new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2 }).format(number)
    : value;
}

function indexAccounts(accounts: BalanceAccount[]) {
  const accountsByCode = new Map<string, BalanceAccount>();

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

function BalanceSummaryCard({
  group,
  account,
}: {
  group: BalanceGroup;
  account?: BalanceAccount;
}) {
  const styles = BALANCE_TONE_STYLES[group.tone];

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${styles.card}`}>
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={`size-2.5 rounded-full ${styles.dot}`} />
        <p className={`text-sm font-bold ${styles.value}`}>{group.category}</p>
      </div>
      <h4 className="mt-3 text-lg font-bold text-ink">{group.title}</h4>
      <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{group.description}</p>
      <p className={`mt-5 whitespace-nowrap font-mono text-xl font-bold tracking-tight tabular-nums sm:text-2xl md:text-lg xl:text-xl ${styles.value}`}>
        {formatValue(account?.MonedaTotal)}
      </p>
      <p className="mt-2 text-xs font-medium text-muted">CLP · subtotal oficial CMF</p>
    </article>
  );
}

function BalanceBreakdown({
  group,
  accountsByCode,
}: {
  group: BalanceGroup;
  accountsByCode: Map<string, BalanceAccount>;
}) {
  const styles = BALANCE_TONE_STYLES[group.tone];
  const total = accountsByCode.get(group.totalCode);
  const rows = group.details.flatMap((detail) => {
    const account = accountsByCode.get(detail.code);
    return account ? [{ ...detail, account }] : [];
  });

  if (!total && rows.length === 0) return null;

  return (
    <details className={`group overflow-hidden rounded-2xl border bg-panel shadow-sm ${styles.disclosure}`}>
      <summary className="flex min-h-14 cursor-pointer list-none items-start gap-3 px-4 py-4 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600 [&::-webkit-details-marker]:hidden sm:items-center sm:px-5">
        <span aria-hidden="true" className={`mt-1.5 size-2.5 shrink-0 rounded-full sm:mt-0 ${styles.dot}`} />
        <span className="min-w-0 flex-1">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles.badge}`}>
            {group.category}
          </span>
          <span className="mt-2 block font-bold text-ink">{group.title}</span>
          <span className="mt-1 block text-sm font-normal leading-6 text-muted">
            {group.description}
          </span>
          <span className={`mt-3 block font-mono text-lg font-bold tabular-nums sm:hidden ${styles.value}`}>
            {formatValue(total?.MonedaTotal)} CLP
          </span>
        </span>
        <span className="hidden shrink-0 text-right sm:block">
          <span className={`block font-mono text-lg font-bold tabular-nums ${styles.value}`}>
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
  // Cada imagen usa el código oficial de la institución. Si no existe una
  // imagen local se muestran las dos primeras letras como respaldo.
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

export default async function BalancesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedCode = firstValue(params.codigo)?.trim() ?? "";
  const query = firstValue(params.q)?.trim() ?? "";
  const apiKey = process.env.CMF_API_KEY;

  let banks: Bank[] = [];
  let accounts: BalanceAccount[] = [];
  let period: Period | null = null;
  let error = "";

  if (!apiKey) {
    error = "Falta configurar CMF_API_KEY en el archivo .env.local.";
  } else {
    try {
      const latest = await getLatestBanks(apiKey);
      banks = latest.banks;
      period = latest.period;

      if (selectedCode && /^\d{3}$/.test(selectedCode)) {
        accounts = await getBalance(apiKey, period, selectedCode);
      }
    } catch (requestError) {
      error = publicError(requestError);
    }
  }

  const selectedBank = banks.find(
    (bank) => bank.CodigoInstitucion === selectedCode,
  );
  const filteredBanks = query
    ? banks.filter((bank) =>
        normalize(`${bank.NombreInstitucion} ${bank.CodigoInstitucion}`).includes(
          normalize(query),
        ),
      )
    : banks;
  const accountsByCode = indexAccounts(accounts);

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <section className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-700">
            Datos oficiales CMF Chile
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Balances bancarios
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted">
            Busca una institución y entiende sus activos pasivos y patrimonio sin perder el detalle técnico.
          </p>
        </section>

        {error ? (
          <div role="alert" className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <h2 className="font-bold">No se pudo cargar la información</h2>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : (
          <>
            <section className="mt-10" aria-labelledby="banks-title">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h2 id="banks-title" className="text-2xl font-bold text-ink">
                    Instituciones
                  </h2>
                  {period && <p className="mt-1 text-sm text-muted">Período: {periodName(period)}</p>}
                </div>

                <form action="/balances" className="flex w-full max-w-md gap-2">
                  <label htmlFor="q" className="sr-only">Buscar banco</label>
                  <input
                    id="q"
                    name="q"
                    type="search"
                    defaultValue={query}
                    placeholder="Nombre o código"
                    className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-panel px-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  />
                  <button className="min-h-11 rounded-lg bg-brand-700 px-4 font-semibold text-white hover:bg-brand-800">
                    Buscar
                  </button>
                </form>
              </div>

              {filteredBanks.length === 0 ? (
                <p className="mt-6 rounded-xl border border-line bg-panel p-6 text-muted">
                  No encontramos bancos con esa búsqueda.
                </p>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredBanks.map((bank) => (
                    <article key={bank.CodigoInstitucion} className="flex flex-col rounded-xl border border-line bg-panel p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <BankLogo bank={bank} />
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-muted">
                          {bank.CodigoInstitucion}
                        </span>
                      </div>
                      <h3 className="mt-4 flex-1 font-bold text-ink">{bank.NombreInstitucion}</h3>
                      <Link
                        href={`/balances?codigo=${bank.CodigoInstitucion}#detalle`}
                        className="mt-5 rounded-lg bg-brand-700 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-800"
                      >
                        Ver balance
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {selectedCode && !selectedBank && (
              <p role="alert" className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
                El código seleccionado no corresponde a una institución del período.
              </p>
            )}

            {selectedBank && period && (
              <section id="detalle" className="mt-12 scroll-mt-6 space-y-8">
                <header className="rounded-2xl border border-line bg-panel p-5 shadow-sm sm:p-6">
                  <div className="flex items-start gap-4">
                    <BankLogo bank={selectedBank} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-700">Estado de situación financiera</p>
                      <h2 className="mt-1 text-2xl font-bold text-ink">
                        {selectedBank.NombreInstitucion}
                      </h2>
                      <p className="mt-2 text-sm text-muted">
                        Código {selectedBank.CodigoInstitucion} · Período informado: {periodName(period)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 max-w-3xl text-sm leading-6 text-muted">
                    Esta es una lectura simplificada de la estructura de NIC 1. Primero se muestra lo que el banco posee lo que debe y los recursos que pertenecen a sus propietarios.
                  </p>
                </header>

                <section aria-labelledby="balance-summary-title">
                  <div className="max-w-3xl">
                    <p className="text-sm font-bold uppercase tracking-widest text-brand-700">
                      Vista rápida
                    </p>
                    <h3 id="balance-summary-title" className="mt-2 text-2xl font-bold text-ink">
                      Resumen fácil de entender
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Las cifras corresponden a subtotales oficiales de la CMF. No se realizan cálculos adicionales.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {BALANCE_GROUPS.map((group) => (
                      <BalanceSummaryCard
                        key={group.totalCode}
                        group={group}
                        account={accountsByCode.get(group.totalCode)}
                      />
                    ))}
                  </div>
                </section>

                <section aria-labelledby="accounting-equation-title" className="rounded-2xl border border-line bg-panel p-5 shadow-sm sm:p-6">
                  <p className="text-sm font-bold uppercase tracking-widest text-brand-700">
                    Ecuación contable
                  </p>
                  <h3 id="accounting-equation-title" className="mt-2 text-2xl font-bold text-ink">
                    ¿Cómo se relacionan estas cifras?
                  </h3>
                  <p aria-label="Activos igual a pasivos más patrimonio" className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-xl font-bold sm:text-2xl">
                    <span className="text-blue-700">Activos</span>
                    <span aria-hidden="true" className="text-muted">=</span>
                    <span className="text-rose-700">Pasivos</span>
                    <span aria-hidden="true" className="text-muted">+</span>
                    <span className="text-emerald-700">Patrimonio</span>
                  </p>
                  <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-6 text-muted">
                    Todo recurso del banco se financia mediante obligaciones o recursos propios. La igualdad usa los subtotales publicados por la CMF.
                  </p>
                  {accountsByCode.get("510000000") && (
                    <p className="mt-4 text-center text-xs font-medium text-muted">
                      Total oficial de pasivos y patrimonio: {formatValue(accountsByCode.get("510000000")?.MonedaTotal)} CLP
                    </p>
                  )}
                </section>

                <section aria-labelledby="balance-breakdown-title">
                  <h3 id="balance-breakdown-title" className="text-2xl font-bold text-ink">
                    ¿Qué contiene cada parte?
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                    Abre una categoría para revisar sus principales componentes sin recorrer cientos de códigos.
                  </p>

                  <div className="mt-5 space-y-3">
                    {BALANCE_GROUPS.map((group) => (
                      <BalanceBreakdown
                        key={group.totalCode}
                        group={group}
                        accountsByCode={accountsByCode}
                      />
                    ))}
                  </div>
                </section>

                <details className="group overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 px-5 py-4 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ink">Detalle técnico completo</span>
                      <span className="mt-1 block text-sm text-muted">
                        {accounts.length.toLocaleString("es-CL")} cuentas y códigos informados por la CMF
                      </span>
                    </span>
                    <ChevronIcon />
                  </summary>

                  <div className="border-t border-line">
                    <p className="bg-slate-50 px-5 py-4 text-sm leading-6 text-muted">
                      Esta tabla conserva todas las monedas cuentas y subtotales tal como fueron recibidos desde la CMF.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[960px] text-left text-sm">
                        <caption className="sr-only">
                          Detalle técnico del balance de {selectedBank.NombreInstitucion}
                        </caption>
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
                        <tbody className="divide-y divide-slate-100">
                          {accounts.map((account, index) => (
                            <tr key={`${account.CodigoCuenta}-${index}`}>
                              <td className="whitespace-nowrap px-4 py-3 font-mono text-brand-700">
                                {account.CodigoCuenta ?? "—"}
                              </td>
                              <th scope="row" className="px-4 py-3 font-medium text-slate-800">
                                {account.DescripcionCuenta ?? "Sin descripción"}
                              </th>
                              <td className="whitespace-nowrap px-4 py-3 text-right">{formatValue(account.MonedaChilenaNoReajustable)}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-right">{formatValue(account.MonedaReajustablePorIPC)}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-right">{formatValue(account.MonedaReajustablePorTipoDeCambio)}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-right">{formatValue(account.MonedaExtranjera)}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-ink">{formatValue(account.MonedaTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </details>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
