import type {
  AccountDetailResponse,
  AccountsResponse,
  Bank,
  CmfAccount,
  FetchPerfilParams,
  PerfilInstitucion,
  PerfilResponseAPI,
} from "@/lib/types";
import { ACCOUNTS_BALANCE } from "@/lib/types";

const CMF_BASE_URL = "https://cmf-api-chile.vercel.app/api-sbifv3/recursos_api";

async function cmfFetch(url: string, init?: RequestInit): Promise<Response> {
  console.log(`[CMF] GET ${url}`);
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(
      `CMF API error: ${res.status} ${res.statusText} for URL: ${url}`,
    );
  }
  return res;
}

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

export async function getBanks(year?: string, month?: string): Promise<Bank[]> {
  getApiKey();
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

async function getAccountDetailByResource(
  resource: string,
  listKey: string,
  accountCode: string,
  year: string,
  month: string,
): Promise<AccountDetailResponse> {
  const apiKey = getApiKey();
  const url = `${CMF_BASE_URL}/${resource}/${year}/${month}/cuentas/${accountCode}?apikey=${apiKey}&formato=json`;

  const res = await cmfFetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  const data = await res.json();
  const rawList = data?.[listKey];
  const list: CmfAccount[] = Array.isArray(rawList)
    ? rawList
    : [rawList].filter(Boolean);

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
  const apiKey = getApiKey();
  const { year: defaultYear, month: defaultMonth } = getCurrentYearMonth();
  const institucionYear = year || defaultYear;
  const institucionMonth = month || defaultMonth;

  const apiUrl = `${CMF_BASE_URL}/perfil/instituciones/${codigo}/${institucionYear}/${institucionMonth}?apikey=${apiKey}&formato=json`;

  const res = await cmfFetch(apiUrl, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  const data: PerfilResponseAPI = await res.json();
  const perfil = data?.Perfiles?.[0]?.Perfil;
  const institucion = data?.Perfiles?.[0]?.Institucion;

  if (!perfil) {
    throw new Error("No se encontró el perfil en la respuesta de la CMF.");
  }

  const fechaFormateada = perfil.fechaPublicacion
    ? new Date(perfil.fechaPublicacion).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No disponible";

  return {
    nombre: perfil.nombre,
    rut: perfil.rut,
    codigoSWIFT: perfil.codigoSWIFT,
    direccionWeb: perfil.direccionWeb,
    telefono: perfil.telefono,
    direccionPrincipal: perfil.direccionPrincipal?.trim(),
    contactoPublico: perfil.contactoPublico,
    telefonoPublico: perfil.telefonoPublico,
    direccionPublico: perfil.direccionPublico,
    sucursales: perfil.sucursales ?? 0,
    oficinas: perfil.oficinas ?? 0,
    cajeros: perfil.cajeros ?? 0,
    empleados: perfil.empleados ?? 0,
    empHombresPerm: perfil.emp_hombres_perm ?? 0,
    empMujeresPerm: perfil.emp_mujereres_perm ?? 0,
    empHombresExt: perfil.emp_hombres_ext ?? 0,
    empMujeresExt: perfil.emp_mujeres_ext ?? 0,
    codigoInstitucion: institucion?.CodigoInstitucion?.trim() || "",
    fechaFormateada,
  };
}
