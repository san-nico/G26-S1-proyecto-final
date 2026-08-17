import { getResultAccounts } from "@/lib/bancos";
import { ACCOUNTS_RESULTADO } from "@/lib/bancos";
import { formatValue } from "@/lib/format";
import SummaryCard from "@/components/global/SummaryCard";

type ResultadoSectionProps = {
  code: string;
  year: string;
  month: string;
};

type ResultCard = {
  category: string;
  title: string;
  amount: string;
  cardClass: string;
  textClass: string;
};

export default async function ResultadoSection({
  code,
  year,
  month,
}: ResultadoSectionProps) {
  let bankName = "";
  let cards: ResultCard[] = [];
  let error = "";

  try {
    const data = await getResultAccounts(
      code,
      year,
      month,
      ACCOUNTS_RESULTADO.map((group) => group.code),
    );
    bankName = data.bankName;
    cards = ACCOUNTS_RESULTADO.map((group) => ({
      category: group.category,
      title: group.title,
      amount: formatValue(data.accounts[group.code]),
      cardClass: group.cardClass,
      textClass: group.textClass,
    }));
  } catch {
    error = "No se pudieron consultar los datos en la CMF.";
  }

  return (
    <section
      id="resultado"
      aria-labelledby="resultado-title"
      className="card p-5 sm:p-6"
    >
      <h2
        id="resultado-title"
        className="border-b border-line pb-2 text-xs font-bold uppercase tracking-wider text-muted"
      >
        Estado de Resultado
      </h2>

      {error ? (
        <div role="alert" className="mt-4 text-sm text-alert-ink">
          {error}
        </div>
      ) : (
        <div className="mt-4">
          <h3 className="text-lg font-bold text-ink">{bankName}</h3>
          <div
            className="mt-4 grid gap-4 md:grid-cols-3"
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
                headingLevel="h4"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
