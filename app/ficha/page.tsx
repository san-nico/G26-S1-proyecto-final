import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";
import React from "react";
import { getPerfilInstitucion } from "./api";

interface PageProps {
  searchParams: Promise<{
    codigo?: string;
    year?: string;
    month?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { codigo, year, month } = await searchParams;

  try {
    const perfil = await getPerfilInstitucion({ codigo, year, month });

    return (
      <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
        {/* Navbar con tamaño fijo */}
        <div className="shrink-0">
          <Navbar />
        </div>

        {/* Contenido principal flexible */}
        <main className="flex-1 py-4 px-4 sm:px-8 flex flex-col justify-between overflow-y-auto sm:overflow-hidden">
          <div className="mx-auto max-w-5xl w-full space-y-4 my-auto">
            
            {/* Header Directo y Compacto */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                    Institución Financiera
                  </span>
                  <span className="text-xs text-slate-400">
                    Actualizado: {perfil.fechaFormateada}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {perfil.nombre}
                </h1>
              </div>

              <div className="flex items-center gap-2 text-base text-slate-600">
                <span>RUT:</span>
                <span className="font-mono font-medium bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 text-sm">
                  {perfil.rut}
                </span>
              </div>
            </div>

            {/* Fila de Métricas Clave */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatItem label="Sucursales" value={perfil.sucursales} />
              <StatItem label="Oficinas" value={perfil.oficinas} />
              <StatItem label="Cajeros" value={perfil.cajeros} />
              <StatItem label="Empleados" value={perfil.empleados} />
            </div>

            {/* Grid de Información Principal y Contacto */}
            <div className="grid md:grid-cols-2 gap-4">
              
              {/* Sección 1: Información Institucional */}
              <section className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Información Institucional
                </h2>
                <dl className="grid grid-cols-1 gap-1.5 text-xs sm:text-sm">
                  <InfoRow label="Código SWIFT" value={perfil.codigoSWIFT} />
                  <InfoRow label="Sitio Web" value={perfil.direccionWeb} isLink />
                  <InfoRow label="Teléfono" value={perfil.telefono} />
                  <InfoRow label="Dirección Central" value={perfil.direccionPrincipal} />
                </dl>
              </section>

              {/* Sección 2: Canales de Atención */}
              <section className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Atención al Público
                </h2>
                <dl className="grid grid-cols-1 gap-1.5 text-xs sm:text-sm">
                  <InfoRow label="Contacto Público" value={perfil.contactoPublico} />
                  <InfoRow label="Teléfono Público" value={perfil.telefonoPublico} />
                  <InfoRow label="Dirección Pública" value={perfil.direccionPublico} />
                </dl>
              </section>

            </div>

            {/* Fuente de datos */}
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>Fuente: Comisión para el Mercado Financiero (CMF)</span>
            </div>

          </div>
        </main>

        {/* Footer estático abajo */}
        <div className="shrink-0">
          <Footer />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="h-screen flex flex-col bg-slate-50 justify-between">
        <Navbar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="mx-auto max-w-sm rounded-xl bg-white p-6 shadow-md border border-red-200 text-center space-y-3">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto font-bold text-lg">
              !
            </div>
            <h1 className="text-base font-bold text-slate-800">
              Error al cargar la página
            </h1>
            <p className="text-xs text-slate-500">
              No se pudo obtener la información para la institución{" "}
              <span className="font-semibold">{codigo}</span> ({month || "06"}/{year || "2026"}).
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}

// Componente ultra compacto para mostrar Clave - Valor
function InfoRow({
  label,
  value,
  isLink = false,
}: {
  label: string;
  value: React.ReactNode;
  isLink?: boolean;
}) {
  const contenido = value || "No informado";

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-4 py-0.5 border-b border-slate-50 last:border-0">
      <dt className="text-slate-500 text-xs sm:w-1/3 shrink-0">{label}</dt>
      <dd className="text-slate-800 font-medium break-words text-right sm:text-right w-full">
        {isLink && typeof value === "string" ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            {value}
          </a>
        ) : (
          contenido
        )}
      </dd>
    </div>
  );
}

// Tarjeta de estadística compacta horizontal/vertical
function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 flex items-center justify-between sm:flex-col sm:items-start shadow-sm">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <span className="text-lg sm:text-xl font-bold text-slate-900">{value ?? 0}</span>
    </div>
  );
}