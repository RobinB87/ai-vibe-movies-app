"use client";

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from "react";
import { Movie } from "@/types/movie";
import { User } from "@/types/user";

interface MovieContextType {
  user: User | null;
  setUser: (user: User | null) => void;

  movies: Movie[];
  setMovies: (movies: Movie[]) => void;
 
  addMovie: (movie: Movie) => void;
  updateMovie: (movie: Movie) => void;
  removeMovie: (id: number) => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const currentUser = await res.json();
        setUser(currentUser);
  }}
fetchCurrentUser();
}, [

  ]);


  const addMovie = (newMovie: Movie) => {
    setMovies((prevMovies) => [...prevMovies, newMovie]);
  };

  const updateMovie = (updatedMovie: Movie) => {
    setMovies((prevMovies) => prevMovies.map((movie) => (movie.id === updatedMovie.id ? updatedMovie : movie)));
  };

  const removeMovie = (id: number) => {
    setMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== id));
  };

  const value = {
    user,
    setUser,
    
    movies,
    setMovies,

    addMovie,
    updateMovie,
    removeMovie,
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error("useMovies must be used within a MovieProvider");
  }
  return context;
};
