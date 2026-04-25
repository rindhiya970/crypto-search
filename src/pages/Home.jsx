import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CryptoCard from "../components/CryptoCard";
import SearchBar from "../components/SearchBar";
import SkeletonCard from "../components/SkeletonCard";
import { getTopCoinsPaged, getGlobalStats } from "../services/api";
import "./Home.css";

const SORT_OPTIONS = [
  { label: "Market Cap ↓", value: "market_cap_desc" },
  { label: "Market Cap ↑", value: "market_cap_asc" },
  { label: "Price ↓",      value: "current_price_desc" },
  { label: "Price ↑",      value: "current_price_asc" },
  { label: "Volume ↓",     value: "volume_desc" },
];

const PAGE_SIZE = 20;
const REFRESH_INTERVAL = 120000; // 2 minutes — respects free tier (30 calls/min)

export default function Home() {
  const [coins, setCoins]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [query, setQuery]       = useState("");
  const [sort, setSort]         = useState("market_cap_desc");
  const [page, setPage]         = useState(1);
  const [globalStats, setGlobalStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  // Fetch coins — reusable, called on mount + interval + filter/page change
  const fetchCoins = useCallback((showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    setError(null);
    getTopCoinsPaged({ limit: PAGE_SIZE, page, order: sort })
      .then((data) => {
        setCoins(data);
        setLastUpdated(new Date());
      })
      .catch(() => setError("Failed to load coins. Try again later."))
      .finally(() => setLoading(false));
  }, [page, sort]);

  // Initial load + refresh only when tab is visible
  useEffect(() => {
    document.title = "CryptoSearch — Home";
    fetchCoins(true);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchCoins(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchCoins]);

  // Fetch global market stats — once, cached for 5 min
  useEffect(() => {
    getGlobalStats().then(setGlobalStats).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1); // reset to first page on sort change
  };

  return (
    <div className="home">
      {/* Hero */}
      <div className="home-hero">
        <h1>Crypto Market</h1>
        <p>Track prices, search coins, and explore the market.</p>
        <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} />
      </div>

      {/* Global Market Summary Bar */}
      {globalStats && (
        <div className="market-summary">
          <div className="summary-item">
            <span className="summary-label">Total Market Cap</span>
            <span className="summary-value">
              ${(globalStats.total_market_cap.usd / 1e12).toFixed(2)}T
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">24h Volume</span>
            <span className="summary-value">
              ${(globalStats.total_volume.usd / 1e9).toFixed(0)}B
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">BTC Dominance</span>
            <span className="summary-value">
              {globalStats.market_cap_percentage.btc.toFixed(1)}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">ETH Dominance</span>
            <span className="summary-value">
              {globalStats.market_cap_percentage.eth.toFixed(1)}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Active Coins</span>
            <span className="summary-value">
              {globalStats.active_cryptocurrencies.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Controls row */}
      <div className="list-controls">
        <h2 className="section-title">
          Top Cryptocurrencies
          {lastUpdated && (
            <span className="last-updated">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </h2>
        <select className="sort-select" value={sort} onChange={handleSortChange}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="status-msg error">{error}</p>}

      {/* Coin grid */}
      <div className="coins-grid">
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
          : coins.map((coin) => <CryptoCard key={coin.id} coin={coin} />)
        }
      </div>

      {/* Pagination */}
      {!loading && !error && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className="page-indicator">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={coins.length < PAGE_SIZE}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
