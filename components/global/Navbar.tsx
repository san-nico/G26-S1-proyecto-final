import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-line bg-panel">
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="text-lg font-bold text-brand-800">
          CMF Bancos
        </Link>
      </nav>
    </header>
  );
}
