/**
 * Consultas de la CMF (bancos) específicas de esta aplicación.
 * Construye sobre el cliente genérico `@/lib/cmf-bancos`.
 */

import type {
  BalanceAccount,
  CmfAccount,
  CMFConfig,
  FetchPerfilParams,
  Perfil,
  PerfilResponseAPI,
} from "@/lib/cmf-bancos";
import { cmfRequest } from "@/lib/cmf-bancos";
import { toNumber } from "@/lib/format";

export interface Bank {
  CodigoInstitucion: string;
  NombreInstitucion: string;
}

export interface AccountsResponse {
  bankName: string;
  accounts: Record<string, string>;
}

export interface AccountDetailEntry {
  bankName: string;
  value: string;
}

export interface AccountDetailResponse {
  accountName: string;
  institutions: Record<string, AccountDetailEntry>;
}

export interface AccountCell {
  money: string;
  percent: string;
}

export interface FullBalance {
  bankName: string;
  accounts: BalanceAccount[];
}

export type PerfilInstitucion = Perfil & {
  codigoInstitucion: string;
  fechaFormateada: string;
};

export interface AccountTarget {
  code: string;
  category: string;
  title: string;
  cardClass: string;
  textClass: string;
}

export const ACCOUNTS_BALANCE: AccountTarget[] = [
  {
    code: "100000000",
    category: "Activo",
    title: "Activo Total",
    cardClass: "border-income-200 bg-income-50/60",
    textClass: "text-income-700",
  },
  {
    code: "200000000",
    category: "Pasivo",
    title: "Pasivo Total",
    cardClass: "border-alert-border bg-[#fef3c7]/60",
    textClass: "text-[#b45309]",
  },
  {
    code: "300000000",
    category: "Patrimonio",
    title: "Patrimonio Total",
    cardClass: "border-result-200 bg-result-50/60",
    textClass: "text-result-700",
  },
];

export const ACCOUNTS_RESULTADO: AccountTarget[] = [
  {
    code: "550000000",
    category: "Ingresos",
    title: "Ingresos operacionales",
    cardClass: "border-income-200 bg-income-50",
    textClass: "text-income-700",
  },
  {
    code: "560000000",
    category: "Gastos",
    title: "Gastos operacionales",
    cardClass: "border-expense-200 bg-expense-50",
    textClass: "text-expense-700",
  },
  {
    code: "590000000",
    category: "Resultado",
    title: "Resultado del período",
    cardClass: "border-result-200 bg-result-50",
    textClass: "text-result-700",
  },
];

function getApiKey(): string {
  const apiKey = process.env.CMF_API_KEY;
  if (!apiKey) {
    throw new Error(
      "La clave de la API (CMF_API_KEY) no está configurada en .env.local.",
    );
  }
  return apiKey;
}

function getCurrentYearMonth(): { year: string; month: string } {
  const now = new Date();
  return {
    year: now.getFullYear().toString(),
    month: (now.getMonth() + 1).toString().padStart(2, "0"),
  };
}

/** MM-pad a month string for URI segments. */
function mm(month: string): string {
  return month.padStart(2, "0");
}

let cachedConfig: CMFConfig | null = null;
let cachedPerfilConfig: CMFConfig | null = null;

function getConfig(): CMFConfig {
  if (!cachedConfig) {
    cachedConfig = {
      apikey: getApiKey(),
      fetch: (url) =>
        fetch(url, {
          headers: { Accept: "application/json" },
          next: { revalidate: 3600 },
        }),
    };
  }
  return cachedConfig;
}

function getPerfilConfig(): CMFConfig {
  if (!cachedPerfilConfig) {
    cachedPerfilConfig = {
      apikey: getApiKey(),
      fetch: (url) =>
        fetch(url, {
          cache: "no-store",
          headers: { "User-Agent": "Mozilla/5.0" },
        }),
    };
  }
  return cachedPerfilConfig;
}

