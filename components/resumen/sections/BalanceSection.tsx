import {
  getAccountDetailByAllInstitutions,
  getAccountsByAllInstitutions,
} from "@/lib/cmf";
import { ACCOUNTS_BALANCE } from "@/lib/types";
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
  cardClass: string;
  textClass: string;
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
    const accountMap = await getAccountsByAllInstitutions(
      ACCOUNTS_BALANCE.map((item) => item.code),
      year,
      month,
    );

    try {
      const detail = await getAccountDetailByAllInstitutions(
        ACCOUNTS_BALANCE[0]?.code ?? "",
        year,
        month,
      );
      bankName = detail.institutions[code]?.bankName || "";
    } catch {
    }
    bankName ||= code === "999" ? "SISTEMA FINANCIERO" : `Institución ${code}`;

    cards = ACCOUNTS_BALANCE.map((item) => ({
      category: item.category,
      title: item.title,
      amount: formatValue(accountMap[item.code]?.[code]),
      cardClass: item.cardClass,
      textClass: item.textClass,
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
