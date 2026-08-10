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

export interface FullBalance {
  bankName: string;
  accounts: BalanceAccount[];
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
  empHombresPerm: number;
  empMujeresPerm: number;
  empHombresExt: number;
  empMujeresExt: number;
  codigoInstitucion: string;
  fechaFormateada: string;
}
