import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./CryptoCard.css";

export default function CryptoCard({ coin }) {
  const priceChange = coin.price_change_percentage_24h;
  const isPositive  = priceChange >= 0;
  const prevPrice   = useRef(coin.current_price);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    if (coin.current_price !== prevPrice.current) {
      setFlash(coin.current_price > prevPrice.current ? "flash-up" : "flash-down");
      const t = setTimeout(() => setFlash(""), 1000);
      prevPrice.current = coin.current_price;
      return () => clearTimeout(t);
    }
  }, [coin.current_price]);

  return (
    <Link to={`/details/${coin.id}`} className={`crypto-card ${flash}`}>
      <div className="card-header">
        <img src={coin.image} alt={coin.name} width={36} height={36} />
        <div>
          <p className="coin-name">{coin.name}</p>
          <p className="coin-symbol">{coin.symbol.toUpperCase()}</p>
        </div>
      </div>
      <div className="card-body">
        <p className="coin-price">${coin.current_price.toLocaleString()}</p>
        <p className={`coin-change ${isPositive ? "positive" : "negative"}`}>
          {isPositive ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)}%
        </p>
      </div>
      <p className="coin-market-cap">
        MCap: ${(coin.market_cap / 1e9).toFixed(2)}B
      </p>
    </Link>
  );
}
