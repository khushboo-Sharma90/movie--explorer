// Storage helpers for Favourites and Watchlist with duplicate prevention and event dispatch

const FAV_STORAGE_KEY = "favMovie";
const WATCHLIST_STORAGE_KEY = "watchlistMovies";

const safeParse = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
};

const safeSave = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("movie-storage-update", {
          detail: { key, data },
        })
      );
    }
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// ----------------- Favourites -----------------

export const getFav = () => safeParse(FAV_STORAGE_KEY);

export const addToFav = (movie) => {
  if (!movie || movie.id == null) return;
  const favs = getFav();
  const exists = favs.some((m) => Number(m.id) === Number(movie.id));
  if (!exists) {
    safeSave(FAV_STORAGE_KEY, [...favs, movie]);
  }
};

export const removeFromFav = (id) => {
  if (id == null) return;
  const favs = getFav();
  const updatedMovie = favs.filter((m) => Number(m.id) !== Number(id));
  safeSave(FAV_STORAGE_KEY, updatedMovie);
};

export const isFav = (id) => {
  if (id == null) return false;
  const favs = getFav();
  return favs.some((m) => Number(m.id) === Number(id));
};

// ----------------- Watchlist -----------------

export const getWatchlist = () => safeParse(WATCHLIST_STORAGE_KEY);

export const addToWatchlist = (movie) => {
  if (!movie || movie.id == null) return;
  const list = getWatchlist();
  const exists = list.some((m) => Number(m.id) === Number(movie.id));
  if (!exists) {
    safeSave(WATCHLIST_STORAGE_KEY, [...list, movie]);
  }
};

export const removeFromWatchlist = (id) => {
  if (id == null) return;
  const list = getWatchlist();
  const updatedList = list.filter((m) => Number(m.id) !== Number(id));
  safeSave(WATCHLIST_STORAGE_KEY, updatedList);
};

export const isInWatchlist = (id) => {
  if (id == null) return false;
  const list = getWatchlist();
  return list.some((m) => Number(m.id) === Number(id));
};
