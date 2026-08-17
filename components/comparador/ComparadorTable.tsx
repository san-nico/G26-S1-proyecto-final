import type { AccountTarget } from "@/lib/bancos";

type ComparadorTableProps = {
  accounts: AccountTarget[];
  firstColumnLabel?: string;
  children: React.ReactNode;
};

export default function ComparadorTable({
  accounts,
  firstColumnLabel = "Institución",
  children,
}: ComparadorTableProps) {
  return (
    <div className="card mt-6 overflow-x-auto p-0">
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-1">
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted">
              {firstColumnLabel}
            </th>
            {accounts.map((item) => (
              <th
                key={item.code}
                className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-muted"
              >
                {item.title}
                <span className="mt-1 block text-[10px] font-semibold normal-case tracking-normal">
                  Billones de CLP
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
