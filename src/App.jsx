import Home from "./Pages/Home";
import Movies from "./Pages/Movies";
import MovieDetails from "./Pages/MovieDetails";
import Favourite from "./Pages/Favourite";
import Watchlist from "./Pages/Watchlist";
import MoodRecommendations from "./Pages/MoodRecommendations";
import Error from "./Pages/Error";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import { MovieProvider } from "./context/MovieContext";

const App = () => {
  return (
    <MovieProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/mood" element={<MoodRecommendations />} />
          <Route path="/movie-details/:id" element={<MovieDetails />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/fav" element={<Favourite />} />
          <Route path="*" element={<Error />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </BrowserRouter>
    </MovieProvider>
  );
};

export default App;
