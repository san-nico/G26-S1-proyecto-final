import Link from "next/link";
import styles from "./BankList.module.css";

type Bank = {
  CodigoInstitucion: string;
  NombreInstitucion: string;
};

type BankListProps = {
  banks: Bank[];
  error: string;
  capitalizedPeriod: string;
  selectedYear: string;
  selectedMonth: string;
};

export default function BankList({
  banks,
  error,
  capitalizedPeriod,
  selectedYear,
  selectedMonth,
}: BankListProps) {
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
              {banks.map((bank) => {
                const balanceUrl = `/balance?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;
                const resultadoUrl = `/resultado?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;

                return (
                  <article key={bank.CodigoInstitucion} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span className={styles.logoContainer}>
                        <img
                          src={`/bank-logos/${bank.CodigoInstitucion}.png`}
                          alt={`Logo de ${bank.NombreInstitucion}`}
                          className={styles.logo}
                        />
                      </span>
                      <div className={styles.cardInfo}>
                        <div className={styles.cardTitleWrapper}>
                          <h3 className={styles.bankName}>
                            {bank.NombreInstitucion}
                          </h3>
                          <span className={styles.bankCode}>
                            {bank.CodigoInstitucion}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <Link
                        href={balanceUrl}
                        target="_blank"
                        className={styles.actionButton}
                      >
                        Ver balance
                      </Link>
                      <Link
                        href={resultadoUrl}
                        target="_blank"
                        className={styles.actionButton}
                      >
                        Ver resultado
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </>
  );
}
