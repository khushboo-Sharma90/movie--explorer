import { useState, useEffect } from "react";
import { getTrendingMovies, MOODS } from "../services/apiService";
import { Link } from "react-router-dom";
import MovieCard from "../components/MovieCard";

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getTrendingMovies()
      .then((data) => {
        if (isMounted) {
          setMovies(Array.isArray(data) ? data.slice(0, 8) : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Error fetching trending movies:", err);
          setError("Failed to load trending movies.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-950 text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-800">
          <div className="max-w-2xl">
            <span className="bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full inline-block mb-3">
              🍿 Your Ultimate Movie Hub
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Welcome To Movie Explorer
            </h1>
            <p className="mt-4 text-gray-300 text-base sm:text-lg">
              Discover today's trending cinema, search any title with advanced filters, or get instant recommendations matched to your mood.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/movies"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition shadow flex items-center gap-2"
              >
                <span>🔍</span> Explore Movies
              </Link>
              <Link
                to="/mood"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl transition shadow flex items-center gap-2"
              >
                <span>✨</span> Find by Mood
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Mood Discovery Section */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>🎭</span> Watch According to Your Mood
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Not sure what to watch? Let your emotions guide you.
              </p>
            </div>
            <Link
              to="/mood"
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition hidden sm:inline"
            >
              View All Moods ➡️
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {MOODS.map((mood) => (
              <Link
                key={mood.id}
                to="/mood"
                className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:shadow-md hover:border-blue-400 hover:scale-103 transition flex flex-col items-center justify-center group"
              >
                <span className="text-3xl mb-1.5 group-hover:scale-115 transition">
                  {mood.emoji}
                </span>
                <span className="font-bold text-xs sm:text-sm text-gray-800">
                  {mood.label.split(" ")[0]}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Movies Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>🔥</span> Trending Movies Today
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                The most watched and talked about movies right now.
              </p>
            </div>
            <Link
              to="/movies"
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition"
            >
              View All ➡️
            </Link>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-600 font-medium">Loading trending movies...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;
