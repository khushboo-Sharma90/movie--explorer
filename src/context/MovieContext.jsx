/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getFav,
  addToFav as addFavToStorage,
  removeFromFav as removeFavFromStorage,
  getWatchlist,
  addToWatchlist as addWatchlistToStorage,
  removeFromWatchlist as removeWatchlistFromStorage,
} from "../components/fav";

const MovieContext = createContext(null);

export const MovieProvider = ({ children }) => {
  const [favourites, setFavourites] = useState(() => getFav());
  const [watchlist, setWatchlist] = useState(() => getWatchlist());

  const syncStateFromStorage = useCallback(() => {
    setFavourites(getFav());
    setWatchlist(getWatchlist());
  }, []);

  useEffect(() => {
    // Listen to custom intra-app updates
    const handleCustomUpdate = () => {
      syncStateFromStorage();
    };

    // Listen to cross-tab storage changes
    const handleStorageEvent = (event) => {
      if (event.key === "favMovie" || event.key === "watchlistMovies") {
        syncStateFromStorage();
      }
    };

    window.addEventListener("movie-storage-update", handleCustomUpdate);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("movie-storage-update", handleCustomUpdate);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [syncStateFromStorage]);

  const isFav = useCallback(
    (id) => {
      if (id == null) return false;
      return favourites.some((m) => Number(m.id) === Number(id));
    },
    [favourites]
  );

  const isInWatchlist = useCallback(
    (id) => {
      if (id == null) return false;
      return watchlist.some((m) => Number(m.id) === Number(id));
    },
    [watchlist]
  );

  const addToFav = useCallback(
    (movie) => {
      if (!movie || movie.id == null) return;
      if (!isFav(movie.id)) {
        addFavToStorage(movie);
        setFavourites(getFav());
        toast.success(`${movie.title || "Movie"} added to Favourites! ❤️`);
      }
    },
    [isFav]
  );

  const removeFromFav = useCallback((id, title) => {
    if (id == null) return;
    removeFavFromStorage(id);
    setFavourites(getFav());
    toast.info(`${title || "Movie"} removed from Favourites`);
  }, []);

  const toggleFav = useCallback(
    (movie) => {
      if (!movie || movie.id == null) return;
      if (isFav(movie.id)) {
        removeFromFav(movie.id, movie.title);
      } else {
        addToFav(movie);
      }
    },
    [isFav, addToFav, removeFromFav]
  );

  const addToWatchlist = useCallback(
    (movie) => {
      if (!movie || movie.id == null) return;
      if (!isInWatchlist(movie.id)) {
        addWatchlistToStorage(movie);
        setWatchlist(getWatchlist());
        toast.success(`${movie.title || "Movie"} added to Watchlist! 📑`);
      }
    },
    [isInWatchlist]
  );

  const removeFromWatchlist = useCallback((id, title) => {
    if (id == null) return;
    removeWatchlistFromStorage(id);
    setWatchlist(getWatchlist());
    toast.info(`${title || "Movie"} removed from Watchlist`);
  }, []);

  const toggleWatchlist = useCallback(
    (movie) => {
      if (!movie || movie.id == null) return;
      if (isInWatchlist(movie.id)) {
        removeFromWatchlist(movie.id, movie.title);
      } else {
        addToWatchlist(movie);
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  return (
    <MovieContext.Provider
      value={{
        favourites,
        watchlist,
        favouritesCount: favourites.length,
        watchlistCount: watchlist.length,
        isFav,
        isInWatchlist,
        addToFav,
        removeFromFav,
        toggleFav,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovieContext = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error("useMovieContext must be used within a MovieProvider");
  }
  return context;
};
