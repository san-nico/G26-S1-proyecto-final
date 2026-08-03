import { redirect } from "next/navigation";

export default function Page() {
  // Fecha actual utilizada como referencia para la redirección inicial.
  const currentDate = new Date();

  // Se retrocede dos meses para mostrar un periodo anterior por defecto.
  currentDate.setMonth(currentDate.getMonth() - 2);

  // Se obtiene el año y el mes en formato compatible con la URL.
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");

  // Redirige a la vista de bancos con los parámetros de fecha seleccionados.
  redirect(`/bancos?year=${year}&month=${month}`);
}
