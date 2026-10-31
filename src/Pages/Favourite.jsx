import { Link } from "react-router-dom";
import { useMovieContext } from "../context/MovieContext";
import MovieCard from "../components/MovieCard";

function Favourite() {
  const { favourites } = useMovieContext();

  if (favourites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-gray-200 max-w-md">
          <span className="text-6xl block mb-4">❤️</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Favourite Movies Yet
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            You haven't added any movies to your favourites yet. Click the ❤️ icon on any movie to save it!
          </p>
          <Link
            to="/movies"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow"
          >
            Explore Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Favourite Movies
          </h1>
          <p className="text-gray-600 mt-2">
            {favourites.length} {favourites.length === 1 ? "movie" : "movies"} in your collection
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {favourites.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Favourite;
