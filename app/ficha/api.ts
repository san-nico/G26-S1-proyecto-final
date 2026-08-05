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

  const apiUrl = `https://api.cmfchile.cl/api-sbifv3/recursos_api/perfil/instituciones/${institucionCodigo}/${institucionYear}/${institucionMonth}?apikey=${apiKey}&formato=json`;

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

  // Formatear la fecha directamente en la API
  const fechaFormateada = perfil.fechaPublicacion
    ? new Date(perfil.fechaPublicacion).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No disponible";

  // Retornar los datos limpios y listos para consumir
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