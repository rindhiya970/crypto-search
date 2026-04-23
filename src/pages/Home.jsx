import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoCard from "../components/CryptoCard";
import SearchBar from "../components/SearchBar";
import SkeletonCard from "../components/SkeletonCard";
import { getTopCoins } from "../services/api";
import "./Home.css";

export default function Home() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "CryptoSearch — Home";
    getTopCoins(20)
      .then(setCoins)
      .catch(() => setError("Failed to load coins. Try again later."))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="home">
      <div className="home-hero">
        <h1>Crypto Market</h1>
        <p>Track prices, search coins, and explore the market.</p>
        <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} />
      </div>

      <h2 className="section-title">Top 20 by Market Cap</h2>

      {error && <p className="status-msg error">{error}</p>}

      <div className="coins-grid">
        {loading
          ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
          : coins.map((coin) => <CryptoCard key={coin.id} coin={coin} />)
        }
      </div>
    </div>
  );
}
