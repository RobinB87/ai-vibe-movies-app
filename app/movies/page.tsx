"use client";

import Link from "next/link";
import MovieCard from "../../components/MovieCard";
import { useMovies } from "@/app/context/MovieContext";
import { LogOutButton } from "../auth/components/LogOutButton";

const MoviesPage = () => {
  const { movies, loading, error, searchTerm, setSearchTerm, showWatchlistOnly, setShowWatchlistOnly, currentUser } =
    useMovies();

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold flex-1">Movies {currentUser?.name && `for ${currentUser?.name}`}</h1>
        <Link href="/movies/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New Movie
        </Link>
        <LogOutButton />
      </div>
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search for a movie..."
          className="flex-grow p-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
          className={`px-4 py-2 rounded ${
            showWatchlistOnly ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"
          } hover:bg-indigo-700 hover:text-white transition-colors duration-200`}
        >
          {showWatchlistOnly ? "Show All Movies" : "Show Watchlist"}
        </button>
      </div>
      {loading ? (
        <div className="p-8">Loading movies...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
