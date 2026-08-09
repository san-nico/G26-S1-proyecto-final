import Link from "next/link";
import Image from "next/image";
import styles from "./BancosCard.module.scss";

type BancosCardProps = {
  bank: {
    CodigoInstitucion: string;
    NombreInstitucion: string;
  };
  selectedYear: string;
  selectedMonth: string;
};

export default function BancosCard({
  bank,
  selectedYear,
  selectedMonth,
}: BancosCardProps) {
  const balanceUrl = `/balance?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;
  const resultadoUrl = `/resultado?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;
  const fichaUrl = `/ficha?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.logoContainer}>
          <Image
            width={100}
            height={100}
            src={`/bank-logos/${bank.CodigoInstitucion}.png`}
            alt={`Logo de ${bank.NombreInstitucion}`}
            className={styles.logo}
          />
        </span>
        <div className={styles.cardInfo}>
          <div className={styles.cardTitleWrapper}>
            <h3 className={styles.bankName}>{bank.NombreInstitucion}</h3>
            <div className={styles.bankCode}>{bank.CodigoInstitucion}</div>
          </div>
        </div>
      </div>

      <div className={styles.cardActions}>
        <Link href={balanceUrl} target="_blank" className={styles.actionButton}>
          Balance
        </Link>

        <Link
          href={resultadoUrl}
          target="_blank"
          className={styles.actionButton}
        >
          Resultado
        </Link>

        <Link href={fichaUrl} target="_blank" className={styles.actionButton}>
          Ficha
        </Link>
      </div>
    </article>
  );
}
