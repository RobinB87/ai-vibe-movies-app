"use client";

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from "react";
import { Movie } from "@/types/movie";
import { User } from "@/types/user";
import useDebounce from "@/lib/hooks/useDebounce";

interface MovieContextType {
  user: User | null;
  setUser: (user: User | null) => void;

  // movies: Movie[];
  // loading: boolean;
  // error: string | null;
  // searchTerm: string;
  // setSearchTerm: (term: string) => void;
  // showWatchlistOnly: boolean;
  // setShowWatchlistOnly: (show: boolean) => void;
  // // addMovie: (movie: Movie) => void;
  // // updateMovie: (movie: Movie) => void;
  // // removeMovie: (id: number) => void;
  // // fetchMovies: () => Promise<void>;
  // setCurrentUser: (user: User | null) => void;
  // // loginUser: (email: string, password: string) => Promise<boolean>;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

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

  // const [movies, setMovies] = useState<Movie[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  // const [searchTerm, setSearchTerm] = useState<string>("");
  // const debouncedSearchTerm = useDebounce(searchTerm, 500);
  // const [showWatchlistOnly, setShowWatchlistOnly] = useState<boolean>(false);
  // const [currentUser, setCurrentUser] = useState<User | null>(null);

  // const fetchMovies = useCallback(async () => {
  //   if (!currentUser) {
  //     setMovies([]);
  //     setLoading(false);
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const url = new URL("/api/movies", window.location.origin);
  //     if (debouncedSearchTerm) {
  //       url.searchParams.set("search", debouncedSearchTerm);
  //     }
  //     if (showWatchlistOnly) {
  //       url.searchParams.set("watchlist", "true");
  //     }

  //     const res = await fetch(url.toString());
  //     if (!res.ok) {
  //       throw new Error(`HTTP error! status: ${res.status}`);
  //     }
  //     const data = await res.json();
  //     setMovies(data);
  //   } catch (e: any) {
  //     setError(e.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [debouncedSearchTerm, showWatchlistOnly, currentUser]);

  // const loginUser = useCallback(async (email: string, password: string): Promise<boolean> => {
  //   setError(null);
  //   try {
  //     const res = await fetch("/api/auth/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     if (!res.ok) {
  //       const errorData = await res.json();
  //       setError(errorData.error || "Login failed");
  //       return false;
  //     }

  //     const userData: User = await res.json();
  //     setCurrentUser(userData);
  //     return true;
  //   } catch (e: any) {
  //     setError(e.message || "Login failed due to network error");
  //     return false;
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchMovies();
  // }, [fetchMovies]);

  // Temporary auto-login for development
  // useEffect(() => {
  //   const autoLogin = async () => {
  //     if (!currentUser) {
  //       // Only attempt to login if no user is currently logged in
  //       await loginUser("test@test.com", "Bla");
  //     }
  //   };
  //   autoLogin();
  // }, [loginUser, currentUser]);

  // const addMovie = (newMovie: Movie) => {
  //   setMovies((prevMovies) => [...prevMovies, newMovie]);
  // };

  // const updateMovie = (updatedMovie: Movie) => {
  //   setMovies((prevMovies) => prevMovies.map((movie) => (movie.id === updatedMovie.id ? updatedMovie : movie)));
  // };

  // const removeMovie = (id: number) => {
  //   setMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== id));
  // };

  const value = {
    user,
    setUser
    // setUser,
    // movies,
    // loading,
    // error,
    // searchTerm,
    // setSearchTerm,
    // showWatchlistOnly,
    // setShowWatchlistOnly,
    // // addMovie,
    // // updateMovie,
    // // removeMovie,
    // // fetchMovies,
    // currentUser,
    // setCurrentUser
    // // loginUser,
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
