const CMF_BASE_URL =
  "https://cmf-api-chile.vercel.app//api-sbifv3/recursos_api";

export interface Bank {
  CodigoInstitucion: string;
  NombreInstitucion: string;
}

export async function getBanks(year?: string, month?: string): Promise<Bank[]> {
  const apiKey = process.env.CMF_API_KEY;

  if (!apiKey) {
    throw new Error(
      "La clave de la API (CMF_API_KEY) no está configurada en .env.local.",
    );
  }

  const now = new Date();
  const selectedYear = year || now.getFullYear().toString();
  const selectedMonth = (month || (now.getMonth() + 1).toString()).padStart(
    2,
    "0",
  );

  const url = `${CMF_BASE_URL}/balances/${selectedYear}/${selectedMonth}/instituciones?apikey=${apiKey}&formato=json`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `No se pudo obtener la información de la CMF para ${selectedMonth}/${selectedYear}.`,
    );
  }

  const data = await res.json();
  const raw = data?.DescripcionesCodigosDeInstituciones;
  if (!raw) return [];

  return (Array.isArray(raw) ? raw : [raw])
    .map((b) => ({
      CodigoInstitucion: b?.CodigoInstitucion?.toString().trim() || "",
      NombreInstitucion: b?.NombreInstitucion?.toString().trim() || "",
    }))
    .filter((b) => b.CodigoInstitucion && b.NombreInstitucion);
}

interface CmfAccount {
  CodigoCuenta?: string;
  MonedaTotal?: string;
  NombreInstitucion?: string;
}

export interface AccountsResponse {
  bankName: string;
  accounts: Record<string, string>;
}

async function fetchAccounts(
  resource: string,
  listKey: string,
  code: string,
  year: string,
  month: string,
): Promise<AccountsResponse> {
  const url = `${CMF_BASE_URL}/${resource}/${year}/${month}/instituciones/${code}?apikey=${process.env.CMF_API_KEY || ""}&formato=json`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error();

  const data = await res.json();
  const list: CmfAccount[] = Array.isArray(data?.[listKey])
    ? data[listKey]
    : [data?.[listKey]];

  let bankName = "";
  const rawData: Record<string, string> = {};

  list.forEach((acc) => {
    if (acc?.CodigoCuenta)
      rawData[acc.CodigoCuenta.trim()] = acc.MonedaTotal ?? "";
    if (!bankName && acc?.NombreInstitucion) bankName = acc.NombreInstitucion;
  });

  bankName ||= code === "999" ? "SISTEMA FINANCIERO" : `Institución ${code}`;

  return { bankName, accounts: rawData };
}

export function getBalanceAccounts(
  code: string,
  year: string,
  month: string,
): Promise<AccountsResponse> {
  return fetchAccounts("balances", "CodigosBalances", code, year, month);
}

export function getResultAccounts(
  code: string,
  year: string,
  month: string,
): Promise<AccountsResponse> {
  return fetchAccounts(
    "resultados",
    "CodigosEstadosDeResultado",
    code,
    year,
    month,
  );
}

export function formatValue(value?: string) {
  if (!value) return "—";
  const num = Math.round(Number(value.replace(",", ".")));
  return Number.isNaN(num) ? value : num.toLocaleString("es-CL");
}

export interface PerfilInstitucion {
  nombre: string;
  rut: string;
  codigoSWIFT: string;
  direccionWeb: string;
  telefono: string;
  direccionPrincipal?: string;
  contactoPublico: string;
  telefonoPublico: string;
  direccionPublico: string;
  sucursales: number;
  oficinas: number;
  cajeros: number;
  empleados: number;
  fechaFormateada: string;
}

interface PerfilResponseAPI {
  Perfiles: {
    Perfil: {
      codigoSWIFT: string;
      nombre: string;
      rut: string;
      direccionPrincipal: string;
      telefono: string;
      direccionWeb: string;
      contactoPublico: string;
      direccionPublico: string;
      telefonoPublico: string;
      sucursales: number;
      empleados: number;
      fechaPublicacion: string;
      cajeros: number;
      oficinas: number;
    };
  }[];
}

interface FetchPerfilParams {
  codigo?: string;
  year?: string;
  month?: string;
}

export async function getPerfilInstitucion({
  codigo,
  year,
  month,
}: FetchPerfilParams): Promise<PerfilInstitucion> {
  const institucionCodigo = codigo;
  const institucionYear = year || "2026";
  const institucionMonth = month || "06";

  const apiKey = process.env.CMF_API_KEY;

  const apiUrl = `${CMF_BASE_URL}/perfil/instituciones/${institucionCodigo}/${institucionYear}/${institucionMonth}?apikey=${apiKey}&formato=json`;

  const res = await fetch(apiUrl, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Error en la API: ${res.status}`);
  }

  const data: PerfilResponseAPI = await res.json();
  const perfil = data?.Perfiles?.[0]?.Perfil;

  if (!perfil) {
    throw new Error("No se encontró el perfil en la respuesta.");
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
    fechaFormateada,
  };
}
