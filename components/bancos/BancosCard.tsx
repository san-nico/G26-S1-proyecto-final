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
  const resumenUrl = `/resumen?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;
  const balanceUrl = `/balance?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;
  const historialUrl = `/historial?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;

  return (
    <article className="card group flex flex-col gap-3 rounded-xl transition-colors duration-200 group-hover:bg-surface-2">
      <div className="flex items-center gap-4">
        <BankLogo size="lg" alt={`Logo de ${bank.NombreInstitucion}`}>
          {bank.CodigoInstitucion}
        </BankLogo>
        <h3 className="min-w-0 text-base font-bold uppercase leading-snug text-ink group-hover:text-brand-800">
          {bank.NombreInstitucion}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={resumenUrl}
          target="_blank"
          className="flex-1 rounded-lg border border-line bg-panel py-2 text-center font-medium text-ink no-underline transition-colors duration-200 hover:bg-surface-2"
        >
          Resumen
        </Link>
        <Link
          href={balanceUrl}
          target="_blank"
          className="flex-1 rounded-lg border border-line bg-panel py-2 text-center font-medium text-ink no-underline transition-colors duration-200 hover:bg-surface-2"
        >
          Balance
        </Link>
        <Link
          href={historialUrl}
          target="_blank"
          className="flex-1 rounded-lg border border-line bg-panel py-2 text-center font-medium text-ink no-underline transition-colors duration-200 hover:bg-surface-2"
        >
          Historial
        </Link>
      </div>
    </article>
  );
}
