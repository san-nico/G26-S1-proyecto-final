export function formatValue(value?: string) {
  if (!value) return "—";
  const num = Math.round(Number(value.replace(",", ".")));
  return Number.isNaN(num) ? value : num.toLocaleString("es-CL");
}
