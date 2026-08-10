import Image from "next/image";
import { getBalanceAccounts } from "@/lib/cmf";
import type { BalanceTarget } from "@/lib/types";
import { formatBillions, toNumber } from "@/lib/format";

type BankRowProps = {
  code: string;
  bankName: string;
  accounts: BalanceTarget[];
  year: string;
  month: string;
};

export default async function BankRow({
  code,
  bankName,
  accounts,
  year,
  month,
}: BankRowProps) {
  let name = bankName;
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
    return `${percent.toLocaleString("es-CL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
  };

  const moneyFor = (itemCode: string): string => {
    if (error) return "";
    const formatted = formatBillions(String(raw[itemCode] ?? ""));
    return formatted === "—" ? "—" : `${formatted} billones`;
  };

  return (
    <tr className="border-b border-line-soft last:border-0 hover:bg-surface-2">
      <td className="px-4 py-3">
        <span className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-panel">
            <Image
              width={36}
              height={36}
              src={`/bank-logos/${code}.png`}
              alt={`Logo de ${name}`}
              className="object-contain"
            />
          </span>
          <span className="min-w-0">
            <span className="block font-bold uppercase leading-snug text-ink">
              {name}
            </span>
            <span className="meta">Código {code}</span>
          </span>
        </span>
      </td>
      {accounts.map((item) => (
        <td key={item.code} className="px-4 py-3 text-right">
          {error ? (
            <span className="text-muted">—</span>
          ) : (
            <>
              <span className="block font-mono text-lg font-bold tabular-nums text-ink">
                {percentFor(item.code)}
              </span>
              <span className="block font-mono text-xs tabular-nums text-muted">
                {moneyFor(item.code)}
              </span>
            </>
          )}
        </td>
      ))}
    </tr>
  );
}
