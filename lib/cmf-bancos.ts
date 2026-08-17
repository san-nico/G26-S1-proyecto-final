/**
 * CMF Bancos API v3 — functional TypeScript client.
 * Wraps every documented endpoint of:
 *   - Balance Mensual de Bancos  (/balances)
 *   - Estado de Resultados       (/resultados)
 *   - Fichas Bancarias           (/perfil, /accionistas, /integrantes)
 *   - Adecuación de Capital      (/adecuacion)
 *
 * JSON output is used by default. Set `formato: "xml"` per call or in the
 * config to switch. Requires a CMF API key (https://api.cmfchile.cl).
 */

export type Formato = "json" | "xml" | "JSON" | "XML";
export type Periodo = "periodo1" | "periodo2" | "periodo3";

/** Loose response type: payload shape varies per report. */
export type CmfResponse = any;

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

const DEFAULT_BASE_URL = "https://api.cmfchile.cl/api-sbifv3/recursos_api";

/** MM-pad a month number for URI segments. */
const mm = (month: number): string => String(month).padStart(2, "0");

/**
 * Build a full URL for an API path, appending apikey/formato/callback.
 * `path` should start with "/" (e.g. "/balances/2009/12/instituciones").
 */
export const cmfUrl = (
  config: CMFConfig,
  path: string,
  formato: Formato = config.formato ?? "json",
): string => {
  const query = new URLSearchParams();
  query.set("apikey", config.apikey);
  query.set("formato", formato);
  if (config.callback) query.set("callback", config.callback);
  const base = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  return `${base}${path}?${query.toString()}`;
};

/** Execute a GET against the API and parse the response. */
export const cmfRequest = async <T = CmfResponse>(
  config: CMFConfig,
  path: string,
  formato?: Formato,
): Promise<T> => {
  const fetcher =
    config.fetch ??
    (typeof fetch !== "undefined"
      ? fetch
      : (() => {
          throw new CMFError(
            "cmfRequest: no hay `fetch` global disponible (Node < 18). Pasa una implementación en `fetch`.",
          );
        })());
  const res = await fetcher(cmfUrl(config, path, formato));
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
};

// ─────────────────────────────────────────────────────────────
// Balance Mensual de Bancos
// ─────────────────────────────────────────────────────────────

/** Listado de instituciones vigentes para un mes/año. */
export const balanceInstituciones = (
  config: CMFConfig,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/balances/${year}/${mm(month)}/instituciones`, formato);

/** Balance completo de una institución para todos los meses del año. */
export const balanceAnual = (
  config: CMFConfig,
  institution: string,
  year: number,
  formato?: Formato,
) => cmfRequest(config, `/balances/${year}/instituciones/${institution}`, formato);

/** Balance completo de una institución para un mes/año. */
export const balanceMensual = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/balances/${year}/${mm(month)}/instituciones/${institution}`, formato);

/** Balance de una institución para el mes indicado dentro de un período de años comparable. */
export const balancePeriodo = (
  config: CMFConfig,
  institution: string,
  periodo: Periodo,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/balances/${periodo}/${mm(month)}/instituciones/${institution}`, formato);

/** Listado de cuentas del Balance para un mes/año. */
export const balanceCuentas = (
  config: CMFConfig,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/balances/${year}/${mm(month)}/cuentas`, formato);

/** Detalle de una cuenta del Balance (todas las instituciones) en un mes/año. */
export const balanceCuentaMensual = (
  config: CMFConfig,
  cuenta: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/balances/${year}/${mm(month)}/cuentas/${cuenta}`, formato);

/** Detalle de una cuenta del Balance (todas las instituciones) para todo el año. */
export const balanceCuentaAnual = (
  config: CMFConfig,
  cuenta: string,
  year: number,
  formato?: Formato,
) => cmfRequest(config, `/balances/${year}/cuentas/${cuenta}`, formato);

/** Detalle de una cuenta del Balance para una institución durante todo el año. */
export const balanceCuentaAnualInstitucion = (
  config: CMFConfig,
  cuenta: string,
  institution: string,
  year: number,
  formato?: Formato,
) => cmfRequest(config, `/balances/${year}/cuentas/${cuenta}/instituciones/${institution}`, formato);

/** Detalle de una cuenta del Balance para una institución en un mes/año. */
export const balanceCuentaMensualInstitucion = (
  config: CMFConfig,
  cuenta: string,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/balances/${year}/${mm(month)}/cuentas/${cuenta}/instituciones/${institution}`, formato);

