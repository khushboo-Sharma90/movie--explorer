import { Link } from "react-router-dom";
import { useMovieContext } from "../context/MovieContext";

function MovieCard({ movie }) {
  const { isFav, toggleFav, isInWatchlist, toggleWatchlist } = useMovieContext();

  if (!movie) return null;

  const fav = isFav(movie.id);
  const inWatchlist = isInWatchlist(movie.id);

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Poster";

  const rating =
    movie.vote_average != null
      ? Number(movie.vote_average).toFixed(1)
      : "N/A";

  const releaseYear = movie.release_date
    ? movie.release_date.split("-")[0]
    : null;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-xl transition duration-200 overflow-hidden relative flex flex-col justify-between group">
      {/* Top action buttons for Favourites & Watchlist */}
      <div className="absolute top-2 right-2 flex items-center space-x-1.5 z-10">
        <button
          type="button"
          onClick={() => toggleWatchlist(movie)}
          title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          aria-label={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          className="bg-black/60 hover:bg-black/85 text-white p-1.5 rounded-full transition shadow text-base cursor-pointer"
        >
          {inWatchlist ? "🔖" : "📑"}
        </button>

        <button
          type="button"
          onClick={() => toggleFav(movie)}
          title={fav ? "Remove from Favourites" : "Add to Favourites"}
          aria-label={fav ? "Remove from Favourites" : "Add to Favourites"}
          className="bg-black/60 hover:bg-black/85 text-white p-1.5 rounded-full transition shadow text-base cursor-pointer"
        >
          {fav ? "❤️" : "🤍"}
        </button>
      </div>

      <div>
        <div className="w-full h-72 bg-gray-200 overflow-hidden">
          <img
            src={posterUrl}
            alt={movie.title || "Movie poster"}
            className="w-full h-72 object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/300x450?text=No+Poster";
            }}
          />
        </div>

        <div className="p-4">
          <h3
            className="text-lg font-semibold truncate text-gray-900"
            title={movie.title}
          >
            {movie.title || "Untitled"}
          </h3>

          <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
            {releaseYear && <span>📅 {releaseYear}</span>}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 flex justify-between items-center mt-auto border-t border-gray-100">
        <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded text-sm font-bold flex items-center gap-1 shadow-sm">
          ⭐ {rating}
        </span>
        <Link
          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition flex items-center gap-1"
          to={`/movie-details/${movie.id}`}
        >
          View Details ➡️
        </Link>
      </div>
    </div>
  );
}

export default MovieCard;
