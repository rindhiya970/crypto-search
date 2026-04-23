import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { searchCoins } from "../services/api";
import "./Search.css";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    document.title = "CryptoSearch — Search";
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      runSearch(q);
    }
  }, []);

  const runSearch = (q) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    searchCoins(q)
      .then(setResults)
      .catch(() => setError("Search failed. Please try again."))
      .finally(() => setLoading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query.trim() });
    runSearch(query.trim());
  };

  return (
    <div className="search-page">
      <h1>Search Coins</h1>
      <SearchBar value={query} onChange={setQuery} onSubmit={handleSubmit} />

      {loading && <p className="status-msg">Searching...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && searched && results.length === 0 && (
        <p className="status-msg">No results found for "{searchParams.get("q")}".</p>
      )}

      <ul className="search-results">
        {results.map((coin) => (
          <li key={coin.id}>
            <Link to={`/details/${coin.id}`} className="result-item">
              {coin.thumb && (
                <img src={coin.thumb} alt={coin.name} width={24} height={24} />
              )}
              <span className="result-name">{coin.name}</span>
              <span className="result-symbol">{coin.symbol.toUpperCase()}</span>
              {coin.market_cap_rank && (
                <span className="result-rank">#{coin.market_cap_rank}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