export async function getBanks(year?: string, month?: string): Promise<Bank[]> {
  const { year: defaultYear, month: defaultMonth } = getCurrentYearMonth();
  const selectedYear = year || defaultYear;
  const selectedMonth = month || defaultMonth;

  const baseCode = ACCOUNTS_BALANCE[0]?.code;
  if (!baseCode) return [];

  const detail = await getAccountDetailByAllInstitutions(
    baseCode,
    selectedYear,
    selectedMonth,
  );

  return Object.entries(detail.institutions)
    .map(([code, entry]) => ({
      CodigoInstitucion: code,
      NombreInstitucion: entry.bankName,
    }))
    .filter((b) => b.CodigoInstitucion && b.NombreInstitucion);
}

async function getInstitutionName(
  institutionCode: string,
  year: string,
  month: string,
  resource: string,
  listKey: string,
  accountCode: string,
): Promise<string> {
  try {
    const detail = await getAccountDetailByResource(
      resource,
      listKey,
      accountCode,
      year,
      month,
    );
    const name = detail.institutions[institutionCode]?.bankName;
    if (name) return name;
  } catch (error) {
    console.warn(
      `[CMF] Could not fetch institution name for ${institutionCode}:`,
      error,
    );
  }
  return institutionCode === "999"
    ? "SISTEMA FINANCIERO"
    : `Institución ${institutionCode}`;
}

async function fetchAccountResourceAccounts(
  resource: string,
  listKey: string,
  code: string,
  year: string,
  month: string,
  accountCodes: string[],
): Promise<AccountsResponse> {
  const accountMap = await getAccountsByAllInstitutionsForResource(
    resource,
    listKey,
    accountCodes,
    year,
    month,
  );

  const accounts = Object.fromEntries(
    accountCodes.map((accountCode) => [
      accountCode,
      accountMap[accountCode]?.[code] ?? "",
    ]),
  );

  const baseCode = accountCodes[0];
  const bankName = baseCode
    ? await getInstitutionName(code, year, month, resource, listKey, baseCode)
    : "";

  return { bankName, accounts };
}

export async function getBalanceAccounts(
  code: string,
  year: string,
  month: string,
  accountCodes: string[],
): Promise<AccountsResponse> {
  return fetchAccountResourceAccounts(
    "balances",
    "CodigosBalances",
    code,
    year,
    month,
    accountCodes,
  );
}

export async function getResultAccounts(
  code: string,
  year: string,
  month: string,
  accountCodes: string[],
): Promise<AccountsResponse> {
  return fetchAccountResourceAccounts(
    "resultados",
    "CodigosEstadosDeResultado",
    code,
    year,
    month,
    accountCodes,
  );
}

function resolveMonedaTotal(acc: BalanceAccount): string | null {
  const raw = acc.MonedaTotal;
  if (raw != null && raw.trim() !== "") return raw;

  const parts = [
    acc.MonedaChilenaNoReajustable,
    acc.MonedaReajustablePorIPC,
    acc.MonedaReajustablePorTipoDeCambio,
    acc.MonedaExtranjera,
    acc.MonedaReajustable,
  ];
  if (!parts.some((p) => p != null && p.trim() !== "")) return null;

  const total = parts.reduce((sum, p) => sum + (toNumber(p ?? "") || 0), 0);
  return total.toString();
}

export async function getFullBalance(
  code: string,
  year: string,
  month: string,
): Promise<FullBalance> {
  const data = (await cmfRequest(
    getConfig(),
    `/balances/${year}/${mm(month)}/instituciones/${code}`,
  )) as { CodigosBalances?: BalanceAccount | BalanceAccount[] };
  const rawList = data?.CodigosBalances;
  const list: BalanceAccount[] = Array.isArray(rawList)
    ? rawList
    : rawList
      ? [rawList]
      : [];

  const accounts = list
    .map((acc) => ({
      ...acc,
      MonedaTotal: resolveMonedaTotal(acc),
    }))
    .sort((a, b) => a.CodigoCuenta.localeCompare(b.CodigoCuenta));

  const bankName =
    accounts.find((acc) => acc?.NombreInstitucion)?.NombreInstitucion?.trim() ||
    (code === "999" ? "SISTEMA FINANCIERO" : `Institución ${code}`);

  return { bankName, accounts };
}

