export interface CmfAccount {
  CodigoCuenta?: string;
  MonedaTotal?: string;
  NombreInstitucion?: string;
}

export interface PerfilResponseAPI {
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
      emp_hombres_perm: number;
      emp_mujereres_perm: number;
      emp_hombres_ext: number;
      emp_mujeres_ext: number;
    };
    Institucion: {
      CodigoInstitucion: string;
      NombreInstitucion: string;
    };
  }[];
}

export interface FetchPerfilParams {
  codigo?: string;
  year?: string;
  month?: string;
}
