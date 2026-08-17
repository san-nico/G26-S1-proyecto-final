import type { AccountTarget } from "@/lib/bancos";

type BankRowSkeletonProps = {
  code: string;
  bankName: string;
  accounts: AccountTarget[];
};

export default function BankRowSkeleton({
  code,
  bankName,
  accounts,
}: BankRowSkeletonProps) {
  return (
    <tr className="border-b border-line-soft last:border-0">
      <td className="px-4 py-3">
        <span className="flex items-center gap-3">
          <span className="size-9 shrink-0 animate-pulse rounded-lg border border-line bg-surface-1" />
          <span className="min-w-0">
            <span className="block font-bold uppercase leading-snug text-ink">
              {bankName}
            </span>
            <span className="meta">Código {code}</span>
          </span>
        </span>
      </td>
      {accounts.map((item) => (
        <td key={item.code} className="px-4 py-3 text-right">
          <span className="inline-block h-4 w-16 animate-pulse rounded bg-surface-1 align-middle" />
        </td>
      ))}
    </tr>
  );
}
