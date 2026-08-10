type ComparadorHeaderProps = {
  description: string;
};

export default function ComparadorHeader({
  description,
}: ComparadorHeaderProps) {
  return (
    <section className="max-w-3xl">
      <p className="badge">Datos oficiales CMF Chile</p>
      <h1 className="page-title">Comparador de Bancos</h1>
      <p className="mt-4 text-lg leading-7 text-muted">{description}</p>
      <p className="meta mt-3">
        Porcentaje principal de cada cuenta; el monto de apoyo se expresa en{" "}
        <span className="font-semibold text-ink">billones de CLP</span> (un
        billón = $1.000.000.000). El Pasivo y el Patrimonio se calculan sobre
        el Activo Total.
      </p>
    </section>
  );
}
