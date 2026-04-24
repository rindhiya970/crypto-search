import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🪙 CryptoSearch</Link>

      {/* Desktop links */}
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? "active" : ""}>Search</NavLink>
        <NavLink to="/watchlist" className={({ isActive }) => isActive ? "active" : ""}>⭐ Watchlist</NavLink>
      </div>

      <div className="navbar-right">
        {/* Theme toggle */}
        <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
          <NavLink to="/search" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Search</NavLink>
          <NavLink to="/watchlist" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>⭐ Watchlist</NavLink>
        </div>
      )}
    </nav>
  );
}
