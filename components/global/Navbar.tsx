"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const now = new Date();
  const fallbackYear = String(now.getFullYear());
  const fallbackMonth = String(now.getMonth() + 1).padStart(2, "0");

  const year = searchParams.get("year") || fallbackYear;
  const month = searchParams.get("month") || fallbackMonth;

  const isActive = pathname === "/comparador";
  const comparadorUrl = `/comparador?year=${year}&month=${month}`;

  return (
    <header className="border-b border-line bg-panel">
      <nav className="container-shell flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="text-lg font-bold text-brand-800">
          CMF Bancos
        </Link>
        <Link
          href={comparadorUrl}
          aria-current={isActive ? "page" : undefined}
          className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-semibold no-underline transition-colors duration-200 ${
            isActive
              ? "border-brand-700 bg-brand-50 text-brand-800"
              : "border-line bg-panel text-brand-800 hover:bg-surface-2"
          }`}
        >
          Comparador
        </Link>
      </nav>
    </header>
  );
}