/** Detalle de una cuenta del Balance para una institución en el mes de un período de años comparable. */
export const balanceCuentaPeriodo = (
  config: CMFConfig,
  cuenta: string,
  institution: string,
  periodo: Periodo,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/balances/${periodo}/${mm(month)}/cuentas/${cuenta}/instituciones/${institution}`, formato);

// ─────────────────────────────────────────────────────────────
// Estado de Resultados de Bancos
// ─────────────────────────────────────────────────────────────

/** Listado de instituciones vigentes para un mes/año. */
export const resultadoInstituciones = (
  config: CMFConfig,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/resultados/${year}/${mm(month)}/instituciones`, formato);

/** Estado de Resultados de una institución para todos los meses del año. */
export const resultadoAnual = (
  config: CMFConfig,
  institution: string,
  year: number,
  formato?: Formato,
) => cmfRequest(config, `/resultados/${year}/instituciones/${institution}`, formato);

/** Estado de Resultados de una institución para un mes/año. */
export const resultadoMensual = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/resultados/${year}/${mm(month)}/instituciones/${institution}`, formato);

/** Estado de Resultados de una institución para el mes de un período de años comparable. */
export const resultadoPeriodo = (
  config: CMFConfig,
  institution: string,
  periodo: Periodo,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/resultados/${periodo}/${mm(month)}/instituciones/${institution}`, formato);

/** Listado de cuentas del Estado de Resultados para un mes/año. */
export const resultadoCuentas = (
  config: CMFConfig,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/resultados/${year}/${mm(month)}/cuentas`, formato);

/** Detalle de una cuenta del Estado de Resultados (todas las instituciones) en un mes/año. */
export const resultadoCuentaMensual = (
  config: CMFConfig,
  cuenta: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/resultados/${year}/${mm(month)}/cuentas/${cuenta}`, formato);

/** Detalle de una cuenta del Estado de Resultados (todas las instituciones) para todo el año. */
export const resultadoCuentaAnual = (
  config: CMFConfig,
  cuenta: string,
  year: number,
  formato?: Formato,
) => cmfRequest(config, `/resultados/${year}/cuentas/${cuenta}`, formato);

/** Detalle de una cuenta del Estado de Resultados para una institución durante todo el año. */
export const resultadoCuentaAnualInstitucion = (
  config: CMFConfig,
  cuenta: string,
  institution: string,
  year: number,
  formato?: Formato,
) => cmfRequest(config, `/resultados/${year}/cuentas/${cuenta}/instituciones/${institution}`, formato);

/** Detalle de una cuenta del Estado de Resultados para una institución en un mes/año. */
export const resultadoCuentaMensualInstitucion = (
  config: CMFConfig,
  cuenta: string,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/resultados/${year}/${mm(month)}/cuentas/${cuenta}/instituciones/${institution}`, formato);

/** Detalle de una cuenta del Estado de Resultados para una institución en el mes de un período de años comparable. */
export const resultadoCuentaPeriodo = (
  config: CMFConfig,
  cuenta: string,
  institution: string,
  periodo: Periodo,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/resultados/${periodo}/${mm(month)}/cuentas/${cuenta}/instituciones/${institution}`, formato);

// ─────────────────────────────────────────────────────────────
// Fichas Bancarias
// ─────────────────────────────────────────────────────────────

/** Perfil (SWIFT, RUT, sucursales, empleados, etc.) de una institución en una fecha. */
export const perfil = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/perfil/instituciones/${institution}/${year}/${mm(month)}`, formato);

/** Nómina de accionistas de una institución en un mes/año. */
export const accionistas = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/accionistas/instituciones/${institution}/anhos/${year}/meses/${mm(month)}/ficha`, formato);

