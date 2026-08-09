import PageLayout from "@/components/global/PageLayout";
import SummaryCard from "@/components/global/SummaryCard";

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
    <PageLayout mainClassName="container-main">
      <section className="max-w-2xl">
        <p className="badge">Datos oficiales CMF Chile</p>
        <h1 className="page-title">Resumen de Estado de Resultado</h1>
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
              <SummaryCard
                key={i}
                category={card.category}
                title={card.title}
                amount={card.amount}
                cardClass={card.cardClass}
                textClass={card.textClass}
              />
            ))}
          </section>
        </div>
      )}
    </PageLayout>
  );
}
