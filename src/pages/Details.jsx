import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ChartComponent from "../components/ChartComponent";
import { getCoinDetails } from "../services/api";
import "./Details.css";

const CURRENCIES = [
  { key: "usd", label: "USD", symbol: "$",  decimals: 2  },
  { key: "eur", label: "EUR", symbol: "€",  decimals: 2  },
  { key: "btc", label: "BTC", symbol: "₿",  decimals: 8  },
  { key: "eth", label: "ETH", symbol: "Ξ",  decimals: 6  },
];

function fmt(value, decimals) {
  if (value === undefined || value === null) return "N/A";
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function Details() {
  const { id } = useParams();
  const [coin, setCoin]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [activeCurrency, setActiveCurrency] = useState("usd");

  useEffect(() => {
    getCoinDetails(id)
      .then((data) => {
        setCoin(data);
        document.title = `${data.name} (${data.symbol.toUpperCase()}) — CryptoSearch`;
      })
      .catch(() => setError("Could not load coin details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="status-msg"><div className="detail-spinner" /></div>;
  if (error)   return <p className="status-msg error">{error}</p>;
  if (!coin)   return null;

  const md = coin.market_data;
  const cur = CURRENCIES.find((c) => c.key === activeCurrency);

  const price     = md.current_price[activeCurrency];
  const change24h = md.price_change_percentage_24h;
  const high24h   = md.high_24h[activeCurrency];
  const low24h    = md.low_24h[activeCurrency];
  const marketCap = md.market_cap[activeCurrency];
  const volume    = md.total_volume[activeCurrency];
  const ath       = md.ath[activeCurrency];
  const athDate   = md.ath_date[activeCurrency];
  const atl       = md.atl[activeCurrency];
  const atlDate   = md.atl_date[activeCurrency];
  const circSupply = md.circulating_supply;
  const totalSupply = md.total_supply;
  const maxSupply   = md.max_supply;
  const isPositive  = change24h >= 0;

  return (
    <div className="details-page">
      <Link to="/" className="back-link">← Back</Link>

      {/* Header */}
      <div className="details-header">
        <img src={coin.image.large} alt={coin.name} width={56} height={56} />
        <div>
          <h1>{coin.name} <span className="symbol">{coin.symbol.toUpperCase()}</span></h1>
          {coin.market_cap_rank && (
            <span className="rank">Rank #{coin.market_cap_rank}</span>
          )}
        </div>
      </div>

      {/* Currency switcher */}
      <div className="currency-tabs">
        {CURRENCIES.map((c) => (
          <button
            key={c.key}
            className={activeCurrency === c.key ? "active" : ""}
            onClick={() => setActiveCurrency(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Price row */}
      <div className="price-row">
        <span className="price">{cur.symbol}{fmt(price, cur.decimals)}</span>
        <span className={`change ${isPositive ? "positive" : "negative"}`}>
          {isPositive ? "▲" : "▼"} {Math.abs(change24h).toFixed(2)}% (24h)
        </span>
      </div>

      {/* Multi-currency price grid */}
      <div className="currency-grid">
        {CURRENCIES.map((c) => (
          <div
            key={c.key}
            className={`currency-item ${activeCurrency === c.key ? "active" : ""}`}
            onClick={() => setActiveCurrency(c.key)}
          >
            <span className="currency-label">{c.label}</span>
            <span className="currency-value">
              {c.symbol}{fmt(md.current_price[c.key], c.decimals)}
            </span>
          </div>
        ))}
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat">
          <p className="stat-label">24h High</p>
          <p className="stat-value">{cur.symbol}{fmt(high24h, cur.decimals)}</p>
        </div>
        <div className="stat">
          <p className="stat-label">24h Low</p>
          <p className="stat-value">{cur.symbol}{fmt(low24h, cur.decimals)}</p>
        </div>
        <div className="stat">
          <p className="stat-label">Market Cap</p>
          <p className="stat-value">{cur.symbol}{fmt(marketCap, 0)}</p>
        </div>
        <div className="stat">
          <p className="stat-label">24h Volume</p>
          <p className="stat-value">{cur.symbol}{fmt(volume, 0)}</p>
        </div>
        <div className="stat">
          <p className="stat-label">All-Time High</p>
          <p className="stat-value">{cur.symbol}{fmt(ath, cur.decimals)}</p>
          <p className="stat-sub">{athDate ? new Date(athDate).toLocaleDateString() : ""}</p>
        </div>
        <div className="stat">
          <p className="stat-label">All-Time Low</p>
          <p className="stat-value">{cur.symbol}{fmt(atl, cur.decimals)}</p>
          <p className="stat-sub">{atlDate ? new Date(atlDate).toLocaleDateString() : ""}</p>
        </div>
        <div className="stat">
          <p className="stat-label">Circulating Supply</p>
          <p className="stat-value">{circSupply ? Number(circSupply).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "N/A"}</p>
        </div>
        <div className="stat">
          <p className="stat-label">Max Supply</p>
          <p className="stat-value">{maxSupply ? Number(maxSupply).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "∞"}</p>
        </div>
      </div>

      {/* Chart — currency-aware */}
      <ChartComponent coinId={id} currency={activeCurrency} />

      {/* Description */}
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
