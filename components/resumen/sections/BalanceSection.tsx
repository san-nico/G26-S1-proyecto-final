import { getBalanceAccounts } from "@/lib/cmf";
import { TARGET_ACCOUNTS } from "@/lib/types";
import { formatValue } from "@/lib/format";
import SummaryCard from "@/components/global/SummaryCard";

type BalanceSectionProps = {
  code: string;
  year: string;
  month: string;
};

type BalanceCard = {
  category: string;
  title: string;
  amount: string;
  style: string;
};

export default async function BalanceSection({
  code,
  year,
  month,
}: BalanceSectionProps) {
  let bankName = "";
  let cards: BalanceCard[] = [];
  let error = "";

  try {
    const data = await getBalanceAccounts(code, year, month);
    bankName = data.bankName;
    cards = TARGET_ACCOUNTS.map((item) => ({
      category: item.category,
      title: item.title,
      amount: formatValue(data.accounts[item.code]),
      style: item.style,
    }));
  } catch {
    error =
      "No se pudieron consultar los datos del estado de situación financiera en la CMF.";
  }

  return (
    <section
      id="balance"
      aria-labelledby="balance-title"
      className="card p-5 sm:p-6"
    >
      <h2
        id="balance-title"
        className="border-b border-line pb-2 text-xs font-bold uppercase tracking-wider text-muted"
      >
        Estado de Situación Financiera
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
                cardClass={card.style}
                headingLevel="h4"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
