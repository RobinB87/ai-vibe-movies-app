'use client';

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { Movie } from '@/types/movie';
import useDebounce from '@/lib/hooks/useDebounce';

interface MovieContextType {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showWatchlistOnly: boolean;
  setShowWatchlistOnly: (show: boolean) => void;
  addMovie: (movie: Movie) => void;
  updateMovie: (movie: Movie) => void;
  removeMovie: (id: number) => void;
  fetchMovies: () => Promise<void>;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState<boolean>(false);

  const fetchMovies = useCallback(async () => {
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
  }, [debouncedSearchTerm, showWatchlistOnly]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const addMovie = (newMovie: Movie) => {
    setMovies((prevMovies) => [...prevMovies, newMovie]);
  };

  const updateMovie = (updatedMovie: Movie) => {
    setMovies((prevMovies) =>
      prevMovies.map((movie) => (movie.id === updatedMovie.id ? updatedMovie : movie))
    );
  };

  const removeMovie = (id: number) => {
    setMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== id));
  };

  const value = {
    movies,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    showWatchlistOnly,
    setShowWatchlistOnly,
    addMovie,
    updateMovie,
    removeMovie,
    fetchMovies,
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};
