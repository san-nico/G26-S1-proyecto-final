import { getBalanceAccounts } from "@/lib/cmf";
import type { AccountTarget } from "@/lib/types";
import { buildAccountCell, toNumber } from "@/lib/format";
import BankTableRow from "./BankTableRow";

type BankRowProps = {
  code: string;
  bankName: string;
  accounts: AccountTarget[];
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
  let values: Record<string, string> = {};

  try {
    const data = await getBalanceAccounts(
      code,
      year,
      month,
      accounts.map((item) => item.code),
    );
    name = data.bankName;
    values = Object.fromEntries(
      accounts.map((item) => [item.code, data.accounts[item.code] ?? ""]),
    );
  } catch {
    values = {};
  }

  const baseCode = accounts[0]?.code ?? "";
  const baseRaw = toNumber(values[baseCode]);

  const cells = Object.fromEntries(
    accounts.map((item) => [
      item.code,
      buildAccountCell(values[item.code], baseRaw, item.code === baseCode),
    ]),
  );

  return (
    <BankTableRow code={code} bankName={name} cells={cells} accounts={accounts} />
  );
}
