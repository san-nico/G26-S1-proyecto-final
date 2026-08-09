import PageLayout from "@/components/global/PageLayout";

type ResumenViewProps = {
  code: string;
  year: string;
  month: string;
  children: React.ReactNode;
};

export default function ResumenView({
  code,
  year,
  month,
  children,
}: ResumenViewProps) {
  return (
    <PageLayout mainClassName="container-main">
      <div className="space-y-8">{children}</div>
      <section className="max-w-2xl mt-2">
        <p className="badge">Datos oficiales CMF Chile</p>

        <p className="meta mt-3">
          Código: {code} · Período: {month}/{year}
        </p>
      </section>
    </PageLayout>
  );
}
