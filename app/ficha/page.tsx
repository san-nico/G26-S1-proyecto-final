import FichaView from "@/components/ficha/FichaView";
import { getPerfilInstitucion } from "@/lib/cmf";

interface PageProps {
  searchParams: Promise<{
    codigo?: string;
    year?: string;
    month?: string;
  }>;
}

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  const { codigo, year, month } = searchParams;

  const perfil = await getPerfilInstitucion({ codigo, year, month });

  return <FichaView perfil={perfil} />;
}
