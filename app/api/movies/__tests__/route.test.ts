import { GET, POST } from "../route";
import prisma from "@/lib/prisma";
import { getUserFromSession } from "@/app/api/auth/core/session";

// Mock the prisma instance
const mockMovieCreate = jest.fn();
const mockUserMoviePreferenceCreate = jest.fn();

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    movie: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    userMoviePreference: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) =>
      callback({
        movie: { create: mockMovieCreate },
        userMoviePreference: { create: mockUserMoviePreferenceCreate },
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
    mockMovieCreate.mockClear();
    mockUserMoviePreferenceCreate.mockClear();
    (getUserFromSession as jest.Mock).mockResolvedValue({ id: "1", role: "user" });
  });

  describe("GET /api/movies", () => {
    it("should return only movies created by the current user with preferences", async () => {
      const mockMoviesFromDb = [
        {
          id: 1,
          name: "Movie 1",
          year: 2020,
          genre: "Action",
          createdByUserId: 1,
          userMoviePreferences: [{ rating: 5, review: "Great", isOnWatchlist: true }],
        },
        {
          id: 2,
          name: "Movie 2",
          year: 2021,
          genre: "Comedy",
          createdByUserId: 1,
          userMoviePreferences: [{ rating: 4, review: "Funny", isOnWatchlist: false }],
        },
      ];
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMoviesFromDb);

      const request = new Request("http://localhost:3000/api/movies");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([
        { id: 1, name: "Movie 1", year: 2020, genre: "Action", createdByUserId: 1, rating: 5, review: "Great", isOnWatchlist: true },
        { id: 2, name: "Movie 2", year: 2021, genre: "Comedy", createdByUserId: 1, rating: 4, review: "Funny", isOnWatchlist: false },
      ]);
      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: { createdByUserId: 1 },
        include: {
          userMoviePreferences: {
            where: { userId: 1 },
            select: { rating: true, review: true, isOnWatchlist: true },
          },
        },
      });
    });

    it("should return movies with null preferences when user has no preferences", async () => {
      const mockMoviesFromDb = [
        {
          id: 1,
          name: "Movie 1",
          year: 2020,
          genre: "Action",
          createdByUserId: 1,
          userMoviePreferences: [],
        },
      ];
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMoviesFromDb);

      const request = new Request("http://localhost:3000/api/movies");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([
        { id: 1, name: "Movie 1", year: 2020, genre: "Action", createdByUserId: 1, rating: null, review: null, isOnWatchlist: false },
      ]);
    });

    it("should return movies matching the search term in name", async () => {
      const mockMoviesFromDb = [
        {
          id: 1,
          name: "Movie A",
          year: 2020,
          genre: "Action",
          createdByUserId: 1,
          userMoviePreferences: [{ rating: 5, review: "Great", isOnWatchlist: false }],
        },
      ];
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMoviesFromDb);

      const request = new Request("http://localhost:3000/api/movies?search=Movie A");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([
        { id: 1, name: "Movie A", year: 2020, genre: "Action", createdByUserId: 1, rating: 5, review: "Great", isOnWatchlist: false },
      ]);
      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: {
          createdByUserId: 1,
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
          createdByUserId: 1,
          userMoviePreferences: [{ rating: 5, review: "Great", isOnWatchlist: true }],
        },
      ];
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMoviesFromDb);

      const request = new Request("http://localhost:3000/api/movies?watchlist=true");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([
        { id: 1, name: "Watchlist Movie 1", year: 2020, genre: "Action", createdByUserId: 1, rating: 5, review: "Great", isOnWatchlist: true },
      ]);
      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: {
          createdByUserId: 1,
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
    it("should create a new movie with isOnWatchlist property and UserMoviePreference", async () => {
      const newMovieData = {
        name: "Watchlist Movie",
        year: 2024,
        genre: "Sci-Fi",
        rating: 4.5,
        review: "Intriguing",
        isOnWatchlist: true,
        createdByUserId: 1,
      };
      const createdMovie = { id: 4, ...newMovieData };
      mockMovieCreate.mockResolvedValue(createdMovie);

      const mockRequest = {
        json: async () => newMovieData,
      } as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdMovie);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockMovieCreate).toHaveBeenCalledWith({
        data: {
          name: "Watchlist Movie",
          year: 2024,
          genre: "Sci-Fi",
          rating: 4.5,
          review: "Intriguing",
          isOnWatchlist: true,
          createdByUserId: 1,
        },
      });
      expect(mockUserMoviePreferenceCreate).toHaveBeenCalledWith({
        data: {
          userId: 1,
          movieId: 4,
          rating: 4.5,
          review: "Intriguing",
          isOnWatchlist: true,
        },
      });
    });

    it("should create a new movie without isOnWatchlist property but with rating/review creates UserMoviePreference", async () => {
      const newMovieData = {
        name: "New Movie",
        year: 2023,
        genre: "Drama",
        rating: 3,
        review: "Good",
        createdByUserId: 1,
      };
      const createdMovie = { id: 3, ...newMovieData, isOnWatchlist: null };
      mockMovieCreate.mockResolvedValue(createdMovie);

      const mockRequest = {
        json: async () => newMovieData,
      } as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdMovie);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockMovieCreate).toHaveBeenCalledTimes(1);
      expect(mockUserMoviePreferenceCreate).toHaveBeenCalledWith({
        data: {
          userId: 1,
          movieId: 3,
          rating: 3,
          review: "Good",
          isOnWatchlist: false,
        },
      });
    });

    it("should create a new movie with isOnWatchlist but without rating and review creates UserMoviePreference", async () => {
      const newMovieData = {
        name: "Movie without Rating/Review",
        year: 2023,
        genre: "Fantasy",
        isOnWatchlist: false,
        createdByUserId: 1,
      };
      const createdMovie = { id: 5, ...newMovieData, rating: null, review: null };
      mockMovieCreate.mockResolvedValue(createdMovie);

      const mockRequest = {
        json: async () => newMovieData,
      } as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdMovie);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockMovieCreate).toHaveBeenCalledTimes(1);
      expect(mockUserMoviePreferenceCreate).toHaveBeenCalledWith({
        data: {
          userId: 1,
          movieId: 5,
          rating: null,
          review: null,
          isOnWatchlist: false,
        },
      });
    });

    it("should create a movie without UserMoviePreference when no preference data provided", async () => {
      const newMovieData = {
        name: "Basic Movie",
        year: 2023,
        genre: "Action",
        createdByUserId: 1,
      };
      const createdMovie = { id: 6, ...newMovieData, rating: null, review: null, isOnWatchlist: null };
      mockMovieCreate.mockResolvedValue(createdMovie);

      const mockRequest = {
        json: async () => newMovieData,
      } as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdMovie);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockMovieCreate).toHaveBeenCalledTimes(1);
      expect(mockUserMoviePreferenceCreate).not.toHaveBeenCalled();
    });
  });
});
