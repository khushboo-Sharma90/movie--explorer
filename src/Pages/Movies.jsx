import React, { useState, useEffect, useMemo } from "react";
import Axios from "axios";
import { fetchMoviesWithFilters, getGenres } from "../services/apiService";
import MovieCard from "../components/MovieCard";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track retry count to trigger re-fetch on manual retry
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Generate list of release years (from current year down to 1970)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const result = [];
    for (let y = currentYear; y >= 1970; y--) {
      result.push(y);
    }
    return result;
  }, []);

  // Fetch genres on mount
  useEffect(() => {
    let isMounted = true;
    getGenres()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setGenres(data);
        }
      })
      .catch((err) => {
        console.warn("Could not load genres:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounce search input changes (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Main data-fetching effect with AbortController for stale request handling
  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;

    // Use microtask to avoid synchronous setState inside effect body
    queueMicrotask(() => {
      if (isCurrent) {
        setLoading(true);
        setError(null);
      }
    });

    const loadMovies = async () => {
      try {
        const data = await fetchMoviesWithFilters({
          query: debouncedSearch,
          page,
          genre: selectedGenre,
          year: selectedYear,
          minRating,
          sortBy,
          signal: controller.signal,
        });

        if (isCurrent) {
          setMovies(data.results || []);
          setTotalPages(data.total_pages || 1);
          setTotalResults(data.total_results || 0);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (
          Axios.isCancel(err) ||
          err.name === "CanceledError" ||
          err.message === "canceled"
        ) {
          // Request was cancelled due to new input/stale request; do nothing
          return;
        }

        if (isCurrent) {
          console.error("Error fetching movies:", err);
          setError("Failed to load movies. Please check your network or try again.");
          setLoading(false);
        }
      }
    };

    loadMovies();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [
    debouncedSearch,
    page,
    selectedGenre,
    selectedYear,
    minRating,
    sortBy,
    retryTrigger,
  ]);

  // Filter change handlers - reset page to 1
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDebouncedSearch(search.trim());
    setPage(1);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setPage(1);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setPage(1);
  };

  const handleMinRatingChange = (e) => {
    setMinRating(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedGenre("");
    setSelectedYear("");
    setMinRating("0");
    setSortBy("popularity.desc");
    setPage(1);
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setRetryTrigger((prev) => prev + 1);
  };

  const isFiltered =
    Boolean(search) ||
    Boolean(selectedGenre) ||
    Boolean(selectedYear) ||
    minRating !== "0" ||
    sortBy !== "popularity.desc";

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            {debouncedSearch ? `Search Results for "${debouncedSearch}"` : "Discover & Explore Movies"}
          </h1>
          <p className="mt-2 text-gray-600">
            Search by title, filter by genre or year, and sort by rating or popularity.
          </p>
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-200">
          {/* Search Input Row */}
          <form onSubmit={handleSearchSubmit} className="mb-5">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400 text-xl pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search movies by title (e.g. Inception, Batman)..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-base shadow-sm transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setDebouncedSearch("");
                    setPage(1);
                  }}
                  title="Clear search text"
                  className="absolute right-4 text-gray-400 hover:text-gray-700 text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          {/* Filter Dropdowns & Clear Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 items-end">
            {/* Genre Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={handleGenreChange}
                className="w-full bg-gray-50 border border-gray-300 px-3.5 py-2.5 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Release Year Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Release Year
              </label>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="w-full bg-gray-50 border border-gray-300 px-3.5 py-2.5 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value="">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Rating Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Min Rating
              </label>
              <select
                value={minRating}
                onChange={handleMinRatingChange}
                className="w-full bg-gray-50 border border-gray-300 px-3.5 py-2.5 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition"
              >
                <option value="0">All Ratings</option>
                <option value="5">⭐ 5+ Stars</option>
                <option value="6">⭐ 6+ Stars</option>
                <option value="7">⭐ 7+ Stars</option>
                <option value="8">⭐ 8+ Stars</option>
              </select>
            </div>

            {/* Sort By Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full bg-gray-50 border border-gray-300 px-3.5 py-2.5 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value="popularity.desc">Popularity: High to Low</option>
                <option value="popularity.asc">Popularity: Low to High</option>
                <option value="vote_average.desc">Rating: High to Low</option>
                <option value="vote_average.asc">Rating: Low to High</option>
                <option value="primary_release_date.desc">Release Date: Newest</option>
                <option value="primary_release_date.asc">Release Date: Oldest</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex sm:col-span-2 md:col-span-4 lg:col-span-1">
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={!isFiltered}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                  isFiltered
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60"
                }`}
              >
                <span>🔄</span> Clear Filters
              </button>
            </div>
          </div>

          {/* Active filter summary & counts */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-500 gap-2">
            <div>
              {totalResults > 0 && !loading && (
                <span>
                  Found <strong className="text-gray-800">{totalResults}</strong> movies
                  (Page {page} of {totalPages})
                </span>
              )}
            </div>
            {isFiltered && (
              <span className="text-blue-600 font-medium">
                Active filters applied
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 animate-pulse">
              Loading Movies...
            </h2>
          </div>
        )}

        {/* API Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-xl mx-auto my-8 shadow-sm">
            <span className="text-4xl mb-3 block">⚠️</span>
            <h3 className="text-xl font-bold text-red-700 mb-2">
              Something went wrong
            </h3>
            <p className="text-red-600 mb-5">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer shadow"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Empty Results State */}
        {!loading && !error && movies.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-lg mx-auto my-8">
            <span className="text-5xl block mb-4">🎬</span>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Movies Found
            </h3>
            <p className="text-gray-500 mb-6">
              {debouncedSearch
                ? `No movies matched "${debouncedSearch}" with the selected filters.`
                : "No movies matched your current filter criteria."}
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer shadow"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && !error && movies.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && movies.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-center items-center mt-12 gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  if (page > 1) {
                    setPage((p) => p - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={`px-5 py-2.5 rounded-xl font-semibold transition cursor-pointer ${
                  page <= 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow"
                }`}
              >
                ⬅️ Previous
              </button>

              <span className="font-semibold text-gray-700 px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-200">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  if (page < totalPages) {
                    setPage((p) => p - 1 + 2);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={`px-5 py-2.5 rounded-xl font-semibold transition cursor-pointer ${
                  page >= totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow"
                }`}
              >
                Next ➡️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Movies;
