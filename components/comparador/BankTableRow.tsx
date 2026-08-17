import BankLogo from "@/components/global/BankLogo";
import type { AccountCell, AccountTarget } from "@/lib/bancos";

type BankTableRowProps = {
  code: string;
  bankName: string;
  cells: Record<string, AccountCell>;
  accounts: AccountTarget[];
  selectedCode?: string;
};

export default function BankTableRow({
  code,
  bankName,
  cells,
  accounts,
  selectedCode,
}: BankTableRowProps) {
  return (
    <tr
      className={`border-b border-line-soft last:border-0 hover:bg-surface-2 ${
        selectedCode === code ? "bg-brand-50" : ""
      }`}
    >
      <td className="px-4 py-3">
        <span className="flex items-center gap-3">
          <BankLogo alt={`Logo de ${bankName}`}>{code}</BankLogo>
          <span className="min-w-0">
            <span className="block font-bold uppercase leading-snug text-ink">
              {bankName}
            </span>
            <span className="meta">Código {code}</span>
          </span>
        </span>
      </td>
      {accounts.map((item) => {
        const cell = cells[item.code];
        const empty = cell.percent === "—" && cell.money === "—";
        return (
          <td key={item.code} className="px-4 py-3 text-right">
            {empty ? (
              <span className="text-muted">—</span>
            ) : (
              <>
                <span className="block font-mono text-lg font-bold tabular-nums text-ink">
                  {cell.percent}
                </span>
                <span className="block font-mono text-xs tabular-nums text-muted">
                  {cell.money}
                </span>
              </>
            )}
          </td>
        );
      })}
    </tr>
  );
}
