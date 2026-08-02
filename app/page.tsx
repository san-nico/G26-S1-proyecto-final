import { redirect } from "next/navigation";

export default function Page() {
  redirect("/bancos?year=2026&month=06");
}
