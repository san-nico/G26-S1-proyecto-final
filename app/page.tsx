import { redirect } from "next/navigation";

export default function Page() {
  redirect("/bancos?year=2025&month=12");
}
