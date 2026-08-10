import { getBalanceAccounts } from "@/lib/cmf";
import type { BalanceTarget } from "@/lib/types";
import { formatValue } from "@/lib/format";

type BankRowProps = {
  code: string;
  bankName: string;
  accounts: BalanceTarget[];
  year: string;
  month: string;
};

function toNumber(value?: string): number {
  if (!value) return Number.NaN;
  const num = Number(value.replace(",", "."));
  return Number.isFinite(num) ? num : Number.NaN;
}

export default async function BankRow({
  code,
  bankName,
  accounts,
  year,
  month,
}: BankRowProps) {
  let name = bankName;
  let values: Record<string, string> = {};
  let raw: Record<string, number> = {};
  let error = "";

  try {
    const data = await getBalanceAccounts(code, year, month);
    name = data.bankName;
    raw = Object.fromEntries(
      accounts.map((item) => [
        item.code,
        toNumber(data.accounts[item.code]),
      ]),
    );
    values = Object.fromEntries(
      accounts.map((item) => [
        item.code,
        formatValue(data.accounts[item.code]),
      ]),
    );
  } catch {
    error = "No se pudieron consultar los datos en la CMF.";
  }

  const baseCode = accounts[0]?.code ?? "";
  const baseRaw = raw[baseCode] ?? Number.NaN;

  const percentFor = (itemCode: string): string => {
    if (error) return "";
    if (itemCode === baseCode) return "100%";
    if (!Number.isFinite(baseRaw) || baseRaw <= 0) return "";
    const value = raw[itemCode];
    if (!Number.isFinite(value)) return "";
    const percent = (value / baseRaw) * 100;
    return `${percent.toLocaleString("es-CL", { maximumFractionDigits: 1 })}%`;
  };

  return (
    <tr className="border-b border-line-soft last:border-0 hover:bg-surface-2">
      <td className="px-4 py-3">
        <span className="block font-bold uppercase leading-snug text-ink">
          {name}
        </span>
        <span className="meta">Código {code}</span>
      </td>
      {accounts.map((item) => (
        <td key={item.code} className="px-4 py-3 text-right">
          {error ? (
            <span className="text-muted">—</span>
          ) : (
            <>
              <span className="block font-mono tabular-nums font-semibold text-ink">
                CLP {values[item.code]}
              </span>
              <span className="block text-xs text-muted">
                {percentFor(item.code)}
              </span>
            </>
          )}
        </td>
      ))}
    </tr>
  );
}
