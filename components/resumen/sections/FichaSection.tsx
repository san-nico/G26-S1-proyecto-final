import { getPerfilInstitucion } from "@/lib/bancos";
import type { PerfilInstitucion } from "@/lib/bancos";

type FichaSectionProps = {
  code: string;
  year: string;
  month: string;
};

interface InfoRowProps {
  label: string;
  value?: string | null;
  isLink?: boolean;
}

export default async function FichaSection({
  code,
  year,
  month,
}: FichaSectionProps) {
  let perfil: PerfilInstitucion | null = null;
  let error = "";

  try {
    perfil = await getPerfilInstitucion({ codigo: code, year, month });
  } catch {
    error = "No se pudieron consultar los datos de la ficha en la CMF.";
  }

  return (
    <section
      id="ficha"
      aria-labelledby="ficha-title"
      className="card p-5 sm:p-6"
    >
      <h2
        id="ficha-title"
        className="border-b border-line pb-2 text-xs font-bold uppercase tracking-wider text-muted"
      >
        Ficha
      </h2>

      {error ? (
        <div role="alert" className="mt-4 text-sm text-alert-ink">
          {error}
        </div>
      ) : perfil ? (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-b border-line pb-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold text-ink sm:text-2xl">
              {perfil.nombre}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>RUT:</span>
              <span className="rounded-sm border border-line bg-panel px-2 py-0.5 font-mono text-sm font-medium text-ink">
                {perfil.rut}
              </span>
              {perfil.codigoInstitucion && (
                <span className="rounded-sm border border-line bg-panel px-2 py-0.5 font-mono text-sm font-medium text-ink">
                  {perfil.codigoInstitucion}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatItem label="Sucursales" value={perfil.sucursales} />
            <StatItem label="Oficinas" value={perfil.oficinas} />
            <StatItem label="Cajeros" value={perfil.cajeros} />
            <StatItem label="Empleados" value={perfil.empleados} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <section className="flex flex-col gap-2 rounded-xl border border-line-soft bg-panel p-4">
              <h4 className="border-b border-surface-2 pb-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                Información Institucional
              </h4>
              <dl className="grid grid-cols-1 gap-1.5 text-xs sm:text-sm">
                <InfoRow label="Código SWIFT" value={perfil.codigoSWIFT} />
                <InfoRow
                  label="Sitio Web"
                  value={perfil.direccionWeb}
                  isLink
                />
                <InfoRow label="Teléfono" value={perfil.telefono} />
                <InfoRow
                  label="Dirección Central"
                  value={perfil.direccionPrincipal}
                />
              </dl>
            </section>

            <section className="flex flex-col gap-2 rounded-xl border border-line-soft bg-panel p-4">
              <h4 className="border-b border-surface-2 pb-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                Atención al Público
              </h4>
              <dl className="grid grid-cols-1 gap-1.5 text-xs sm:text-sm">
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

            <section className="flex flex-col gap-2 rounded-xl border border-line-soft bg-panel p-4">
              <h4 className="border-b border-surface-2 pb-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                Dotación de Personal
              </h4>
              <dl className="grid grid-cols-1 gap-1.5 text-xs sm:text-sm">
                <InfoRow
                  label="Hombres permanentes"
                  value={perfil.emp_hombres_perm.toString()}
                />
                <InfoRow
                  label="Mujeres permanentes"
                  value={perfil.emp_mujereres_perm.toString()}
                />
                <InfoRow
                  label="Hombres externos"
                  value={perfil.emp_hombres_ext.toString()}
                />
                <InfoRow
                  label="Mujeres externas"
                  value={perfil.emp_mujeres_ext.toString()}
                />
              </dl>
            </section>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function InfoRow({ label, value, isLink = false }: InfoRowProps) {
  const displayValue = value || "No informado";

  return (
    <div className="flex flex-col gap-0.5 border-b border-surface-2 py-0.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="m-0 text-xs text-muted sm:w-1/3 sm:shrink-0">{label}</dt>
      <dd className="m-0 w-full break-words text-right font-medium text-ink">
        {isLink && value ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-result-700 no-underline hover:underline"
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

function StatItem({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-line-soft bg-panel p-2.5 shadow-card sm:flex-col sm:items-start">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="text-lg font-bold text-ink sm:text-xl">
        {value ?? 0}
      </span>
    </div>
  );
}
