export interface UserMoviePreference {
  id: number;
  userId: number;
  movieId: number;
  rating?: number;
  review?: string;
  isOnWatchlist?: boolean;
  createdAt: Date;
  updatedAt: Date;
}