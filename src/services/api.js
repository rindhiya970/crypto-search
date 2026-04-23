import axios from "axios";

const BASE_URL = "/api";

// Fetch top coins by market cap
export const getTopCoins = async (limit = 20) => {
  const { data } = await axios.get(`${BASE_URL}/coins/markets`, {
    params: {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: limit,
      page: 1,
      sparkline: false,
    },
  });
  return data;
};

// Search coins by query
export const searchCoins = async (query) => {
  const { data } = await axios.get(`${BASE_URL}/search`, {
    params: { query },
  });
  return data.coins;
};

// Get detailed info for a single coin
export const getCoinDetails = async (id) => {
  const { data } = await axios.get(`${BASE_URL}/coins/${id}`, {
    params: { localization: false, tickers: false, community_data: false },
  });
  return data;
};

// Get historical price chart data (7 days)
export const getCoinChart = async (id, days = 7) => {
  const { data } = await axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
    params: { vs_currency: "usd", days },
  });
  return data.prices; // [[timestamp, price], ...]
};

// Get global market stats (total market cap, BTC dominance, etc.)
export const getGlobalStats = async () => {
  const { data } = await axios.get(`${BASE_URL}/global`);
  return data.data;
};

// Fetch coins with sort + pagination support
export const getTopCoinsPaged = async ({ limit = 20, page = 1, order = "market_cap_desc" } = {}) => {
  const { data } = await axios.get(`${BASE_URL}/coins/markets`, {
    params: {
      vs_currency: "usd",
      order,
      per_page: limit,
      page,
      sparkline: false,
    },
  });
  return data;
};
