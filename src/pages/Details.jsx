import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ChartComponent from "../components/ChartComponent";
import { getCoinDetails } from "../services/api";
import "./Details.css";

export default function Details() {
  const { id } = useParams();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCoinDetails(id)
      .then((data) => {
        setCoin(data);
        document.title = `${data.name} (${data.symbol.toUpperCase()}) — CryptoSearch`;
      })
      .catch(() => setError("Could not load coin details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="status-msg">Loading...</p>;
  if (error) return <p className="status-msg error">{error}</p>;
  if (!coin) return null;

  const price = coin.market_data.current_price.usd;
  const change24h = coin.market_data.price_change_percentage_24h;
  const high24h = coin.market_data.high_24h.usd;
  const low24h = coin.market_data.low_24h.usd;
  const marketCap = coin.market_data.market_cap.usd;
  const volume = coin.market_data.total_volume.usd;
  const isPositive = change24h >= 0;

  return (
    <div className="details-page">
      <Link to="/" className="back-link">← Back</Link>

      <div className="details-header">
        <img src={coin.image.large} alt={coin.name} width={56} height={56} />
        <div>
          <h1>{coin.name} <span className="symbol">{coin.symbol.toUpperCase()}</span></h1>
          {coin.market_cap_rank && (
            <span className="rank">Rank #{coin.market_cap_rank}</span>
          )}
        </div>
      </div>

      <div className="price-row">
        <span className="price">${price.toLocaleString()}</span>
        <span className={`change ${isPositive ? "positive" : "negative"}`}>
          {isPositive ? "▲" : "▼"} {Math.abs(change24h).toFixed(2)}% (24h)
        </span>
      </div>

      <div className="stats-grid">
        <div className="stat"><p className="stat-label">24h High</p><p className="stat-value">${high24h.toLocaleString()}</p></div>
        <div className="stat"><p className="stat-label">24h Low</p><p className="stat-value">${low24h.toLocaleString()}</p></div>
        <div className="stat"><p className="stat-label">Market Cap</p><p className="stat-value">${(marketCap / 1e9).toFixed(2)}B</p></div>
        <div className="stat"><p className="stat-label">24h Volume</p><p className="stat-value">${(volume / 1e9).toFixed(2)}B</p></div>
      </div>

      <ChartComponent coinId={id} />

      {coin.description?.en && (
        <div className="description">
          <h2>About {coin.name}</h2>
          <p
            dangerouslySetInnerHTML={{
              __html: coin.description.en.split(". ").slice(0, 4).join(". ") + ".",
            }}
          />
        </div>
      )}
    </div>
  );
}
