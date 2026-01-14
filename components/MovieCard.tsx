// movies-app/components/MovieCard.tsx
import Link from 'next/link';

import { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <Link href={`/movies/${movie.id}/edit`} passHref>
      <div className="border p-4 rounded-lg shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer">
        <h2 className="text-xl font-bold flex items-center">
          {movie.name} ({movie.year})
          {movie.isOnWatchlist && (
            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Watchlist</span>
          )}
        </h2>
        <p><strong>Genre:</strong> {movie.genre}</p>
        {movie.rating !== undefined && movie.rating !== null && <p><strong>Rating:</strong> {movie.rating}/10</p>}
        {movie.review && <p><strong>Review:</strong> {movie.review}</p>}
      </div>
    </Link>
  );
};

export default MovieCard;
