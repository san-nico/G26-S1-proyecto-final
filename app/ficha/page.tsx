import FichaView from "@/components/ficha/FichaView";
import { getPerfilInstitucion } from "@/lib/cmf";
import { resolvePeriodParams } from "@/lib/params";

interface PageProps {
  searchParams: Promise<{
    codigo?: string;
    year?: string;
    month?: string;
  }>;
}

export default async function Page(props: PageProps) {
  const params = await props.searchParams;
  const { code, year, month } = resolvePeriodParams(params);

  const perfil = await getPerfilInstitucion({ codigo: code, year, month });

  return <FichaView perfil={perfil} />;
}