async function getAccountDetailByResource(
  resource: string,
  listKey: string,
  accountCode: string,
  year: string,
  month: string,
): Promise<AccountDetailResponse> {
  const data = (await cmfRequest(
    getConfig(),
    `/${resource}/${year}/${mm(month)}/cuentas/${accountCode}`,
  )) as Record<string, unknown>;
  const rawList = data?.[listKey];
  const list: CmfAccount[] = Array.isArray(rawList)
    ? rawList
    : rawList
      ? [rawList as CmfAccount]
      : [];

  const institutions: AccountDetailResponse["institutions"] = {};
  let accountName = "";

  list.forEach((acc) => {
    const code = acc?.CodigoInstitucion?.trim();
    if (!code) return;
    if (!accountName && acc?.DescripcionCuenta) {
      accountName = acc.DescripcionCuenta;
    }
    institutions[code] = {
      bankName:
        acc?.NombreInstitucion?.trim() ||
        (code === "999" ? "SISTEMA FINANCIERO" : `Institución ${code}`),
      value: acc?.MonedaTotal ?? "",
    };
  });

  return { accountName, institutions };
}

export async function getAccountDetailByAllInstitutions(
  accountCode: string,
  year: string,
  month: string,
): Promise<AccountDetailResponse> {
  return getAccountDetailByResource(
    "balances",
    "CodigosBalances",
    accountCode,
    year,
    month,
  );
}

async function getAccountsByAllInstitutionsForResource(
  resource: string,
  listKey: string,
  accountCodes: string[],
  year: string,
  month: string,
): Promise<Record<string, Record<string, string>>> {
  const results = await Promise.all(
    accountCodes.map(async (accountCode) => {
      try {
        const data = await getAccountDetailByResource(
          resource,
          listKey,
          accountCode,
          year,
          month,
        );
        const values = Object.fromEntries(
          Object.entries(data.institutions).map(([institutionCode, entry]) => [
            institutionCode,
            entry.value,
          ]),
        );
        return { accountCode, values };
      } catch (error) {
        console.warn(
          `[CMF] Failed to fetch account ${accountCode} for resource ${resource}:`,
          error,
        );
        return { accountCode, values: {} };
      }
    }),
  );

  return Object.fromEntries(
    results.map((result) => [result.accountCode, result.values]),
  );
}

export async function getAccountsByAllInstitutions(
  accountCodes: string[],
  year: string,
  month: string,
): Promise<Record<string, Record<string, string>>> {
  return getAccountsByAllInstitutionsForResource(
    "balances",
    "CodigosBalances",
    accountCodes,
    year,
    month,
  );
}

export async function getPerfilInstitucion({
  codigo,
  year,
  month,
}: FetchPerfilParams): Promise<PerfilInstitucion> {
  const { year: defaultYear, month: defaultMonth } = getCurrentYearMonth();
  const institucionYear = year || defaultYear;
  const institucionMonth = month || defaultMonth;

  const data = (await cmfRequest(
    getPerfilConfig(),
    `/perfil/instituciones/${codigo ?? ""}/${institucionYear}/${mm(institucionMonth)}`,
  )) as PerfilResponseAPI;
  const perfilData = data?.Perfiles?.[0]?.Perfil;
  const institucion = data?.Perfiles?.[0]?.Institucion;

  if (!perfilData) {
    throw new Error("No se encontró el perfil en la respuesta de la CMF.");
  }

  const fechaFormateada = perfilData.fechaPublicacion
    ? new Date(perfilData.fechaPublicacion).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No disponible";

  return {
    ...perfilData,
    codigoInstitucion: institucion?.CodigoInstitucion?.trim() || "",
    fechaFormateada,
  };
}