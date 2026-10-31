import Axios from "axios";

const RAW_API_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_KEY) ||
  "a459948ad1d9c663b3f759e3e93d7ca4";
const RAW_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_BASE_URL) ||
  "https://api.themoviedb.org/3";

export const API_KEY = RAW_API_KEY.trim();
export const BASE_URL = RAW_BASE_URL.trim();

// Fallback genres in case the TMDB genre endpoint is unavailable or offline
export const FALLBACK_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

// Predefined mood categories mapping to appropriate TMDB genres and criteria
export const MOODS = [
  {
    id: "happy",
    label: "Happy & Feel-Good",
    emoji: "☀️",
    badge: "Comedy & Family",
    description: "Uplifting comedies, heartwarming animation, and feel-good stories to brighten your day.",
    genres: "35,10751,16",
    minRating: 6.5,
    sortBy: "popularity.desc",
  },
  {
    id: "romantic",
    label: "Romantic",
    emoji: "💕",
    badge: "Romance & Drama",
    description: "Heartfelt romances, charming love stories, and emotional connections.",
    genres: "10749,18",
    minRating: 6.5,
    sortBy: "popularity.desc",
  },
  {
    id: "thrilling",
    label: "Thrilling",
    emoji: "⚡",
    badge: "Action & Suspense",
    description: "Heart-pounding action, suspenseful mysteries, and high-octane adrenaline rushes.",
    genres: "28,53,80",
    minRating: 6.5,
    sortBy: "popularity.desc",
  },
  {
    id: "mind-bending",
    label: "Mind-Bending",
    emoji: "🧠",
    badge: "Sci-Fi & Mystery",
    description: "Reality-bending puzzles, cerebral sci-fi, and unexpected psychological plot twists.",
    genres: "878,9648",
    minRating: 7.0,
    sortBy: "vote_average.desc",
  },
  {
    id: "adventurous",
    label: "Adventurous",
    emoji: "🗺️",
    badge: "Adventure & Fantasy",
    description: "Epic journeys, magical worlds, and grand quests beyond imagination.",
    genres: "12,14",
    minRating: 6.5,
    sortBy: "popularity.desc",
  },
  {
    id: "spooky",
    label: "Spooky",
    emoji: "🎃",
    badge: "Horror & Mystery",
    description: "Paranormal encounters, creepy atmosphere, and spine-tingling scares.",
    genres: "27,9648",
    minRating: 6.0,
    sortBy: "popularity.desc",
  },
  {
    id: "inspiring",
    label: "Inspiring",
    emoji: "🏆",
    badge: "History & Drama",
    description: "Triumphs of the human spirit, true inspiring stories, and deep life journeys.",
    genres: "18,36,99",
    minRating: 7.2,
    sortBy: "vote_average.desc",
  },
];

// Trending Movies
export const getTrendingMovies = async () => {
  try {
    const res = await Axios.get(
      `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=en-US`
    );
    return res.data.results || [];
  } catch (error) {
    console.error("Error in Fetching Trending Movies:", error);
    throw error;
  }
};

// Popular Movies (preserved signature for backward compatibility)
export const getPopularMovies = async (page = 1) => {
  try {
    const res = await Axios.get(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
    );
    return res.data.results || [];
  } catch (error) {
    console.error("Error in Fetching Popular Movies:", error);
    throw error;
  }
};

