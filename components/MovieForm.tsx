// movies-app/components/MovieForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Movie } from '@/types/movie';
import { useMovies } from '@/app/context/MovieContext'; 
import { defaultMovie } from '@/constants/movie';

interface MovieFormProps {
  initialMovie?: Movie;
}

const MovieForm: React.FC<MovieFormProps> = ({ initialMovie }) => {
  const router = useRouter();
  const { addMovie, updateMovie } = useMovies(); 
  const [movie, setMovie] = useState<Movie>(
    initialMovie || defaultMovie
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialMovie) {
      setMovie(initialMovie);
    }
  }, [initialMovie]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue: string | number | boolean | undefined;

    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      newValue = e.target.checked;
    } else if (name === 'year') {
      newValue = Number(value);
    } else if (name === 'myRating') {
      // If the input is empty for an optional number field, set to undefined
      newValue = value === '' ? undefined : Number(value);
    } else if (name === 'review') {
      // If the input is empty for an optional string field, set to undefined
      newValue = value === '' ? undefined : value;
    }
    else {
      newValue = value;
    }

    setMovie((prevMovie) => ({
      ...prevMovie,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const url = movie.id ? `/api/movies/${movie.id}` : '/api/movies';
    const method = movie.id ? 'PUT' : 'POST';

    try {
      // Filter out undefined values from the movie object before sending
      const movieToSubmit = Object.fromEntries(
        Object.entries(movie).filter(([, val]) => val !== undefined)
      );

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieToSubmit),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      setSuccess(movie.id ? 'Movie updated successfully!' : 'Movie added successfully!');
      
      if (movie.id) {
        updateMovie(result); 
      } else {
        addMovie(result); 
      }
      router.push('/movies'); 
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{movie.id ? 'Edit Movie' : 'Add New Movie'}</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={movie.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
          <input
            type="number"
            id="year"
            name="year"
            value={movie.year}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700">Genre</label>
          <input
            type="text"
            id="genre"
            name="genre"
            value={movie.genre}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="myRating" className="block text-sm font-medium text-gray-700">My Rating (1-10)</label>
          <input
            type="number"
            id="myRating"
            name="myRating"
            value={movie.myRating ?? ''} // Use ?? '' for optional number inputs to avoid controlled component warning
            onChange={handleChange}
            min="1"
            max="10"
            step="0.1"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="review" className="block text-sm font-medium text-gray-700">Review</label>
          <textarea
            id="review"
            name="review"
            value={movie.review ?? ''} // Use ?? '' for optional string textareas
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isOnWatchlist"
            name="isOnWatchlist"
            checked={movie.isOnWatchlist || false} // Ensure it's always a boolean for the input
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isOnWatchlist" className="ml-2 block text-sm font-medium text-gray-700">Add to Watchlist</label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (movie.id ? 'Update Movie' : 'Add Movie')}
        </button>
      </form>
    </div>
  );
};

export default MovieForm;
