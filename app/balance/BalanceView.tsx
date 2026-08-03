import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";
import styles from "./BalanceView.module.css";
import Image from "next/image";

type Card = {
  category: string;
  title: string;
  amount: string;
  style: string;
};

export default function BalanceView({
  bankName,
  code,
  year,
  month,
  cards,
  error,
}: {
  bankName: string;
  code: string;
  year: string;
  month: string;
  cards: Card[];
  error?: string;
}) {
  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <main className={styles.mainContent}>
        <section className={styles.heroSection}>
          <p className={styles.badge}>Datos oficiales CMF Chile</p>
          <h1 className={styles.title}>Resumen de Balance</h1>
        </section>

        {error ? (
          <div role="alert" className={styles.errorAlert}>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        ) : (
          <div className={styles.summaryWrapper}>
            <header className={styles.bankHeader}>
              <h2 className={styles.bankName}>{bankName}</h2>
              <p className={styles.metaPeriod}>
                Código: {code} · Período: {month}/{year}
              </p>
            </header>

            <section
              className={styles.grid}
              aria-label="Tarjetas de resumen financiero"
            >
              {cards.map((card, i) => (
                <article key={i} className={`${styles.card} ${card.style}`}>
                  <p className={styles.cardCategory}>{card.category}</p>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardAmount}>{card.amount}</p>
                  <p className={styles.cardFooter}>
                    CLP · Subtotal oficial CMF
                  </p>
                </article>
              ))}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
