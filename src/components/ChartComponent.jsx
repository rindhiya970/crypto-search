import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from "chart.js";
import { getCoinChart } from "../services/api";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

const RANGES = [
  { label: "7D",  days: 7   },
  { label: "30D", days: 30  },
  { label: "90D", days: 90  },
  { label: "1Y",  days: 365 },
];

const CURRENCY_SYMBOLS = { usd: "$", eur: "€", btc: "₿", eth: "Ξ" };

export default function ChartComponent({ coinId, currency = "usd" }) {
  const [prices, setPrices] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCoinChart(coinId, days, currency)
      .then(setPrices)
      .finally(() => setLoading(false));
  }, [coinId, days, currency]);

  if (loading) return (
    <div className="chart-loading">
      <div className="chart-spinner" />
      <span>Loading chart...</span>
    </div>
  );

  const labels = prices.map(([ts]) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );
  const data = prices.map(([, price]) => price);
  const symbol = CURRENCY_SYMBOLS[currency] ?? "";

  const chartData = {
    labels,
    datasets: [{
      data,
      borderColor: "#f0b90b",
      backgroundColor: "rgba(240,185,11,0.08)",
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
      tension: 0.4,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${symbol}${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#888", maxTicksLimit: 8 }, grid: { color: "#1a1a2e" } },
      y: {
        ticks: {
          color: "#888",
          callback: (v) => `${symbol}${Number(v).toLocaleString()}`,
        },
        grid: { color: "#1a1a2e" },
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-range-btns">
        {RANGES.map((r) => (
          <button
            key={r.days}
            onClick={() => setDays(r.days)}
            className={days === r.days ? "active" : ""}
          >
            {r.label}
          </button>
        ))}
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
}
