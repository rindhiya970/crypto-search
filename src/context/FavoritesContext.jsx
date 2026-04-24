import { createContext, useContext, useState } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(
    () => JSON.parse(localStorage.getItem("favorites") || "[]")
  );

  const toggle = (coin) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === coin.id);
      const next = exists
        ? prev.filter((f) => f.id !== coin.id)
        : [...prev, { id: coin.id, name: coin.name, symbol: coin.symbol, image: coin.image }];
      localStorage.setItem("favorites", JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
