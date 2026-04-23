import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { searchCoins, getCoinPrices } from "../services/api";
import "./Search.css";

const DEBOUNCE_MS = 500;

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    document.title = "CryptoSearch — Search";
    const q = searchParams.get("q");
    if (q) runSearch(q);
  }, []);

  const runSearch = async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const coins = await searchCoins(q);
      setResults(coins);
      // Fetch prices for top 10 results (avoid huge requests)
      const topIds = coins.slice(0, 10).map((c) => c.id);
      if (topIds.length) {
        const priceMap = await getCoinPrices(topIds);
        setPrices(priceMap);
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced live search — fires 500ms after user stops typing
  const handleQueryChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim()) {
        setSearchParams({ q: val.trim() });
        runSearch(val.trim());
      } else {
        setResults([]);
        setSearched(false);
      }
    }, DEBOUNCE_MS);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    if (!query.trim()) return;
    setSearchParams({ q: query.trim() });
    runSearch(query.trim());
  };

  return (
    <div className="search-page">
      <h1>Search Coins</h1>
      <SearchBar value={query} onChange={handleQueryChange} onSubmit={handleSubmit} />

      {loading && (
        <div className="search-loading">
          <div className="search-spinner" />
          <span>Searching...</span>
        </div>
      )}
      {error && <p className="status-msg error">{error}</p>}
      {!loading && searched && results.length === 0 && (
        <p className="status-msg">No results found for "{searchParams.get("q")}".</p>
      )}

      {results.length > 0 && (
        <p className="results-count">{results.length} results</p>
      )}

      <ul className="search-results">
        {results.map((coin) => {
          const market = prices[coin.id];
          const isPositive = market?.price_change_percentage_24h >= 0;
          return (
            <li key={coin.id}>
              <div className="result-item">
                {/* Left: icon + name */}
                <div className="result-left">
                  {coin.thumb && (
                    <img src={coin.thumb} alt={coin.name} width={32} height={32} />
                  )}
                  <div>
                    <span className="result-name">{coin.name}</span>
                    <span className="result-symbol">{coin.symbol.toUpperCase()}</span>
                  </div>
                </div>

                {/* Middle: rank + price */}
                <div className="result-meta">
                  {coin.market_cap_rank && (
                    <span className="result-rank">#{coin.market_cap_rank}</span>
                  )}
                  {market ? (
                    <div className="result-price-block">
                      <span className="result-price">
                        ${market.current_price.toLocaleString()}
                      </span>
                      <span className={`result-change ${isPositive ? "positive" : "negative"}`}>
                        {isPositive ? "▲" : "▼"} {Math.abs(market.price_change_percentage_24h).toFixed(2)}%
                      </span>
                    </div>
                  ) : (
                    <span className="result-no-price">—</span>
                  )}
                </div>

                {/* Right: More Info button */}
                <Link to={`/details/${coin.id}`} className="more-info-btn">
                  More Info
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
