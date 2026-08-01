import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

export const metadata: Metadata = {
  title: "Balances bancarios | CMF Bancos",
  description: "Consulta los balances mensuales publicados por la CMF Chile.",
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

class CmfError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function getApiKey() {
  // La clave se lee únicamente en el servidor y nunca se entrega al navegador.
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

function periodName(period: Period) {
  return `${MONTHS[period.month - 1]} de ${period.year}`;
}

function publicError(error: unknown) {
  // Los códigos técnicos se convierten en mensajes comprensibles para la vista.
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
  // connection vuelve dinámica la ruta y searchParams es asíncrono en Next 16.
  await connection();

  const params = await searchParams;
  const selectedCode = firstValue(params.codigo)?.trim() ?? "";
  const query = firstValue(params.q)?.trim() ?? "";
  const apiKey = getApiKey();

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
            Busca una institución y revisa las cuentas de su último balance mensual disponible.
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
              <section id="detalle" className="mt-12 scroll-mt-6 overflow-hidden rounded-xl border border-line bg-panel">
                <div className="border-b border-line p-5 sm:p-6">
                  <p className="text-sm font-semibold text-brand-700">Balance mensual</p>
                  <h2 className="mt-1 text-2xl font-bold text-ink">{selectedBank.NombreInstitucion}</h2>
                  <p className="mt-2 text-sm text-muted">
                    Código {selectedBank.CodigoInstitucion} · {periodName(period)}
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
                    <tbody className="divide-y divide-slate-100">
                      {accounts.map((account, index) => (
                        <tr key={`${account.CodigoCuenta}-${index}`}>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-brand-700">{account.CodigoCuenta ?? "—"}</td>
                          <th scope="row" className="px-4 py-3 font-medium text-slate-800">{account.DescripcionCuenta ?? "Sin descripción"}</th>
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
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
