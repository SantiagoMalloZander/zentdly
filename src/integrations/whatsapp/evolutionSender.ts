const BASE_URL = process.env.EVOLUTION_API_URL ?? "https://evolution-api-production-be7b.up.railway.app";
const API_KEY = process.env.EVOLUTION_API_KEY ?? "";

export async function evolutionSendText(instanceName: string, to: string, text: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/message/sendText/${instanceName}`, {
    method: "POST",
    headers: { apikey: API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ number: to, textMessage: { text } }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Evolution send failed [${res.status}]: ${err}`);
  }
}
