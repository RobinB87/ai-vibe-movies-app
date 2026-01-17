import { GET, POST } from "../route";
import prisma from "@/lib/prisma";
import { getUserFromSession } from "@/app/api/auth/core/session";

// Mock the prisma instance
const mockMovieUpsert = jest.fn();
const mockUserMoviePreferenceUpsert = jest.fn();

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    movie: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    userMoviePreference: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn((callback) =>
      callback({
        movie: { upsert: mockMovieUpsert },
        userMoviePreference: { upsert: mockUserMoviePreferenceUpsert },
      })
    ),
  },
}));

// Mock the session
jest.mock("@/app/api/auth/core/session", () => ({
  getUserFromSession: jest.fn(),
}));

describe("Movies API", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockMovieUpsert.mockClear();
    mockUserMoviePreferenceUpsert.mockClear();
    (getUserFromSession as jest.Mock).mockResolvedValue({ id: "1", role: "user" });
  });

  describe("GET /api/movies", () => {
    it("should return movies where the current user has a preference", async () => {
      const mockMoviesFromDb = [
        {
          id: 1,
          name: "Movie 1",
          year: 2020,
          genre: "Action",
          userMoviePreferences: [{ rating: 5, review: "Great", isOnWatchlist: true }],
        },
        {
          id: 2,
          name: "Movie 2",
          year: 2021,
          genre: "Comedy",
          userMoviePreferences: [{ rating: 4, review: "Funny", isOnWatchlist: false }],
        },
      ];
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMoviesFromDb);

      const request = new Request("http://localhost:3000/api/movies");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([
        { id: 1, name: "Movie 1", year: 2020, genre: "Action", rating: 5, review: "Great", isOnWatchlist: true },
        { id: 2, name: "Movie 2", year: 2021, genre: "Comedy", rating: 4, review: "Funny", isOnWatchlist: false },
      ]);
      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: { userMoviePreferences: { some: { userId: 1 } } },
        include: {
          userMoviePreferences: {
            where: { userId: 1 },
            select: { rating: true, review: true, isOnWatchlist: true },
          },
        },
      });
    });

    it("should return movies matching the search term", async () => {
      const mockMoviesFromDb = [
        {
          id: 1,
          name: "Movie A",
          year: 2020,
          genre: "Action",
          userMoviePreferences: [{ rating: 5, review: "Great", isOnWatchlist: false }],
        },
      ];
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMoviesFromDb);

      const request = new Request("http://localhost:3000/api/movies?search=Movie A");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([
        { id: 1, name: "Movie A", year: 2020, genre: "Action", rating: 5, review: "Great", isOnWatchlist: false },
      ]);
      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: {
          userMoviePreferences: { some: { userId: 1 } },
          OR: [
            { name: { contains: "Movie A", mode: "insensitive" } },
            { genre: { contains: "Movie A", mode: "insensitive" } },
          ],
        },
        include: {
          userMoviePreferences: {
            where: { userId: 1 },
            select: { rating: true, review: true, isOnWatchlist: true },
          },
        },
      });
    });

    it("should return an empty array if no movies match the search term", async () => {
      (prisma.movie.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request("http://localhost:3000/api/movies?search=NonExistent");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("should return only movies on the watchlist for current user if watchlist=true", async () => {
      const mockMoviesFromDb = [
        {
          id: 1,
          name: "Watchlist Movie 1",
          year: 2020,
          genre: "Action",
          userMoviePreferences: [{ rating: 5, review: "Great", isOnWatchlist: true }],
        },
      ];
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMoviesFromDb);

      const request = new Request("http://localhost:3000/api/movies?watchlist=true");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([
        { id: 1, name: "Watchlist Movie 1", year: 2020, genre: "Action", rating: 5, review: "Great", isOnWatchlist: true },
      ]);
      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: {
          userMoviePreferences: {
            some: {
              userId: 1,
              isOnWatchlist: true,
            },
          },
        },
        include: {
          userMoviePreferences: {
            where: { userId: 1 },
            select: { rating: true, review: true, isOnWatchlist: true },
          },
        },
      });
    });

    it("should return empty array when not logged in", async () => {
      (getUserFromSession as jest.Mock).mockResolvedValue(null);

      const request = new Request("http://localhost:3000/api/movies");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
      expect(prisma.movie.findMany).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/movies", () => {
    it("should find or create movie and upsert user preference", async () => {
      const newMovieData = {
        name: "Watchlist Movie",
        year: 2024,
        genre: "Sci-Fi",
        rating: 4.5,
        review: "Intriguing",
        isOnWatchlist: true,
        createdByUserId: 1,
      };
      const movie = { id: 4, name: "Watchlist Movie", year: 2024, genre: "Sci-Fi", createdByUserId: 1 };
      mockMovieUpsert.mockResolvedValue(movie);

      const mockRequest = {
        json: async () => newMovieData,
      } as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({
        ...movie,
        rating: 4.5,
        review: "Intriguing",
        isOnWatchlist: true,
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockMovieUpsert).toHaveBeenCalledWith({
        where: { name_year: { name: "Watchlist Movie", year: 2024 } },
        update: {},
        create: {
          name: "Watchlist Movie",
          year: 2024,
          genre: "Sci-Fi",
          createdByUserId: 1,
        },
      });
      expect(mockUserMoviePreferenceUpsert).toHaveBeenCalledWith({
        where: { userId_movieId: { userId: 1, movieId: 4 } },
        update: {
          rating: 4.5,
          review: "Intriguing",
          isOnWatchlist: true,
        },
        create: {
          userId: 1,
          movieId: 4,
          rating: 4.5,
          review: "Intriguing",
          isOnWatchlist: true,
        },
      });
    });

    it("should use existing movie and create user preference for new user", async () => {
      const newMovieData = {
        name: "Existing Movie",
        year: 2023,
        genre: "Drama",
        rating: 3,
        review: "Good",
        createdByUserId: 2,
      };
      // Movie already exists with id 10
      const existingMovie = { id: 10, name: "Existing Movie", year: 2023, genre: "Drama", createdByUserId: 1 };
      mockMovieUpsert.mockResolvedValue(existingMovie);

      const mockRequest = {
        json: async () => newMovieData,
      } as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({
        ...existingMovie,
        rating: 3,
        review: "Good",
        isOnWatchlist: false,
      });
      expect(mockUserMoviePreferenceUpsert).toHaveBeenCalledWith({
        where: { userId_movieId: { userId: 2, movieId: 10 } },
        update: {
          rating: 3,
          review: "Good",
          isOnWatchlist: false,
        },
        create: {
          userId: 2,
          movieId: 10,
          rating: 3,
          review: "Good",
          isOnWatchlist: false,
        },
      });
    });

    it("should create movie and preference with null rating/review", async () => {
      const newMovieData = {
        name: "Movie without Rating/Review",
        year: 2023,
        genre: "Fantasy",
        isOnWatchlist: true,
        createdByUserId: 1,
      };
      const movie = { id: 5, name: "Movie without Rating/Review", year: 2023, genre: "Fantasy", createdByUserId: 1 };
      mockMovieUpsert.mockResolvedValue(movie);

      const mockRequest = {
        json: async () => newMovieData,
      } as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({
        ...movie,
        rating: null,
        review: null,
        isOnWatchlist: true,
      });
      expect(mockUserMoviePreferenceUpsert).toHaveBeenCalledWith({
        where: { userId_movieId: { userId: 1, movieId: 5 } },
        update: {
          rating: null,
          review: null,
          isOnWatchlist: true,
        },
        create: {
          userId: 1,
          movieId: 5,
          rating: null,
          review: null,
          isOnWatchlist: true,
        },
      });
    });
  });
});
