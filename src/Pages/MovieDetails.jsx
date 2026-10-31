import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovieDetails } from "../services/apiService";
import { useMovieContext } from "../context/MovieContext";
import MovieCard from "../components/MovieCard";

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const similarScrollRef = useRef(null);

  const { isFav, toggleFav, isInWatchlist, toggleWatchlist } = useMovieContext();

  useEffect(() => {
    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
    });

    getMovieDetails(id)
      .then((data) => {
        if (isMounted) {
          setMovie(data);
          setLoading(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch movie details:", err);
          setError("Failed to load movie details. Please check your network or try again.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const scrollSimilar = (direction) => {
    if (similarScrollRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      similarScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-300 animate-pulse">
          Loading Movie Details...
        </h2>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 text-white">
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8 max-w-md text-center">
          <span className="text-5xl block mb-3">⚠️</span>
          <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
          <p className="text-gray-400 mb-6">
            {error || "Could not find details for this movie."}
          </p>
          <Link
            to="/movies"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow"
          >
            ⬅️ Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const fav = isFav(movie.id);
  const inWatchlist = isInWatchlist(movie.id);

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original/${movie.backdrop_path}`
    : null;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
    : "https://via.placeholder.com/400x600?text=No+Poster";

  const rating =
    movie.vote_average != null
      ? Number(movie.vote_average).toFixed(1)
      : "N/A";

  const releaseYear = movie.release_date
    ? movie.release_date.split("-")[0]
    : null;

  const formatRuntime = (mins) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // Find Director from crew
  const director = movie.credits?.crew?.find(
    (c) => c.job === "Director" || c.department === "Directing"
  )?.name;

  // Extract top cast members (up to 10)
  const cast = Array.isArray(movie.credits?.cast)
    ? movie.credits.cast.slice(0, 10)
    : [];

  // Extract official trailer or any YouTube trailer
  const videos = Array.isArray(movie.videos?.results)
    ? movie.videos.results
    : [];
  const trailer =
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    videos.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
    videos.find((v) => v.site === "YouTube");

  // Similar movies list (up to 10)
  const similarMovies = Array.isArray(movie.similar?.results)
    ? movie.similar.results.slice(0, 10)
    : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Backdrop Banner */}
      <div className="relative w-full min-h-[500px] lg:min-h-[600px] overflow-hidden">
        {backdropUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-xs scale-105"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          {/* Back button */}
          <div className="mb-6">
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white bg-gray-900/80 hover:bg-gray-800 px-4 py-2 rounded-xl text-sm font-medium transition backdrop-blur-sm shadow border border-gray-700/50"
            >
              ⬅️ Back to Movies
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start">
            {/* Poster Card */}
            <div className="w-64 sm:w-72 lg:w-80 flex-shrink-0">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-700/60 bg-gray-900">
                <img
                  src={posterUrl}
                  alt={movie.title || "Movie poster"}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/400x600?text=No+Poster";
                  }}
                />
              </div>
            </div>

            {/* Movie Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  {movie.title}
                </h1>
                {releaseYear && (
                  <span className="text-2xl text-gray-400 font-normal">
                    ({releaseYear})
                  </span>
                )}
              </div>

              {movie.tagline && (
                <p className="text-blue-400 italic text-base sm:text-lg mb-4">
                  "{movie.tagline}"
                </p>
              )}

              {/* Badges: Rating, Runtime, Director */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-5">
                <span className="bg-yellow-400 text-gray-950 font-bold px-3 py-1 rounded-lg text-sm flex items-center gap-1 shadow">
                  ⭐ {rating} / 10
                  {movie.vote_count ? ` (${movie.vote_count.toLocaleString()} votes)` : ""}
                </span>

                {movie.runtime > 0 && (
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg text-sm font-medium border border-gray-700">
                    ⏱️ {formatRuntime(movie.runtime)}
                  </span>
                )}

                {director && (
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg text-sm font-medium border border-gray-700">
                    🎬 Dir: {director}
                  </span>
                )}

                {movie.status && (
                  <span className="bg-gray-800/80 text-gray-400 px-3 py-1 rounded-lg text-xs font-medium border border-gray-700/60">
                    {movie.status}
                  </span>
                )}
              </div>

              {/* Genre chips */}
              {Array.isArray(movie.genres) && movie.genres.length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                  {movie.genres.map((g) => (
                    <span
                      key={g.id}
                      className="bg-blue-600/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/40"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-200 uppercase tracking-wider mb-2">
                  Overview
                </h2>
                <p className="text-gray-300 text-base leading-relaxed max-w-3xl">
                  {movie.overview || "No overview available for this movie."}
                </p>
              </div>

              {/* Action Buttons: Favourites, Watchlist & Trailer Link */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <button
                  type="button"
                  onClick={() => toggleFav(movie)}
                  className={`py-3 px-6 rounded-xl font-bold text-base transition cursor-pointer flex items-center gap-2 shadow-lg ${
                    fav
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-800 hover:bg-red-950/60 text-white border border-gray-700 hover:border-red-500"
                  }`}
                >
                  <span>{fav ? "❤️" : "🤍"}</span>
                  <span>{fav ? "In Favourites" : "Add to Favourites"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWatchlist(movie)}
                  className={`py-3 px-6 rounded-xl font-bold text-base transition cursor-pointer flex items-center gap-2 shadow-lg ${
                    inWatchlist
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-800 hover:bg-blue-950/60 text-white border border-gray-700 hover:border-blue-500"
                  }`}
                >
                  <span>{inWatchlist ? "🔖" : "📑"}</span>
                  <span>{inWatchlist ? "In Watchlist" : "Add to Watchlist"}</span>
                </button>

                {trailer && (
                  <a
                    href="#trailer-section"
                    className="py-3 px-6 rounded-xl font-bold text-base bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-2 shadow-lg"
                  >
                    <span>▶️</span>
                    <span>Watch Trailer</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {/* YouTube Trailer Section */}
        <section id="trailer-section" className="scroll-mt-20">
          <div className="border-b border-gray-800 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🎬</span> Official Trailer
            </h2>
          </div>

          {trailer ? (
            <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 p-2 sm:p-4 shadow-2xl">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
                  title={trailer.name || `${movie.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
              <div className="mt-3 px-2 flex justify-between items-center text-sm text-gray-400">
                <span className="font-medium text-gray-200 truncate">
                  {trailer.name}
                </span>
                <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-xs px-2.5 py-0.5 rounded-full">
                  YouTube
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
              <span className="text-4xl block mb-2">🎞️</span>
              <p className="text-lg font-medium">
                No official trailer available on YouTube for this title.
              </p>
            </div>
          )}
        </section>

        {/* Cast & Crew Section */}
        <section>
          <div className="border-b border-gray-800 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🎭</span> Top Cast
            </h2>
          </div>

          {cast.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {cast.map((actor) => {
                const profileImg = actor.profile_path
                  ? `https://image.tmdb.org/t/p/w185/${actor.profile_path}`
                  : null;

                return (
                  <div
                    key={actor.id}
                    className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition shadow flex flex-col"
                  >
                    <div className="w-full h-48 bg-gray-800 flex items-center justify-center overflow-hidden">
                      {profileImg ? (
                        <img
                          src={profileImg}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/185x278?text=No+Photo";
                          }}
                        />
                      ) : (
                        <span className="text-4xl text-gray-600">👤</span>
                      )}
                    </div>
                    <div className="p-3 text-left">
                      <p className="font-semibold text-white text-sm truncate">
                        {actor.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {actor.character || "Cast"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">No cast information available.</p>
          )}
        </section>

        {/* Similar Movies Carousel */}
        <section>
          <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🍿</span> More Like This
            </h2>

            {similarMovies.length > 3 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => scrollSimilar("left")}
                  title="Scroll left"
                  aria-label="Scroll left"
                  className="bg-gray-800 hover:bg-gray-700 text-white w-9 h-9 rounded-full flex items-center justify-center transition border border-gray-700 cursor-pointer"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() => scrollSimilar("right")}
                  title="Scroll right"
                  aria-label="Scroll right"
                  className="bg-gray-800 hover:bg-gray-700 text-white w-9 h-9 rounded-full flex items-center justify-center transition border border-gray-700 cursor-pointer"
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          {similarMovies.length > 0 ? (
            <div
              ref={similarScrollRef}
              className="flex gap-5 overflow-x-auto scroll-smooth pb-4 scrollbar-none snap-x"
              style={{ scrollbarWidth: "thin" }}
            >
              {similarMovies.map((similar) => (
                <div
                  key={similar.id}
                  className="w-56 sm:w-64 flex-shrink-0 snap-start"
                >
                  <MovieCard movie={similar} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No similar movies recommendations available.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default MovieDetails;
