import axios from "axios";

const BASE_URL = "/api";

// ── Cache (5 min TTL) ──────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 5 * 60_000; // 5 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}
function setCached(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// ── Serial request queue (one at a time, 1.2s apart) ──────────────────────
let queue = Promise.resolve();
const MIN_INTERVAL = 1500; // ms between requests
let lastCallTime = 0;

function enqueue(fn) {
  queue = queue.then(async () => {
    const wait = MIN_INTERVAL - (Date.now() - lastCallTime);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCallTime = Date.now();
    return fn();
  });
  return queue;
}

async function throttledGet(url, params = {}) {
  const key = url + JSON.stringify(params);
  const cached = getCached(key);
  if (cached) return cached;

  return enqueue(async () => {
    // Re-check cache — another queued call may have already fetched this
    const hit = getCached(key);
    if (hit) return hit;

    try {
      const { data } = await axios.get(url, { params });
      setCached(key, data);
      return data;
    } catch (err) {
      if (err.response?.status === 429) {
        // Back off for 15s then retry once
        await new Promise((r) => setTimeout(r, 15000));
        const { data } = await axios.get(url, { params });
        setCached(key, data);
        return data;
      }
      throw err;
    }
  });
}

// ── API calls ──────────────────────────────────────────────────────────────

export const getTopCoins = (limit = 20) =>
  throttledGet(`${BASE_URL}/coins/markets`, {
    vs_currency: "usd", order: "market_cap_desc",
    per_page: limit, page: 1, sparkline: false,
  });

export const getTopCoinsPaged = ({ limit = 20, page = 1, order = "market_cap_desc" } = {}) =>
  throttledGet(`${BASE_URL}/coins/markets`, {
    vs_currency: "usd", order, per_page: limit, page, sparkline: false,
  });

export const searchCoins = async (query) => {
  const data = await throttledGet(`${BASE_URL}/search`, { query });
  return data.coins;
};

export const getCoinPrices = async (ids) => {
  const data = await throttledGet(`${BASE_URL}/coins/markets`, {
    vs_currency: "usd", ids: ids.join(","),
    order: "market_cap_desc", per_page: ids.length, page: 1, sparkline: false,
  });
  return Object.fromEntries(data.map((c) => [c.id, c]));
};

export const getCoinDetails = (id) =>
  throttledGet(`${BASE_URL}/coins/${id}`, {
    localization: false, tickers: false, community_data: false,
  });

export const getCoinChart = async (id, days = 7, currency = "usd") => {
  const data = await throttledGet(`${BASE_URL}/coins/${id}/market_chart`, {
    vs_currency: currency, days,
  });
  return data.prices;
};

export const getGlobalStats = async () => {
  const data = await throttledGet(`${BASE_URL}/global`);
  return data.data;
};

// News: built from coin links (status_updates removed from CoinGecko free tier)
export const getCoinNews = async (id) => {
  try {
    const coin = await getCoinDetails(id); // already cached — no extra request
    const links = coin?.links || {};
    const items = [];
    if (links.homepage?.[0])
      items.push({ title: `Official Website — ${coin.name}`, url: links.homepage[0], source: "Official", publishedAt: new Date().toISOString() });
    if (links.subreddit_url)
      items.push({ title: `Reddit Community — r/${coin.name}`, url: links.subreddit_url, source: "Reddit", publishedAt: new Date().toISOString() });
    if (links.repos_url?.github?.[0])
      items.push({ title: `GitHub Repository — ${coin.name}`, url: links.repos_url.github[0], source: "GitHub", publishedAt: new Date().toISOString() });
    if (links.twitter_screen_name)
      items.push({ title: `Twitter / X — @${links.twitter_screen_name}`, url: `https://twitter.com/${links.twitter_screen_name}`, source: "Twitter", publishedAt: new Date().toISOString() });
    return items;
  } catch {
    return [];
  }
};
