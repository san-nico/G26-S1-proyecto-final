import PageLayout from "@/components/global/PageLayout";

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
    <PageLayout mainClassName="container-main">
      <section className="max-w-2xl">
        <p className="badge">Datos oficiales CMF Chile</p>
        <h1 className="page-title">Resumen de Balance</h1>
      </section>

      {error ? (
        <div role="alert" className="alert">
          <p className="font-bold">{error}</p>
        </div>
      ) : (
        <div className="mt-10 [&>*+*]:mt-8">
          <header className="card p-5 sm:p-6">
            <h2 className="mt-1 text-2xl font-bold text-ink">{bankName}</h2>
            <p className="meta mt-2">
              Código: {code} · Período: {month}/{year}
            </p>
          </header>

          <section
            className="grid gap-4 md:grid-cols-3"
            aria-label="Tarjetas de resumen financiero"
          >
            {cards.map((card, i) => (
              <article key={i} className={`card overflow-hidden ${card.style}`}>
                <p className="card-category">{card.category}</p>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-amount">{card.amount}</p>
                <p className="card-meta">CLP · Subtotal oficial CMF</p>
              </article>
            ))}
          </section>
        </div>
      )}
    </PageLayout>
  );
}
