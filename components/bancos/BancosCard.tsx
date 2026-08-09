import Link from "next/link";
import Image from "next/image";

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
  const balanceUrl = `/balance?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;
  const resultadoUrl = `/resultado?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;
  const fichaUrl = `/ficha?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth.padStart(2, "0")}`;

  return (
    <article className="card flex flex-col gap-4 rounded-xl">
      <div className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-xl border border-line bg-panel p-2">
          <Image
            width={100}
            height={100}
            src={`/bank-logos/${bank.CodigoInstitucion}.png`}
            alt={`Logo de ${bank.NombreInstitucion}`}
            className="size-10 object-contain"
          />
        </span>
        <div className="flex-1">
          <div className="grid items-center justify-between gap-2">
            <h3 className="truncate font-bold text-ink">
              {bank.NombreInstitucion}
            </h3>
            <div className="w-16 rounded-full bg-surface-1 px-2.5 py-0.5 text-center font-mono text-xs text-muted">
              {bank.CodigoInstitucion}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-line pt-3 text-xs font-medium">
        <Link href={balanceUrl} target="_blank" className="action-button">
          Balance
        </Link>
        <Link href={resultadoUrl} target="_blank" className="action-button">
          Resultado
        </Link>
        <Link href={fichaUrl} target="_blank" className="action-button">
          Ficha
        </Link>
      </div>
    </article>
  );
}
