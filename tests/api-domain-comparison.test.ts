import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { cmfRequest } from "@/lib/cmf-bancos";

const ORIGIN_BASE_URL = "https://api.cmfchile.cl/api-sbifv3/recursos_api";
const PROXY_BASE_URL = "https://cmf-api-two.vercel.app/api-sbifv3/recursos_api";

const TEST_CASES = [
  "/balances/2026/06/instituciones",
  "/balances/2026/06/cuentas/100000000",
  "/balances/2026/06/instituciones/001",
  "/resultados/2026/06/cuentas/550000000",
  "/resultados/2026/06/cuentas/560000000",
  "/resultados/2026/06/cuentas/590000000",
  "/perfil/instituciones/001/2026/06",
];

function getApiKey(): string {
  if (process.env.CMF_API_KEY) return process.env.CMF_API_KEY;
  const env = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  const match = env.match(/^CMF_API_KEY=(.+)$/m);
  if (!match) throw new Error("CMF_API_KEY no encontrada en .env.local");
  return match[1].trim();
}

async function fetchJson(url: string): Promise<{
  status: number;
  body: string;
}> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  return { status: res.status, body: await res.text() };
}

describe("comparación de dominios API", () => {
  const apikey = getApiKey();

  for (const path of TEST_CASES) {
    it(`responde igual en ambos dominios para ${path}`, async () => {
      const query = `apikey=${apikey}&formato=json`;
      const origin = await fetchJson(`${ORIGIN_BASE_URL}${path}?${query}`);
      const proxy = await fetchJson(`${PROXY_BASE_URL}${path}?${query}`);

      expect(proxy.status).toBe(origin.status);
      expect(proxy.body).toBe(origin.body);
    }, 30000);
  }

  it("cmfRequest resuelve /resultados vía fallback al dominio original", async () => {
    const data = await cmfRequest(
      { apikey, fetch: (url) => fetch(url, { headers: { Accept: "application/json" } }) },
      "/resultados/2026/06/cuentas/550000000",
    );
    expect(data).toBeTruthy();
  }, 60000);
});