/**
 * CMF Bancos API v3 — TypeScript client.
 * Generic URL builder + fetch for the CMF API (https://api.cmfchile.cl).
 * Call `cmfRequest(config, path)` with any documented endpoint path.
 *
 * JSON output is used by default. Set `formato: "xml"` per call or in the
 * config to switch. Requires a CMF API key (https://api.cmfchile.cl).
 */

import { API_BASE_URL } from "@/lib/config";

export type Formato = "json" | "xml" | "JSON" | "XML";

/** Loose response type: payload shape varies per report. */
export type CmfResponse = unknown;

/** A row of a `CodigosBalances`/`CodigosEstadosDeResultado` response. */
export interface CmfAccount {
  CodigoCuenta?: string;
  DescripcionCuenta?: string;
  CodigoInstitucion?: string;
  MonedaTotal?: string;
  NombreInstitucion?: string;
}

/** A full balance row of `/balances/.../instituciones/{code}`. */
export interface BalanceAccount {
  CodigoCuenta: string;
  DescripcionCuenta: string;
  CodigoInstitucion: string;
  NombreInstitucion: string;
  Anho: string;
  Mes: string;
  MonedaChilenaNoReajustable: string | null;
  MonedaReajustablePorIPC: string | null;
  MonedaReajustablePorTipoDeCambio: string | null;
  MonedaExtranjera: string | null;
  MonedaReajustable: string | null;
  MonedaTotal: string | null;
}

/** Profile of a bank as returned by the `/perfil` endpoint. */
export interface Perfil {
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
  emp_hombres_perm: number;
  emp_mujereres_perm: number;
  emp_hombres_ext: number;
  emp_mujeres_ext: number;
}

/** Bank identification as returned by the `/perfil` endpoint. */
export interface Institucion {
  CodigoInstitucion: string;
  NombreInstitucion: string;
}

/** Response schema of the `/perfil` endpoint. */
export interface PerfilResponseAPI {
  Perfiles: {
    Perfil: Perfil;
    Institucion: Institucion;
  }[];
}

/** Params accepted by the `/perfil` endpoint helper. */
export interface FetchPerfilParams {
  codigo?: string;
  year?: string;
  month?: string;
}

export interface CMFConfig {
  apikey: string;
  formato?: Formato;
  callback?: string;
  /** Override the API base URL. */
  baseUrl?: string;
  /** Custom fetch implementation (for Node < 18 or proxies). */
  fetch?: typeof fetch;
}

export class CMFError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "CMFError";
  }
}

const DEFAULT_BASE_URL = API_BASE_URL;

/**
 * Build a full URL for an API path, appending apikey/formato/callback.
 * `path` should start with "/" (e.g. "/balances/2009/12/instituciones").
 */
export function cmfUrl(
  config: CMFConfig,
  path: string,
  formato: Formato = config.formato ?? "json",
): string {
  const query = new URLSearchParams();
  query.set("apikey", config.apikey);
  query.set("formato", formato);
  if (config.callback) query.set("callback", config.callback);
  const base = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  return `${base}${path}?${query.toString()}`;
}

/** Execute a GET against the API and parse the response. */
export async function cmfRequest<T = CmfResponse>(
  config: CMFConfig,
  path: string,
  formato?: Formato,
): Promise<T> {
  const fetcher =
    config.fetch ??
    (typeof fetch !== "undefined"
      ? fetch
      : () => {
          throw new CMFError(
            "cmfRequest: no hay `fetch` global disponible (Node < 18). Pasa una implementación en `fetch`.",
          );
        });
  const url = cmfUrl(config, path, formato);
  console.log(`[CMF] GET ${url}`);
  const res = await fetcher(url);
  const text = await res.text();
  if (!res.ok) {
    throw new CMFError(`CMFError: HTTP ${res.status} en ${path}`, res.status, text);
  }
  if ((formato ?? config.formato ?? "json").toLowerCase() === "json") {
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new CMFError("cmfRequest: la respuesta no es JSON válido.", res.status, text);
    }
  }
  return text as unknown as T;
}