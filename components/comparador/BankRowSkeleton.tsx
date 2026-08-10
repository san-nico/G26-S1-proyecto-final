import type { BalanceTarget } from "@/lib/types";

type BankRowSkeletonProps = {
  code: string;
  bankName: string;
  accounts: BalanceTarget[];
};

export default function BankRowSkeleton({
  code,
  bankName,
  accounts,
}: BankRowSkeletonProps) {
  return (
    <tr className="border-b border-line-soft last:border-0">
      <td className="px-4 py-3">
        <span className="block font-bold uppercase leading-snug text-ink">
          {bankName}
        </span>
        <span className="meta">Código {code}</span>
      </td>
      {accounts.map((item) => (
        <td key={item.code} className="px-4 py-3 text-right">
          <span className="inline-block h-4 w-16 animate-pulse rounded bg-surface-1 align-middle" />
        </td>
      ))}
    </tr>
  );
}