/** Nómina de ejecutivos/integrantes principales de una institución en un mes/año. */
export const integrantes = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/integrantes/instituciones/${institution}/anhos/${year}/meses/${mm(month)}`, formato);

// ─────────────────────────────────────────────────────────────
// Adecuación de Capital
// ─────────────────────────────────────────────────────────────

/** Indicador IRS (Patrimonio efectivo / Activos ponderados por riesgo) en un mes/año. */
export const adecuacionIRS = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/indicadores/irs`, formato);

/** Indicador IRE (Capital básico / Activos totales) en un mes/año. */
export const adecuacionIRE = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/indicadores/ire`, formato);

/** Capital básico (millones de pesos) para `count` meses, el más nuevo al final. */
export const adecuacionCapitalBasico = (
  config: CMFConfig,
  institution: string,
  count: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/regresionmensual/${count}/instituciones/${institution}/indicadores/capbas`, formato);

/** Patrimonio efectivo (millones de pesos) para `count` meses. */
export const adecuacionPatrimonioEfectivo = (
  config: CMFConfig,
  institution: string,
  count: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/regresionmensual/${count}/instituciones/${institution}/indicadores/patefe`, formato);

/** Indicador IRS (%) para `count` meses consecutivos. */
export const adecuacionIRSMensual = (
  config: CMFConfig,
  institution: string,
  count: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/regresionmensual/${count}/instituciones/${institution}/indicadores/irs`, formato);

/** Indicador IRE (%) para `count` meses consecutivos. */
export const adecuacionIREMensual = (
  config: CMFConfig,
  institution: string,
  count: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/regresionmensual/${count}/instituciones/${institution}/indicadores/ire`, formato);

/** Todos los componentes de la Adecuación de Capital en un mes/año. */
export const adecuacionComponentes = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes`, formato);

/** Componentes de Activos (ponderados por riesgo y totales) en un mes/año. */
export const adecuacionActivos = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes/activos`, formato);

/** Activos ponderados por riesgo de crédito (millones de pesos). */
export const adecuacionActivosAPC = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes/activos/apc`, formato);

/** Activos totales (millones de pesos). */
export const adecuacionActivosATC = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes/activos/atc`, formato);

/** Componentes de Patrimonio Efectivo en un mes/año. */
export const adecuacionPatrimonio = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes/patrimonioefectivo`, formato);

/** Capital básico dentro de Patrimonio Efectivo. */
export const adecuacionCapitalBasicoComponente = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes/patrimonioefectivo/cb`, formato);

/** Provisiones voluntarias dentro de Patrimonio Efectivo. */
export const adecuacionProvisionesVoluntarias = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes/patrimonioefectivo/pv`, formato);

/** Bonos subordinados dentro de Patrimonio Efectivo. */
export const adecuacionBonosSubordinados = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes/patrimonioefectivo/bs`, formato);

/** Interés minoritario dentro de Patrimonio Efectivo. */
export const adecuacionInteresMinoritario = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes/patrimonioefectivo/im`, formato);

/** Activos deducibles dentro de Patrimonio Efectivo. */
export const adecuacionActivosDeducibles = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes/patrimonioefectivo/ad`, formato);

/** Límites de componentes del Patrimonio Efectivo en un mes/año. */
export const adecuacionLimites = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes/limites`, formato);

/** Límite: Bonos subordinados como parte del capital básico. */
export const adecuacionLimiteBSCB = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes/limites/bs_cb`, formato);

/** Límite: Interés minoritario como parte del capital básico. */
export const adecuacionLimiteIMCB = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes/limites/im_cb`, formato);

/** Límite: Provisiones voluntarias como parte de los activos ponderados por riesgo. */
export const adecuacionLimitePVAP = (
  config: CMFConfig,
  institution: string,
  year: number,
  month: number,
  formato?: Formato,
) => cmfRequest(config, `/adecuacion/anhos/${year}/meses/${mm(month)}/instituciones/${institution}/componentes/limites/pv_ap`, formato);

// ─────────────────────────────────────────────────────────────
// Convenience: bind config once and reuse everywhere.
// ─────────────────────────────────────────────────────────────

