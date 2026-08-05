import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";
import React from "react";
import { getPerfilInstitucion } from "./api";
import styles from "./Page.module.css";

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
      <div className={styles.container}>
        {/* Navbar con tamaño fijo */}
        <div className={styles.fixedArea}>
          <Navbar />
        </div>

        {/* Contenido principal flexible */}
        <main className={styles.mainContent}>
          <div className={styles.wrapper}>
            
            {/* Header Directo y Compacto */}
            <div className={styles.header}>
              <div>
                <div className={styles.headerMeta}>
                  <span className={styles.badge}>
                    Institución Financiera
                  </span>
                  <span className={styles.updatedText}>
                    Actualizado: {perfil.fechaFormateada}
                  </span>
                </div>
                <h1 className={styles.title}>
                  {perfil.nombre}
                </h1>
              </div>

              <div className={styles.rutContainer}>
                <span>RUT:</span>
                <span className={styles.rutValue}>
                  {perfil.rut}
                </span>
              </div>
            </div>

            {/* Fila de Métricas Clave */}
            <div className={styles.statsGrid}>
              <StatItem label="Sucursales" value={perfil.sucursales} />
              <StatItem label="Oficinas" value={perfil.oficinas} />
              <StatItem label="Cajeros" value={perfil.cajeros} />
              <StatItem label="Empleados" value={perfil.empleados} />
            </div>

            {/* Grid de Información Principal y Contacto */}
            <div className={styles.contentGrid}>
              
              {/* Sección 1: Información Institucional */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Información Institucional
                </h2>
                <dl className={styles.infoList}>
                  <InfoRow label="Código SWIFT" value={perfil.codigoSWIFT} />
                  <InfoRow label="Sitio Web" value={perfil.direccionWeb} isLink />
                  <InfoRow label="Teléfono" value={perfil.telefono} />
                  <InfoRow label="Dirección Central" value={perfil.direccionPrincipal} />
                </dl>
              </section>

              {/* Sección 2: Canales de Atención */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Atención al Público
                </h2>
                <dl className={styles.infoList}>
                  <InfoRow label="Contacto Público" value={perfil.contactoPublico} />
                  <InfoRow label="Teléfono Público" value={perfil.telefonoPublico} />
                  <InfoRow label="Dirección Pública" value={perfil.direccionPublico} />
                </dl>
              </section>

            </div>

            {/* Fuente de datos */}
            <div className={styles.sourceFooter}>
              <span>Fuente: Comisión para el Mercado Financiero (CMF)</span>
            </div>

          </div>
        </main>

        {/* Footer estático abajo */}
        <div className={styles.fixedArea}>
          <Footer />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className={styles.container}>
        <Navbar />
        <main className={styles.errorMain}>
          <div className={styles.errorCard}>
            <div className={styles.errorIcon}>
              !
            </div>
            <h1 className={styles.errorTitle}>
              Error al cargar la página
            </h1>
            <p className={styles.errorText}>
              No se pudo obtener la información para la institución{" "}
              <span className={styles.highlightText}>{codigo}</span> ({month || "06"}/{year || "2026"}).
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
    <div className={styles.infoRow}>
      <dt className={styles.infoLabel}>{label}</dt>
      <dd className={styles.infoValue}>
        {isLink && typeof value === "string" ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
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
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value ?? 0}</span>
    </div>
  );
}