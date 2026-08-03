import Link from "next/link";
import styles from "./BankCard.module.css";
import Image from "next/image";

type BankCardProps = {
  bank: {
    CodigoInstitucion: string;
    NombreInstitucion: string;
  };
  selectedYear: string;
  selectedMonth: string;
};

export default function BankCard({
  bank,
  selectedYear,
  selectedMonth,
}: BankCardProps) {
  const balanceUrl = `/balance?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;
  const resultadoUrl = `/resultado?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;

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
}
