import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";
import React from "react";

interface PerfilResponse {
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

interface PageProps {
  searchParams: Promise<{
    codigo?: string;
    year?: string;
    month?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  // 1. Resolver los searchParams de la URL
  const { codigo, year, month } = await searchParams;

  // 2. Valores por defecto por si no vienen en la URL
  const institucionCodigo = codigo ;
  const institucionYear = year || "2026";
  const institucionMonth = month || "06";

  const apiUrl = `https://api.cmfchile.cl/api-sbifv3/recursos_api/perfil/instituciones/${institucionCodigo}/${institucionYear}/${institucionMonth}?apikey=d3217c0d406feca58306af437eb4c783de05febb&formato=json`;

  try {
    const res = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Error en la API: ${res.status}`);
    }

    const data: PerfilResponse = await res.json();
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

    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 py-12 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-100">
            {/* Header con acento de color */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              <span className="inline-block px-3 py-1 rounded-full bg-blue-600/60 text-xs font-semibold tracking-wider uppercase mb-3 border border-blue-400/30">
                Institución Financiera
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {perfil.nombre}
              </h1>
              <p className="mt-2 text-blue-100 font-medium text-sm sm:text-base">
                RUT:{" "}
                <span className="font-mono bg-blue-900/40 px-2 py-0.5 rounded">
                  {perfil.rut}
                </span>
              </p>
            </div>

            <div className="p-8 space-y-8">
              {/* Sección: Información Principal */}
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Información Institucional
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Info titulo="Código SWIFT" valor={perfil.codigoSWIFT} />
                  <Info titulo="Sitio Web" valor={perfil.direccionWeb} isLink />
                  <Info titulo="Teléfono Principal" valor={perfil.telefono} />
                  <Info
                    titulo="Dirección Principal"
                    valor={perfil.direccionPrincipal?.trim()}
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Sección: Contacto Público */}
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Canales de Atención al Público
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Info
                    titulo="Contacto Público"
                    valor={perfil.contactoPublico}
                  />
                  <Info
                    titulo="Teléfono Público"
                    valor={perfil.telefonoPublico}
                  />
                  <Info
                    titulo="Dirección Pública"
                    valor={perfil.direccionPublico}
                    className="sm:col-span-2"
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Sección: Red e Indicadores */}
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Presencia Operativa y Personal
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label="Sucursales" value={perfil.sucursales} />
                  <StatCard label="Oficinas" value={perfil.oficinas} />
                  <StatCard label="Cajeros" value={perfil.cajeros} />
                  <StatCard label="Empleados" value={perfil.empleados} />
                </div>
              </div>
            </div>

            {/* Footer de la tarjeta */}
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>Fuente: Comisión para el Mercado Financiero (CMF)</span>
              <span>Actualizado al: {fechaFormateada}</span>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-xl border border-red-100 text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h1 className="text-xl font-bold text-slate-800">
            Error al cargar la página
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            No se pudo obtener la información de la CMF para la institución{" "}
            <span className="font-semibold">{institucionCodigo}</span> ({institucionMonth}/{institucionYear}).
          </p>
        </div>
      </main>
    );
  }
}

function Info({
  titulo,
  valor,
  isLink = false,
  className = "",
}: {
  titulo: string;
  valor: React.ReactNode;
  isLink?: boolean;
  className?: string;
}) {
  const contenido = valor ?? "No informado";

  return (
    <div
      className={`rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50/80 ${className}`}
    >
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        {titulo}
      </p>
      <div className="mt-1 text-slate-800 font-medium break-words">
        {isLink && typeof valor === "string" ? (
          <a
            href={valor.startsWith("http") ? valor : `https://${valor}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            {valor}
          </a>
        ) : (
          contenido
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-blue-50/30 p-4 text-center">
      <p className="text-2xl font-bold text-blue-700">{value ?? 0}</p>
      <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
    </div>
  );
}