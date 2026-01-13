export interface Movie {
  id?: number;
  name: string;
  year: number;
  genre: string;
  myRating: number;
  review: string;
  isOnWatchlist?: boolean;
}
