import Link from "next/link";
import BankLogo from "@/components/global/BankLogo";

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
  const comparadorUrl = `/resumen?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;

  return (
    <Link
      href={comparadorUrl}
      target="_blank"
      className="group block no-underline"
    >
      <article className="card flex items-center gap-4 rounded-xl transition-colors duration-200 group-hover:bg-surface-2">
        <BankLogo size="lg" alt={`Logo de ${bank.NombreInstitucion}`}>
          {bank.CodigoInstitucion}
        </BankLogo>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <h3 className="min-w-0 text-base font-bold uppercase leading-snug text-ink group-hover:text-brand-800">
            {bank.NombreInstitucion}
          </h3>
        </div>
      </article>
    </Link>
  );
}
