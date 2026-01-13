// app/movies/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MovieCard from '../../components/MovieCard';

interface Movie {
  id: number;
  name: string;
  year: number;
  genre: string;
  myRating: number;
  review: string;
}

const MoviesPage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/movies?search=${searchTerm}`);
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
  }, [searchTerm]);

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Movies</h1>
        <Link href="/movies/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New Movie
        </Link>
      </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for a movie..."
          className="w-full p-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
