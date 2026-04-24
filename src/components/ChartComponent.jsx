import { useEffect, useState, useMemo } from "react";
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
import { useTheme } from "../context/ThemeContext";

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
  const [activeCurrency, setActiveCurrency] = useState(currency);
  const { theme } = useTheme();

  // Sync prop → state but debounce to avoid rapid-fire requests on tab switch
  useEffect(() => {
    const t = setTimeout(() => setActiveCurrency(currency), 300);
    return () => clearTimeout(t);
  }, [currency]);

  // Read CSS variables so chart adapts to dark/light theme
  const cssVar = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const gridColor = cssVar("--border");
  const tickColor = cssVar("--text-muted");

  useEffect(() => {
    setLoading(true);
    getCoinChart(coinId, days, activeCurrency)
      .then(setPrices)
      .finally(() => setLoading(false));
  }, [coinId, days, activeCurrency]);

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
  const symbol = CURRENCY_SYMBOLS[activeCurrency] ?? "";

  const chartData = {
    labels,
    datasets: [{
      data,
      borderColor: cssVar("--accent") || "#f0b90b",
      backgroundColor: theme === "dark"
        ? "rgba(240,185,11,0.08)"
        : "rgba(212,160,9,0.12)",
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
      x: {
        ticks: { color: tickColor, maxTicksLimit: 8 },
        grid: { color: gridColor },
      },
      y: {
        ticks: {
          color: tickColor,
          callback: (v) => `${symbol}${Number(v).toLocaleString()}`,
        },
        grid: { color: gridColor },
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
