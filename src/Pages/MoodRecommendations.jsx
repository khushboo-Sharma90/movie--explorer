import { useState, useEffect } from "react";
import Axios from "axios";
import { Link } from "react-router-dom";
import { MOODS, getMoviesByMood, getRandomSurpriseMovie } from "../services/apiService";
import MovieCard from "../components/MovieCard";
import { useMovieContext } from "../context/MovieContext";

function MoodRecommendations() {
  const [activeMoodId, setActiveMoodId] = useState("happy");
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Surprise Me State
  const [surpriseMovie, setSurpriseMovie] = useState(null);
  const [isSurpriseLoading, setIsSurpriseLoading] = useState(false);
  const [showSurpriseModal, setShowSurpriseModal] = useState(false);

  const { isFav, toggleFav, isInWatchlist, toggleWatchlist } = useMovieContext();

  const activeMood = MOODS.find((m) => m.id === activeMoodId) || MOODS[0];

  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;

    queueMicrotask(() => {
      if (isCurrent) {
        setLoading(true);
        setError(null);
      }
    });

    const loadMoodMovies = async () => {
      try {
        const data = await getMoviesByMood({
          moodId: activeMoodId,
          page,
          signal: controller.signal,
        });

        if (isCurrent) {
          setMovies(data.results || []);
          setTotalPages(data.total_pages || 1);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (
          Axios.isCancel(err) ||
          err.name === "CanceledError" ||
          err.message === "canceled"
        ) {
          return;
        }

        if (isCurrent) {
          console.error("Error loading mood recommendations:", err);
          setError("Failed to load mood recommendations. Please try again.");
          setLoading(false);
        }
      }
    };

    loadMoodMovies();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [activeMoodId, page]);

  const handleMoodSelect = (moodId) => {
    if (moodId !== activeMoodId) {
      setActiveMoodId(moodId);
      setPage(1);
    }
  };

  const handleSurpriseMe = async () => {
    try {
      setIsSurpriseLoading(true);
      setShowSurpriseModal(true);
      const random = await getRandomSurpriseMovie({ moodId: activeMoodId });
      setSurpriseMovie(random);
    } catch (err) {
      console.error("Error getting surprise movie:", err);
    } finally {
      setIsSurpriseLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block mb-3">
            ✨ Smart Recommendations
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            What Are You in the Mood For?
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Pick your current vibe and let us curate high-rated movies that match your emotional state, or let fate decide with "Surprise Me"!
          </p>
        </div>

        {/* Mood Selector Chips / Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {MOODS.map((mood) => {
            const isActive = mood.id === activeMoodId;
            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => handleMoodSelect(mood.id)}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center transition cursor-pointer border ${
                  isActive
                    ? "bg-blue-600/30 border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/50 scale-102"
                    : "bg-gray-900/90 border-gray-800 hover:border-gray-700 hover:bg-gray-850"
                }`}
              >
                <span className="text-3xl mb-2">{mood.emoji}</span>
                <span className="font-bold text-sm text-white">{mood.label}</span>
                <span className="text-xs text-gray-400 mt-1">{mood.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Active Mood Banner + Surprise Me Button */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 mb-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span className="text-3xl">{activeMood.emoji}</span>
              <h2 className="text-2xl font-bold text-white">
                {activeMood.label} Selection
              </h2>
            </div>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl">
              {activeMood.description}
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={handleSurpriseMe}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold px-6 py-3.5 rounded-2xl transition cursor-pointer shadow-xl flex items-center gap-2 transform hover:scale-105 active:scale-95"
            >
              <span className="text-xl">🎲</span>
              <span>Surprise Me!</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-lg font-semibold text-gray-300 animate-pulse">
              Curating {activeMood.label} Movies...
            </h2>
          </div>
        )}

        {/* API Error State */}
        {!loading && error && (
          <div className="bg-red-950/60 border border-red-800 rounded-2xl p-8 text-center max-w-md mx-auto my-8">
            <span className="text-4xl block mb-3">⚠️</span>
            <h3 className="text-xl font-bold text-red-400 mb-2">
              Unable to load recommendations
            </h3>
            <p className="text-red-300 text-sm mb-5">{error}</p>
            <button
              type="button"
              onClick={() => setPage(1)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer shadow"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && movies.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center max-w-md mx-auto my-8">
            <span className="text-5xl block mb-4">🎬</span>
            <h3 className="text-2xl font-bold text-white mb-2">
              No recommendations found
            </h3>
            <p className="text-gray-400 mb-6">
              Could not find movies matching this mood right now.
            </p>
            <button
              type="button"
              onClick={() => handleMoodSelect("happy")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer"
            >
              Explore Happy Movies
            </button>
          </div>
        )}

        {/* Recommended Movies Grid */}
        {!loading && !error && movies.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && movies.length > 0 && (
          <div className="flex justify-center items-center mt-12 gap-4">
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
                  ? "bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow"
              }`}
            >
              ⬅️ Previous
            </button>

            <span className="font-semibold text-gray-300 px-4 py-2 bg-gray-900 rounded-xl border border-gray-800">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                if (page < totalPages) {
                  setPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className={`px-5 py-2.5 rounded-xl font-semibold transition cursor-pointer ${
                page >= totalPages
                  ? "bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow"
              }`}
            >
              Next ➡️
            </button>
          </div>
        )}

        {/* Surprise Me Modal */}
        {showSurpriseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowSurpriseModal(false)}
                className="absolute top-4 right-4 z-20 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white p-2 rounded-full transition cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>

              {isSurpriseLoading ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-14 h-14 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xl font-bold text-white">
                    Rolling the dice... 🎲
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Finding your mystery recommendation
                  </p>
                </div>
              ) : surpriseMovie ? (
                <div>
                  <div className="relative h-64 bg-gray-800 overflow-hidden">
                    {surpriseMovie.backdrop_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w780/${surpriseMovie.backdrop_path}`}
                        alt={surpriseMovie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        🎬
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 bg-pink-600 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
                      ✨ Surprise Pick
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-white truncate">
                        {surpriseMovie.title}
                      </h3>
                      <span className="bg-yellow-400 text-gray-950 font-bold px-2.5 py-0.5 rounded text-sm flex-shrink-0">
                        ⭐ {Number(surpriseMovie.vote_average || 0).toFixed(1)}
                      </span>
                    </div>

                    <p className="text-gray-400 text-xs mb-3">
                      📅 {surpriseMovie.release_date || "Unknown Release Date"}
                    </p>

                    <p className="text-gray-300 text-sm line-clamp-3 mb-6">
                      {surpriseMovie.overview || "No overview available for this movie."}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        to={`/movie-details/${surpriseMovie.id}`}
                        onClick={() => setShowSurpriseModal(false)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-center transition shadow"
                      >
                        View Full Details ➡️
                      </Link>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => toggleFav(surpriseMovie)}
                          title={isFav(surpriseMovie.id) ? "Remove from Favourites" : "Add to Favourites"}
                          className={`p-3 rounded-xl border font-bold transition cursor-pointer flex items-center justify-center flex-1 sm:flex-none ${
                            isFav(surpriseMovie.id)
                              ? "bg-red-600 text-white border-red-500"
                              : "bg-gray-800 text-white border-gray-700 hover:border-red-500"
                          }`}
                        >
                          {isFav(surpriseMovie.id) ? "❤️" : "🤍"}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleWatchlist(surpriseMovie)}
                          title={isInWatchlist(surpriseMovie.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                          className={`p-3 rounded-xl border font-bold transition cursor-pointer flex items-center justify-center flex-1 sm:flex-none ${
                            isInWatchlist(surpriseMovie.id)
                              ? "bg-blue-600 text-white border-blue-500"
                              : "bg-gray-800 text-white border-gray-700 hover:border-blue-500"
                          }`}
                        >
                          {isInWatchlist(surpriseMovie.id) ? "🔖" : "📑"}
                        </button>

                        <button
                          type="button"
                          onClick={handleSurpriseMe}
                          title="Roll again for another movie"
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold p-3 rounded-xl transition cursor-pointer flex items-center justify-center"
                        >
                          🎲
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-300 mb-4">No surprise movie found.</p>
                  <button
                    type="button"
                    onClick={handleSurpriseMe}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MoodRecommendations;

