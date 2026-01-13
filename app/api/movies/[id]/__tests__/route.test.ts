import { GET, PUT, DELETE } from '../route';
import prisma from '@/lib/prisma';

// Mock the prisma instance
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    movie: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Movie by ID API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/movies/[id]', () => {
    it('should return a movie if found', async () => {
      const mockMovie = { id: 1, name: 'Movie 1', year: 2020, genre: 'Action', myRating: 5, review: 'Great' };
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);

      const response = await GET({} as Request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMovie);
      expect(prisma.movie.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 404 if movie not found', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await GET({} as Request, { params: { id: '99' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Movie not found' });
    });
  });

  describe('PUT /api/movies/[id]', () => {
    it('should update an existing movie', async () => {
      const updatedMovieData = { name: 'Updated Movie', year: 2022, genre: 'Sci-Fi', myRating: 4, review: 'Good', isOnWatchlist: true };
      const existingMovie = { id: 1, name: 'Movie 1', year: 2020, genre: 'Action', myRating: 5, review: 'Great', isOnWatchlist: undefined };
      const updatedMovie = { id: 1, ...updatedMovieData };
      
      // Mock findUnique to simulate movie existing for the update operation
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(existingMovie);
      (prisma.movie.update as jest.Mock).mockResolvedValue(updatedMovie);

      const mockRequest = {
        json: async () => updatedMovieData,
      } as Request;

      const response = await PUT(mockRequest, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedMovie);
      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updatedMovieData,
      });
    });

    it('should update an existing movie without changing isOnWatchlist if not provided', async () => {
      const updatedMovieData = { name: 'Updated Movie Only Name', year: 2022, genre: 'Sci-Fi', myRating: 4, review: 'Good' };
      const existingMovie = { id: 2, name: 'Movie 2', year: 2021, genre: 'Comedy', myRating: 3, review: 'Funny', isOnWatchlist: true };
      const updatedMovie = { ...existingMovie, ...updatedMovieData };
      
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(existingMovie);
      (prisma.movie.update as jest.Mock).mockResolvedValue(updatedMovie);

      const mockRequest = {
        json: async () => updatedMovieData,
      } as Request;

      const response = await PUT(mockRequest, { params: { id: '2' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedMovie);
      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: updatedMovieData,
      });
    });

    it('should update an existing movie without myRating and review properties', async () => {
      const updatedMovieData = { name: 'Updated Movie No Rating/Review', year: 2023, genre: 'Fantasy', isOnWatchlist: true };
      const existingMovie = { id: 3, name: 'Movie with Rating/Review', year: 2020, genre: 'Drama', myRating: 8, review: 'Very good', isOnWatchlist: false };
      const updatedMovie = { ...existingMovie, ...updatedMovieData, myRating: null, review: null };
      
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(existingMovie);
      (prisma.movie.update as jest.Mock).mockResolvedValue(updatedMovie);

      const mockRequest = {
        json: async () => updatedMovieData,
      } as Request;

      const response = await PUT(mockRequest, { params: { id: '3' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedMovie);
      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: updatedMovieData,
      });
    });

    it('should return 404 if movie to update is not found', async () => {
      const updatedMovieData = { name: 'Updated Movie', year: 2022, genre: 'Sci-Fi', myRating: 4, review: 'Good' };
      (prisma.movie.update as jest.Mock).mockRejectedValue(new Error('Movie not found'));

      const mockRequest = {
        json: async () => updatedMovieData,
      } as Request;

      const response = await PUT(mockRequest, { params: { id: '99' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Movie not found or update failed' });
    });
  });

  describe('DELETE /api/movies/[id]', () => {
    it('should delete a movie', async () => {
      (prisma.movie.delete as jest.Mock).mockResolvedValue({});

      const response = await DELETE({} as Request, { params: { id: '1' } });

      expect(response.status).toBe(204);
      expect(prisma.movie.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 404 if movie to delete is not found', async () => {
      (prisma.movie.delete as jest.Mock).mockRejectedValue(new Error('Movie not.\nFound'));

      const response = await DELETE({} as Request, { params: { id: '99' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Movie not found or deletion failed' });
    });
  });
});
