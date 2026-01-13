// app/movies/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MovieCard from '../../components/MovieCard';
import { Movie } from '@/types/movie';
import useDebounce from '@/lib/hooks/useDebounce'; 

const MoviesPage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); 
  const [showWatchlistOnly, setShowWatchlistOnly] = useState<boolean>(false);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const url = new URL('/api/movies', window.location.origin);
        if (debouncedSearchTerm) {
          url.searchParams.set('search', debouncedSearchTerm);
        }
        if (showWatchlistOnly) {
          url.searchParams.set('watchlist', 'true');
        }

        const res = await fetch(url.toString());
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setMovies(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [debouncedSearchTerm, showWatchlistOnly]);

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Movies</h1>
        <Link href="/movies/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New Movie
        </Link>
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
            showWatchlistOnly ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'
          } hover:bg-indigo-700 hover:text-white transition-colors duration-200`}
        >
          {showWatchlistOnly ? 'Show All Movies' : 'Show Watchlist'}
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
