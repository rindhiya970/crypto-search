export const config = { runtime: "edge" };

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export default async function handler(req) {
  const url = new URL(req.url);

  // Remove /api/coingecko prefix, keep the rest as the CoinGecko path
  const cgPath = url.pathname.replace(/^\/api\/coingecko/, "");
  const targetUrl = `${COINGECKO_BASE}${cgPath}${url.search}`;

  const headers = { "Accept": "application/json" };

  // Attach API key if available (optional — works without it too)
  const apiKey = process.env.COINGECKO_API_KEY;
  if (apiKey) headers["x-cg-demo-api-key"] = apiKey;

  const response = await fetch(targetUrl, { headers });
  const data = await response.text();

  return new Response(data, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
