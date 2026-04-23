import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🪙 CryptoSearch
      </Link>

      {/* Desktop links */}
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? "active" : ""}>Search</NavLink>
      </div>

      {/* Mobile hamburger */}
      <button
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
          <NavLink to="/search" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Search</NavLink>
        </div>
      )}
    </nav>
  );
}
