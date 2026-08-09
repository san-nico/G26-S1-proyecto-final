import PageLayout from "@/components/global/PageLayout";
import type { PerfilInstitucion } from "@/lib/cmf";
import styles from "./FichaView.module.scss";

interface InfoRowProps {
  label: string;
  value?: string | null;
  isLink?: boolean;
}

interface StatItemProps {
  label: string;
  value?: number | null;
}

export default function FichaView({
  perfil,
}: {
  perfil: PerfilInstitucion;
}) {
  return (
    <PageLayout className={styles.container} mainClassName={styles.mainContent}>
      <div className={styles.wrapper}>
          <div className={styles.header}>
            <div>
              <div className={styles.headerMeta}>
                <span className={styles.badge}>Institución Financiera</span>
                <span className={styles.updatedText}>
                  Actualizado: {perfil.fechaFormateada}
                </span>
              </div>
              <h1 className={styles.title}>{perfil.nombre}</h1>
            </div>

            <div className={styles.rutContainer}>
              <span>RUT:</span>
              <span className={styles.rutValue}>{perfil.rut}</span>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <StatItem label="Sucursales" value={perfil.sucursales} />
            <StatItem label="Oficinas" value={perfil.oficinas} />
            <StatItem label="Cajeros" value={perfil.cajeros} />
            <StatItem label="Empleados" value={perfil.empleados} />
          </div>

          <div className={styles.contentGrid}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Información Institucional</h2>
              <dl className={styles.infoList}>
                <InfoRow label="Código SWIFT" value={perfil.codigoSWIFT} />
                <InfoRow label="Sitio Web" value={perfil.direccionWeb} isLink />
                <InfoRow label="Teléfono" value={perfil.telefono} />
                <InfoRow
                  label="Dirección Central"
                  value={perfil.direccionPrincipal}
                />
              </dl>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Atención al Público</h2>
              <dl className={styles.infoList}>
                <InfoRow
                  label="Contacto Público"
                  value={perfil.contactoPublico}
                />
                <InfoRow
                  label="Teléfono Público"
                  value={perfil.telefonoPublico}
                />
                <InfoRow
                  label="Dirección Pública"
                  value={perfil.direccionPublico}
                />
              </dl>
            </section>
          </div>

          <div className={styles.sourceFooter}>
            <span>Fuente: Comisión para el Mercado Financiero (CMF)</span>
          </div>
        </div>
    </PageLayout>
  );
}

function InfoRow({ label, value, isLink = false }: InfoRowProps) {
  const displayValue = value || "No informado";

  return (
    <div className={styles.infoRow}>
      <dt className={styles.infoLabel}>{label}</dt>
      <dd className={styles.infoValue}>
        {isLink && value ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {value}
          </a>
        ) : (
          displayValue
        )}
      </dd>
    </div>
  );
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value ?? 0}</span>
    </div>
  );
}
