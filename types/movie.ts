export interface Movie {
  id?: number;
  name: string;
  year: number;
  genre: string;
  rating?: number;
  review?: string;
  isOnWatchlist?: boolean;
  createdByUserId?: number;
}