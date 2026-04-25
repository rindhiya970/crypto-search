export const config = { runtime: "edge" };

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export default async function handler(req) {
  const url = new URL(req.url);

  // Vercel rewrites /api/coins/markets?... → /api/coingecko?...
  // The original path segments after /api are passed as the "path" param
  // e.g. /api/coins/markets → path = "coins/markets"
  const cgPath = url.searchParams.get("path") || "";
  url.searchParams.delete("path");

  const targetUrl = `${COINGECKO_BASE}/${cgPath}${url.search ? "?" + url.searchParams.toString() : ""}`;

  const headers = { "Accept": "application/json" };
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
