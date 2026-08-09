type SummaryCardProps = {
  category: string;
  title: string;
  amount: string;
  cardClass?: string;
  textClass?: string;
  headingLevel?: "h3" | "h4";
};

export default function SummaryCard({
  category,
  title,
  amount,
  cardClass = "",
  textClass = "",
  headingLevel = "h3",
}: SummaryCardProps) {
  const Heading = headingLevel;

  return (
    <article className={`card overflow-hidden ${cardClass}`}>
      <p className={`card-category ${textClass}`}>{category}</p>
      <Heading className="card-title">{title}</Heading>
      <p className={`card-amount ${textClass}`}>{amount}</p>
      <p className="card-meta">CLP · Subtotal oficial CMF</p>
    </article>
  );
}