// Single Movie Details with videos, credits, and similar movies appended
export const getMovieDetails = async (id) => {
  try {
    const res = await Axios.get(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=videos,credits,similar`
    );
    return res.data;
  } catch (error) {
    console.error("Error in Fetching Movie Details:", error);
    throw error;
  }
};

// Movie Videos (trailers, teasers, clips)
export const getMovieVideos = async (id) => {
  try {
    const res = await Axios.get(
      `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`
    );
    return res.data.results || [];
  } catch (error) {
    console.error("Error in Fetching Movie Videos:", error);
    return [];
  }
};

// Movie Credits (cast and crew)
export const getMovieCredits = async (id) => {
  try {
    const res = await Axios.get(
      `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}&language=en-US`
    );
    return res.data || { cast: [], crew: [] };
  } catch (error) {
    console.error("Error in Fetching Movie Credits:", error);
    return { cast: [], crew: [] };
  }
};

// Similar Movies
export const getSimilarMovies = async (id, page = 1) => {
  try {
    const res = await Axios.get(
      `${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}&language=en-US&page=${page}`
    );
    return res.data.results || [];
  } catch (error) {
    console.error("Error in Fetching Similar Movies:", error);
    return [];
  }
};

// Movie Genres list
export const getGenres = async () => {
  try {
    const res = await Axios.get(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
    );
    return res.data.genres && res.data.genres.length > 0
      ? res.data.genres
      : FALLBACK_GENRES;
  } catch (error) {
    console.warn("Could not fetch genres from TMDB, using fallback genres:", error);
    return FALLBACK_GENRES;
  }
};

// Mood-based movie recommendation API
export const getMoviesByMood = async ({
  moodId = "happy",
  page = 1,
  signal,
}) => {
  const mood = MOODS.find((m) => m.id === moodId) || MOODS[0];

  const params = {
    api_key: API_KEY,
    language: "en-US",
    page: Math.max(1, page),
    sort_by: mood.sortBy || "popularity.desc",
    with_genres: mood.genres,
    "vote_average.gte": mood.minRating || 6.5,
    "vote_count.gte": 80,
    include_adult: false,
  };

  try {
    const res = await Axios.get(`${BASE_URL}/discover/movie`, {
      params,
      signal,
    });

    return {
      mood,
      results: res.data.results || [],
      total_pages: Math.min(res.data.total_pages || 1, 50),
      total_results: res.data.total_results || 0,
      page: res.data.page || page,
    };
  } catch (error) {
    console.error("Error fetching mood movies:", error);
    throw error;
  }
};

// Random Surprise Movie API
export const getRandomSurpriseMovie = async ({ moodId = null, signal } = {}) => {
  try {
    // Pick a random page between 1 and 4 for variety
    const randomPage = Math.floor(Math.random() * 4) + 1;
    const mood = moodId ? MOODS.find((m) => m.id === moodId) : null;

    const params = {
      api_key: API_KEY,
      language: "en-US",
      page: randomPage,
      sort_by: "popularity.desc",
      "vote_average.gte": 7.0,
      "vote_count.gte": 150,
      include_adult: false,
    };

    if (mood) {
      params.with_genres = mood.genres;
      params["vote_average.gte"] = mood.minRating || 6.5;
    }

    const res = await Axios.get(`${BASE_URL}/discover/movie`, {
      params,
      signal,
    });

    const results = res.data.results || [];
    if (results.length === 0) return null;

    // Pick a random movie from results
    const randomIndex = Math.floor(Math.random() * results.length);
    return results[randomIndex];
  } catch (error) {
    console.error("Error fetching surprise movie:", error);
    throw error;
  }
};

// Advanced search and filters using TMDB search/movie and discover/movie APIs
export const fetchMoviesWithFilters = async ({
  query = "",
  page = 1,
  genre = "",
  year = "",
  minRating = 0,
  sortBy = "popularity.desc",
  signal,
}) => {
  const isSearch = Boolean(query && query.trim());

  if (isSearch) {
    const params = {
      api_key: API_KEY,
      language: "en-US",
      query: query.trim(),
      page: Math.max(1, page),
      include_adult: false,
    };

    if (year) {
      params.primary_release_year = year;
    }

    const res = await Axios.get(`${BASE_URL}/search/movie`, {
      params,
      signal,
    });

    let results = [...(res.data.results || [])];

    if (genre) {
      const genreId = Number(genre);
      results = results.filter(
        (m) => Array.isArray(m.genre_ids) && m.genre_ids.includes(genreId)
      );
    }

    if (minRating && Number(minRating) > 0) {
      const min = Number(minRating);
      results = results.filter((m) => Number(m.vote_average || 0) >= min);
    }

    if (year) {
      results = results.filter(
        (m) => m.release_date && m.release_date.startsWith(String(year))
      );
    }

    if (sortBy === "popularity.asc") {
      results.sort((a, b) => (a.popularity || 0) - (b.popularity || 0));
    } else if (sortBy === "popularity.desc") {
      results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (sortBy === "vote_average.asc") {
      results.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0));
    } else if (sortBy === "vote_average.desc") {
      results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (sortBy === "primary_release_date.asc") {
      results.sort(
        (a, b) => new Date(a.release_date || 0) - new Date(b.release_date || 0)
      );
    } else if (sortBy === "primary_release_date.desc") {
      results.sort(
        (a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0)
      );
    }

    return {
      results,
      total_pages: Math.min(res.data.total_pages || 1, 500),
      total_results: res.data.total_results || results.length,
      page: res.data.page || page,
    };
  } else {
    const params = {
      api_key: API_KEY,
      language: "en-US",
      page: Math.max(1, page),
      sort_by: sortBy || "popularity.desc",
      include_adult: false,
    };

    if (genre) {
      params.with_genres = genre;
    }

    if (year) {
      params.primary_release_year = year;
    }

    if (minRating && Number(minRating) > 0) {
      params["vote_average.gte"] = Number(minRating);
      params["vote_count.gte"] = 10;
    } else if (sortBy && sortBy.startsWith("vote_average")) {
      params["vote_count.gte"] = 50;
    }

    const res = await Axios.get(`${BASE_URL}/discover/movie`, {
      params,
      signal,
    });

    return {
      results: res.data.results || [],
      total_pages: Math.min(res.data.total_pages || 1, 500),
      total_results: res.data.total_results || 0,
      page: res.data.page || page,
    };
  }
};
