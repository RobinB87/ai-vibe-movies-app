// movies-app/app/movies/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MovieForm from '../../../../components/MovieForm';

interface Movie {
  id: number;
  name: string;
  year: number;
  genre: string;
  myRating: number;
  review: string;
}

const EditMoviePage = () => {
  const params = useParams();
  const { id } = params;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchMovie = async () => {
        try {
          const res = await fetch(`/api/movies/${id}`);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          setMovie(data);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      };
      fetchMovie();
    }
  }, [id]);

  if (loading) return <div className="p-8">Loading movie...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!movie) return <div className="p-8">Movie not found.</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Movie</h1>
      <MovieForm initialMovie={movie} />
    </div>
  );
};

export default EditMoviePage;
