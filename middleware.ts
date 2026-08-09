import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Si no estamos en la raíz "/", dejamos pasar la petición para evitar loops.
  if (url.pathname !== "/") {
    return NextResponse.next();
  }

  const hasYear = url.searchParams.has("year");
  const hasMonth = url.searchParams.has("month");

  // Si falta alguno de los parámetros, los inyectamos y redirigimos
  if (!hasYear || !hasMonth) {
    const date = new Date();
    date.setMonth(date.getMonth() - 2);

    if (!hasYear) {
      url.searchParams.set("year", date.getFullYear().toString());
    }
    if (!hasMonth) {
      url.searchParams.set(
        "month",
        String(date.getMonth() + 1).padStart(2, "0"),
      );
    }

    return NextResponse.redirect(url);
  }

  // Si ya tiene los parámetros en "/", hacemos el rewrite interno hacia /bancos
  url.pathname = "/bancos";
  return NextResponse.rewrite(url);
}

// Configuración del matcher para la raíz
export const config = {
  matcher: "/",
};
