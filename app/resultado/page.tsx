import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

export const metadata: Metadata = {
  title: "Resumen de Resultados | CMF Chile",
  description: "Resumen del estado de resultados publicado por la CMF.",
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
  MonedaTotal?: string;
};

type ResultTone = "income" | "expense" | "result";

type ResultGroup = {
  category: string;
  title: string;
  totalCode: string;
  tone: ResultTone;
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

// Solo conservamos las cuentas principales para los bloques de resumen
const SUMMARY_GROUPS: ResultGroup[] = [
  {
    category: "Ingresos",
    title: "Ingresos operacionales",
    totalCode: "550000000",
    tone: "income",
  },
  {
    category: "Gastos",
    title: "Gastos operacionales",
    totalCode: "560000000",
    tone: "expense",
  },
  {
    category: "Resultado",
    title: "Resultado del período",
    totalCode: "590000000",
    tone: "result",
  },
];

const RESULT_TONE_STYLES: Record<
  ResultTone,
  { card: string; dot: string; value: string }
> = {
  income: {
    card: "border-income-200 bg-income-50",
    dot: "bg-income-700",
    value: "text-income-700",
  },
  expense: {
    card: "border-expense-200 bg-expense-50",
    dot: "bg-expense-700",
    value: "text-expense-700",
  },
  result: {
    card: "border-result-200 bg-result-50",
    dot: "bg-result-700",
    value: "text-result-700",
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

async function requestCmf<T>(path: string, apiKey: string): Promise<T> {
  const url = new URL(`${API_URL}/${path}`);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("formato", "json");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  const body = await response.text();

  if (!response.ok) {
    throw new CmfError(
      "La CMF no pudo completar la consulta.",
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

  for (const period of recentPeriods()) {
    try {
      const banks = await getBanksByPeriod(apiKey, period);
      if (banks.length > 0) return { banks, period };
    } catch (error) {
      if (error instanceof CmfError && error.status === 404) continue;
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

function periodName(period: Period) {
  return `${MONTHS[period.month - 1]} de ${period.year}`;
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

function ResultSummaryCard({
  group,
  account,
}: {
  group: ResultGroup;
  account?: Account;
}) {
  const styles = RESULT_TONE_STYLES[group.tone];

  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm overflow-hidden ${styles.card}`}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`size-2.5 rounded-full shrink-0 ${styles.dot}`}
        />
        <p className={`text-sm font-bold truncate ${styles.value}`}>
          {group.category}
        </p>
      </div>
      <h3 className="mt-2 font-semibold text-ink truncate">{group.title}</h3>

      {/* Monto adaptado: tamaño más pequeño y prevención de desbordamiento */}
      <p
        className={`mt-3 font-mono text-xl sm:text-2xl font-bold tracking-tight tabular-nums truncate ${styles.value}`}
      >
        {formatValue(account?.MonedaTotal)}
      </p>

      <p className="mt-1 text-xs font-medium text-muted truncate">
        CLP · Subtotal oficial CMF
      </p>
    </article>
  );
}

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connection();

  const params = await searchParams;
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
      error =
        requestError instanceof Error
          ? requestError.message
          : "Error al conectar con la CMF.";
    }
  }

  const selectedBank = banks.find(
    (bank) => bank.CodigoInstitucion === selectedCode,
  );
  const accountsByCode = indexAccounts(accounts);

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <section className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-700">
            Datos oficiales CMF Chile
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Resumen de Resultados
          </h1>
          <p className="mt-3 text-base text-muted">
            Principales agregados financieros del período seleccionado.
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
            <div className="mt-10 space-y-8">
              {/* Encabezado del Banco Seleccionado */}
              <header className="rounded-2xl border border-line bg-panel p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-4">
                  <BankLogo bank={selectedBank} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-700">
                      Resumen Ejecutivo
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-ink">
                      {selectedBank.NombreInstitucion}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      Código {selectedBank.CodigoInstitucion} · Período:{" "}
                      {periodName(period)}
                    </p>
                  </div>
                </div>
              </header>

              {/* Únicamente Tarjetas de Resumen */}
              <section aria-label="Tarjetas de resumen financiero">
                <div className="grid gap-4 md:grid-cols-3">
                  {SUMMARY_GROUPS.map((group) => (
                    <ResultSummaryCard
                      key={group.totalCode}
                      group={group}
                      account={accountsByCode.get(group.totalCode)}
                    />
                  ))}
                </div>
              </section>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
