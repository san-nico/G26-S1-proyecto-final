import PageLayout from "@/components/global/PageLayout";
import styles from "./ResultsView.module.scss";

type Card = {
  category: string;
  title: string;
  amount: string;
  cardClass: string;
  textClass: string;
};

export default function ResultsView({
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
    <PageLayout mainClassName={styles.main}>
      <section className={styles.hero}>
        <p className={styles.badge}>Datos oficiales CMF Chile</p>
        <h1 className={styles.title}>Resumen de Resultados</h1>
      </section>

      {error ? (
        <div role="alert" className={styles.alert}>
          <p className={styles.alertText}>{error}</p>
        </div>
      ) : (
        <div className={styles.content}>
          <header className={styles.bankHeader}>
            <h2 className={styles.bankTitle}>{bankName}</h2>
            <p className={styles.bankMeta}>
              Código: {code} · Período: {month}/{year}
            </p>
          </header>

          <section
            className={styles.grid}
            aria-label="Tarjetas de resumen financiero"
          >
            {cards.map((card, i) => (
              <article key={i} className={`${styles.card} ${card.cardClass}`}>
                <p className={`${styles.cardCategory} ${card.textClass}`}>
                  {card.category}
                </p>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={`${styles.cardAmount} ${card.textClass}`}>
                  {card.amount}
                </p>
                <p className={styles.cardMeta}>CLP · Subtotal oficial CMF</p>
              </article>
            ))}
          </section>
        </div>
      )}
    </PageLayout>
  );
}
