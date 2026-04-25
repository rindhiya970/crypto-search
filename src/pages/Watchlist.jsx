import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { getCoinPrices } from "../services/api";
import "./Watchlist.css";

export default function Watchlist() {
  const { favorites, toggle } = useFavorites();
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Crypto Online Market — Watchlist";
    if (!favorites.length) return;
    setLoading(true);
    getCoinPrices(favorites.map((f) => f.id))
      .then(setPrices)
      .finally(() => setLoading(false));
  }, [favorites.length]);

  return (
    <div className="watchlist-page">
      <h1>⭐ My Watchlist</h1>

      {favorites.length === 0 && (
        <div className="watchlist-empty">
          <p>No coins added yet.</p>
          <p>Click the ☆ on any coin card to add it here.</p>
          <Link to="/" className="watchlist-home-link">Browse Coins</Link>
        </div>
      )}

      {loading && <p className="status-msg">Loading prices...</p>}

      {!loading && favorites.length > 0 && (
        <ul className="watchlist-list">
          {favorites.map((coin) => {
            const market = prices[coin.id];
            const isPositive = market?.price_change_percentage_24h >= 0;
            return (
              <li key={coin.id} className="watchlist-item">
                <Link to={`/details/${coin.id}`} className="watchlist-left">
                  <img src={coin.image} alt={coin.name} width={36} height={36} />
                  <div>
                    <span className="wl-name">{coin.name}</span>
                    <span className="wl-symbol">{coin.symbol.toUpperCase()}</span>
                  </div>
                </Link>

                <div className="watchlist-right">
                  {market ? (
                    <>
                      <span className="wl-price">${market.current_price.toLocaleString()}</span>
                      <span className={`wl-change ${isPositive ? "positive" : "negative"}`}>
                        {isPositive ? "▲" : "▼"} {Math.abs(market.price_change_percentage_24h).toFixed(2)}%
                      </span>
                    </>
                  ) : <span className="wl-na">—</span>}

                  <Link to={`/details/${coin.id}`} className="more-info-btn">More Info</Link>

                  <button
                    className="wl-remove"
                    onClick={() => toggle(coin)}
                    aria-label="Remove from watchlist"
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
