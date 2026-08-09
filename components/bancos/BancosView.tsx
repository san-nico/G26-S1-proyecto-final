import BancosCard from "./BancosCard";
import styles from "./BancosView.module.scss";

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
      <section className={styles.container}>
        <div className={styles.headerFlex}>
          <p className={styles.badgeCategory}>Datos oficiales CMF Chile</p>
          <span className={styles.badgePeriod}>
            Periodo: {capitalizedPeriod}
          </span>
        </div>

        <h1 className={styles.title}>Instituciones Bancarias</h1>

        <p className={styles.description}>
          Consulta las instituciones registradas y vigentes correspondientes a{" "}
          <span className={styles.highlight}>{capitalizedPeriod}</span>.
        </p>
      </section>

      {error ? (
        <div role="alert" className={styles.alertBox}>
          <h2 className={styles.alertTitle}>
            No se pudo cargar la información
          </h2>
          <p className={styles.alertDescription}>{error}</p>
        </div>
      ) : (
        <section className={styles.sectionBanks} aria-labelledby="banks-title">
          <h2 id="banks-title" className={styles.banksTitle}>
            Instituciones
          </h2>

          {banks.length === 0 ? (
            <p className={styles.emptyState}>
              No se encontraron instituciones.
            </p>
          ) : (
            <div className={styles.grid}>
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
