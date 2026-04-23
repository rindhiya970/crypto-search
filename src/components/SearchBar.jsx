import "./SearchBar.css";

export default function SearchBar({ value, onChange, onSubmit, placeholder = "Search cryptocurrencies..." }) {
  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search cryptocurrencies"
      />
      <button type="submit">Search</button>
    </form>
  );
}