export interface CMFClient {
  url: (path: string, formato?: Formato) => string;
  request: <T = CmfResponse>(path: string, formato?: Formato) => Promise<T>;
  balanceInstituciones: (year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  balanceAnual: (institution: string, year: number, formato?: Formato) => Promise<CmfResponse>;
  balanceMensual: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  balancePeriodo: (institution: string, periodo: Periodo, month: number, formato?: Formato) => Promise<CmfResponse>;
  balanceCuentas: (year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  balanceCuentaMensual: (cuenta: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  balanceCuentaAnual: (cuenta: string, year: number, formato?: Formato) => Promise<CmfResponse>;
  balanceCuentaAnualInstitucion: (cuenta: string, institution: string, year: number, formato?: Formato) => Promise<CmfResponse>;
  balanceCuentaMensualInstitucion: (cuenta: string, institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  balanceCuentaPeriodo: (cuenta: string, institution: string, periodo: Periodo, month: number, formato?: Formato) => Promise<CmfResponse>;
  resultadoInstituciones: (year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  resultadoAnual: (institution: string, year: number, formato?: Formato) => Promise<CmfResponse>;
  resultadoMensual: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  resultadoPeriodo: (institution: string, periodo: Periodo, month: number, formato?: Formato) => Promise<CmfResponse>;
  resultadoCuentas: (year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  resultadoCuentaMensual: (cuenta: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  resultadoCuentaAnual: (cuenta: string, year: number, formato?: Formato) => Promise<CmfResponse>;
  resultadoCuentaAnualInstitucion: (cuenta: string, institution: string, year: number, formato?: Formato) => Promise<CmfResponse>;
  resultadoCuentaMensualInstitucion: (cuenta: string, institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  resultadoCuentaPeriodo: (cuenta: string, institution: string, periodo: Periodo, month: number, formato?: Formato) => Promise<CmfResponse>;
  perfil: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  accionistas: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  integrantes: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionIRS: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionIRE: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionCapitalBasico: (institution: string, count: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionPatrimonioEfectivo: (institution: string, count: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionIRSMensual: (institution: string, count: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionIREMensual: (institution: string, count: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionComponentes: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionActivos: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionActivosAPC: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionActivosATC: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionPatrimonio: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionCapitalBasicoComponente: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionProvisionesVoluntarias: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionBonosSubordinados: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionInteresMinoritario: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionActivosDeducibles: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionLimites: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionLimiteBSCB: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionLimiteIMCB: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
  adecuacionLimitePVAP: (institution: string, year: number, month: number, formato?: Formato) => Promise<CmfResponse>;
}

/** Bind a config and get every endpoint as a closure-based client (no classes). */
export const createCMFClient = (config: CMFConfig): CMFClient => {
  const c = { ...config, formato: config.formato ?? "json" } as CMFConfig;
  return {
    url: (path, formato) => cmfUrl(c, path, formato),
    request: (path, formato) => cmfRequest(c, path, formato),
    balanceInstituciones: (year, month, formato) => balanceInstituciones(c, year, month, formato),
    balanceAnual: (institution, year, formato) => balanceAnual(c, institution, year, formato),
    balanceMensual: (institution, year, month, formato) => balanceMensual(c, institution, year, month, formato),
    balancePeriodo: (institution, periodo, month, formato) => balancePeriodo(c, institution, periodo, month, formato),
    balanceCuentas: (year, month, formato) => balanceCuentas(c, year, month, formato),
    balanceCuentaMensual: (cuenta, year, month, formato) => balanceCuentaMensual(c, cuenta, year, month, formato),
    balanceCuentaAnual: (cuenta, year, formato) => balanceCuentaAnual(c, cuenta, year, formato),
    balanceCuentaAnualInstitucion: (cuenta, institution, year, formato) => balanceCuentaAnualInstitucion(c, cuenta, institution, year, formato),
    balanceCuentaMensualInstitucion: (cuenta, institution, year, month, formato) => balanceCuentaMensualInstitucion(c, cuenta, institution, year, month, formato),
    balanceCuentaPeriodo: (cuenta, institution, periodo, month, formato) => balanceCuentaPeriodo(c, cuenta, institution, periodo, month, formato),
    resultadoInstituciones: (year, month, formato) => resultadoInstituciones(c, year, month, formato),
    resultadoAnual: (institution, year, formato) => resultadoAnual(c, institution, year, formato),
    resultadoMensual: (institution, year, month, formato) => resultadoMensual(c, institution, year, month, formato),
    resultadoPeriodo: (institution, periodo, month, formato) => resultadoPeriodo(c, institution, periodo, month, formato),
    resultadoCuentas: (year, month, formato) => resultadoCuentas(c, year, month, formato),
    resultadoCuentaMensual: (cuenta, year, month, formato) => resultadoCuentaMensual(c, cuenta, year, month, formato),
    resultadoCuentaAnual: (cuenta, year, formato) => resultadoCuentaAnual(c, cuenta, year, formato),
    resultadoCuentaAnualInstitucion: (cuenta, institution, year, formato) => resultadoCuentaAnualInstitucion(c, cuenta, institution, year, formato),
    resultadoCuentaMensualInstitucion: (cuenta, institution, year, month, formato) => resultadoCuentaMensualInstitucion(c, cuenta, institution, year, month, formato),
    resultadoCuentaPeriodo: (cuenta, institution, periodo, month, formato) => resultadoCuentaPeriodo(c, cuenta, institution, periodo, month, formato),
    perfil: (institution, year, month, formato) => perfil(c, institution, year, month, formato),
    accionistas: (institution, year, month, formato) => accionistas(c, institution, year, month, formato),
    integrantes: (institution, year, month, formato) => integrantes(c, institution, year, month, formato),
    adecuacionIRS: (institution, year, month, formato) => adecuacionIRS(c, institution, year, month, formato),
    adecuacionIRE: (institution, year, month, formato) => adecuacionIRE(c, institution, year, month, formato),
    adecuacionCapitalBasico: (institution, count, formato) => adecuacionCapitalBasico(c, institution, count, formato),
    adecuacionPatrimonioEfectivo: (institution, count, formato) => adecuacionPatrimonioEfectivo(c, institution, count, formato),
    adecuacionIRSMensual: (institution, count, formato) => adecuacionIRSMensual(c, institution, count, formato),
    adecuacionIREMensual: (institution, count, formato) => adecuacionIREMensual(c, institution, count, formato),
    adecuacionComponentes: (institution, year, month, formato) => adecuacionComponentes(c, institution, year, month, formato),
    adecuacionActivos: (institution, year, month, formato) => adecuacionActivos(c, institution, year, month, formato),
    adecuacionActivosAPC: (institution, year, month, formato) => adecuacionActivosAPC(c, institution, year, month, formato),
    adecuacionActivosATC: (institution, year, month, formato) => adecuacionActivosATC(c, institution, year, month, formato),
    adecuacionPatrimonio: (institution, year, month, formato) => adecuacionPatrimonio(c, institution, year, month, formato),
    adecuacionCapitalBasicoComponente: (institution, year, month, formato) => adecuacionCapitalBasicoComponente(c, institution, year, month, formato),
    adecuacionProvisionesVoluntarias: (institution, year, month, formato) => adecuacionProvisionesVoluntarias(c, institution, year, month, formato),
    adecuacionBonosSubordinados: (institution, year, month, formato) => adecuacionBonosSubordinados(c, institution, year, month, formato),
    adecuacionInteresMinoritario: (institution, year, month, formato) => adecuacionInteresMinoritario(c, institution, year, month, formato),
    adecuacionActivosDeducibles: (institution, year, month, formato) => adecuacionActivosDeducibles(c, institution, year, month, formato),
    adecuacionLimites: (institution, year, month, formato) => adecuacionLimites(c, institution, year, month, formato),
    adecuacionLimiteBSCB: (institution, year, month, formato) => adecuacionLimiteBSCB(c, institution, year, month, formato),
    adecuacionLimiteIMCB: (institution, year, month, formato) => adecuacionLimiteIMCB(c, institution, year, month, formato),
    adecuacionLimitePVAP: (institution, year, month, formato) => adecuacionLimitePVAP(c, institution, year, month, formato),
  };
};

export default createCMFClient;