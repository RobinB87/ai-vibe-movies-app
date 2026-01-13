import { GET, POST } from '../route';
import prisma from '@/lib/prisma';

// Mock the prisma instance
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    movie: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Movies API', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/movies', () => {
    it('should return all movies', async () => {
      const mockMovies = [
        { id: 1, name: 'Movie 1', year: 2020, genre: 'Action', myRating: 5, review: 'Great' },
        { id: 2, name: 'Movie 2', year: 2021, genre: 'Comedy', myRating: 4, review: 'Funny' },
      ];
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      // Pass a mock Request object
      const request = new Request('http://localhost:3000/api/movies');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMovies);
      expect(prisma.movie.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.movie.findMany).toHaveBeenCalledWith();
    });

    it('should return movies matching the search term in name', async () => {
      const mockMovies = [
        { id: 1, name: 'Movie A', year: 2020, genre: 'Action', myRating: 5, review: 'Great' },
      ];
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const request = new Request('http://localhost:3000/api/movies?search=Movie A');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMovies);
      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Movie A', mode: 'insensitive' } },
            { genre: { contains: 'Movie A', mode: 'insensitive' } },
            { review: { contains: 'Movie A', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should return movies matching the search term in genre', async () => {
      const mockMovies = [
        { id: 2, name: 'Film B', year: 2021, genre: 'Comedy', myRating: 4, review: 'Funny' },
      ];
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const request = new Request('http://localhost:3000/api/movies?search=Comedy');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMovies);
      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Comedy', mode: 'insensitive' } },
            { genre: { contains: 'Comedy', mode: 'insensitive' } },
            { review: { contains: 'Comedy', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should return movies matching the search term in review', async () => {
      const mockMovies = [
        { id: 3, name: 'Movie C', year: 2022, genre: 'Thriller', myRating: 3, review: 'Intense plot' },
      ];
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const request = new Request('http://localhost:3000/api/movies?search=Intense');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMovies);
      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Intense', mode: 'insensitive' } },
            { genre: { contains: 'Intense', mode: 'insensitive' } },
            { review: { contains: 'Intense', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should return an empty array if no movies match the search term', async () => {
      (prisma.movie.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request('http://localhost:3000/api/movies?search=NonExistent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'NonExistent', mode: 'insensitive' } },
            { genre: { contains: 'NonExistent', mode: 'insensitive' } },
            { review: { contains: 'NonExistent', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should return all movies if search term is empty', async () => {
      const mockMovies = [
        { id: 1, name: 'Movie 1', year: 2020, genre: 'Action', myRating: 5, review: 'Great' },
        { id: 2, name: 'Movie 2', year: 2021, genre: 'Comedy', myRating: 4, review: 'Funny' },
      ];
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

      const request = new Request('http://localhost:3000/api/movies?search='); // Empty search term
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMovies);
      expect(prisma.movie.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.movie.findMany).toHaveBeenCalledWith(); // Should call without a where clause
    });
  });

  describe('POST /api/movies', () => {
    it('should create a new movie', async () => {
      const newMovieData = { name: 'New Movie', year: 2023, genre: 'Drama', myRating: 3, review: 'Good' };
      const createdMovie = { id: 3, ...newMovieData };
      (prisma.movie.create as jest.Mock).mockResolvedValue(createdMovie);

      const mockRequest = {
        json: async () => newMovieData,
      } as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdMovie);
      expect(prisma.movie.create).toHaveBeenCalledWith({ data: newMovieData });
      expect(prisma.movie.create).toHaveBeenCalledTimes(1);
    });

    it('should return an error if movie creation fails', async () => {
      const newMovieData = { name: 'New Movie', year: 2023, genre: 'Drama', myRating: 3, review: 'Good' };
      (prisma.movie.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      const mockRequest = {
        json: async () => newMovieData,
      } as Request;

      // Note: The actual API route currently doesn't handle errors from prisma.movie.create
      // It will just throw, which Jest will catch. To test a specific error response,
      // the API route would need explicit try-catch blocks and NextResponse.json({ error: ... }, { status: ... })
      await expect(POST(mockRequest)).rejects.toThrow('Creation failed');
    });
  });
});
