// movies-app/components/MovieCard.tsx
import Link from 'next/link';

import { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold flex items-center">
        {movie.name} ({movie.year})
        {movie.isOnWatchlist && (
          <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Watchlist</span>
        )}
      </h2>
      <p><strong>Genre:</strong> {movie.genre}</p>
      {movie.myRating && <p><strong>My Rating:</strong> {movie.myRating}/10</p>}
      {movie.review && <p><strong>Review:</strong> {movie.review}</p>}
      <div className="mt-4">
        <Link href={`/movies/${movie.id}/edit`} className="text-blue-500 hover:underline mr-4">
          Edit
        </Link>
        {/* Add delete functionality later if needed */}
      </div>
    </div>
  );
};

export default MovieCard;
