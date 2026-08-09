import BancosCard from "./BancosCard";

type Bank = {
  CodigoInstitucion: string;
  NombreInstitucion: string;
};

type BancosViewProps = {
  banks: Bank[];
  error: string;
  capitalizedPeriod: string;
  selectedYear: string;
  selectedMonth: string;
};

export default function BancosView({
  banks,
  error,
  capitalizedPeriod,
  selectedYear,
  selectedMonth,
}: BancosViewProps) {
  return (
    <>
      <section className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <p className="badge">Datos oficiales CMF Chile</p>
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 shadow-[inset_0_0_0_1px_rgb(5_150_105_/_0.2)]">
            Periodo: {capitalizedPeriod}
          </span>
        </div>

        <h1 className="page-title">Instituciones Bancarias</h1>

        <p className="mt-4 text-lg leading-7 text-muted">
          Consulta las instituciones registradas y vigentes correspondientes a{" "}
          <span className="font-semibold text-ink">{capitalizedPeriod}</span>.
        </p>
      </section>

      {error ? (
        <div role="alert" className="alert">
          <h2 className="font-bold">No se pudo cargar la información</h2>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : (
        <section className="mt-10" aria-labelledby="banks-title">
          <h2 id="banks-title" className="text-2xl font-bold text-ink">
            Instituciones
          </h2>

          {banks.length === 0 ? (
            <p className="card mt-6 rounded-xl p-6 text-muted">
              No se encontraron instituciones.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {banks.map((bank) => (
                <BancosCard
                  key={bank.CodigoInstitucion}
                  bank={bank}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
