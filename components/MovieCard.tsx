// movies-app/components/MovieCard.tsx
import Link from 'next/link';

interface MovieCardProps {
  movie: {
    id: number;
    name: string;
    year: number;
    genre: string;
    myRating: number;
    review: string;
  };
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold">{movie.name} ({movie.year})</h2>
      <p><strong>Genre:</strong> {movie.genre}</p>
      <p><strong>My Rating:</strong> {movie.myRating}/10</p>
      <p><strong>Review:</strong> {movie.review}</p>
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
