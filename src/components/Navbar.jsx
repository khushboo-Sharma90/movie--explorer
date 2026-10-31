import { Link, NavLink } from "react-router-dom";
import { useMovieContext } from "../context/MovieContext";

function Navbar() {
  const { favouritesCount, watchlistCount } = useMovieContext();

  const navLinkClasses = ({ isActive }) =>
    `font-semibold transition duration-150 px-2.5 sm:px-3 py-1.5 rounded-md text-sm sm:text-base flex items-center gap-1.5 ${
      isActive
        ? "text-blue-400 bg-gray-800"
        : "text-gray-300 hover:text-blue-400 hover:bg-gray-850"
    }`;

  return (
    <nav className="bg-black text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold text-blue-500 hover:text-blue-400 transition flex items-center gap-2"
          >
            <span>🎬</span>
            <span className="hidden xs:inline">Movie Explorer</span>
          </Link>

          <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto">
            <NavLink to="/" className={navLinkClasses}>
              Home
            </NavLink>
            <NavLink to="/movies" className={navLinkClasses}>
              Movies
            </NavLink>
            <NavLink to="/mood" className={navLinkClasses}>
              <span>✨ Moods</span>
            </NavLink>
            <NavLink to="/watchlist" className={navLinkClasses}>
              <span>Watchlist</span>
              {watchlistCount > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                  {watchlistCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/fav" className={navLinkClasses}>
              <span>Favourites</span>
              {favouritesCount > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                  {favouritesCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
