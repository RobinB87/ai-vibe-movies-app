import { GET, PUT, DELETE } from "../route";
import prisma from "@/lib/prisma";

// Mock the prisma instance
const mockMovieUpdate = jest.fn();
const mockMovieDelete = jest.fn();
const mockUserMoviePreferenceUpsert = jest.fn();

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    movie: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userMoviePreference: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn((callback) =>
      callback({
        movie: { update: mockMovieUpdate, delete: mockMovieDelete },
        userMoviePreference: { upsert: mockUserMoviePreferenceUpsert },
      })
    ),
  },
}));

describe("Movie by ID API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMovieUpdate.mockClear();
    mockMovieDelete.mockClear();
    mockUserMoviePreferenceUpsert.mockClear();
  });

  describe("GET /api/movies/[id]", () => {
    it("should return a movie if found", async () => {
      const mockMovie = { id: 1, name: "Movie 1", year: 2020, genre: "Action", rating: 5, review: "Great", userId: 1 };
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);

      const response = await GET({} as Request, { params: Promise.resolve({ id: "1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMovie);
      expect(prisma.movie.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("should return 404 if movie not found", async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await GET({} as Request, { params: Promise.resolve({ id: "99" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Movie not found" });
    });
  });

  describe("PUT /api/movies/[id]", () => {
    it("should update an existing movie and upsert UserMoviePreference when userId provided", async () => {
      const updatedMovieData = {
        name: "Updated Movie",
        year: 2022,
        genre: "Sci-Fi",
        rating: 4,
        review: "Good",
        isOnWatchlist: true,
        createdByUserId: 1,
      };
      const existingMovie = {
        id: 1,
        name: "Movie 1",
        year: 2020,
        genre: "Action",
        rating: 5,
        review: "Great",
        isOnWatchlist: undefined,
      };
      const updatedMovie = { id: 1, ...updatedMovieData };

      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(existingMovie);
      mockMovieUpdate.mockResolvedValue(updatedMovie);

      const mockRequest = {
        json: async () => updatedMovieData,
      } as Request;

      const response = await PUT(mockRequest, { params: Promise.resolve({ id: "1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedMovie);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockMovieUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: "Updated Movie",
          year: 2022,
          genre: "Sci-Fi",
          rating: 4,
          review: "Good",
          isOnWatchlist: true,
        },
      });
      expect(mockUserMoviePreferenceUpsert).toHaveBeenCalledWith({
        where: { userId_movieId: { userId: 1, movieId: 1 } },
        update: { rating: 4, review: "Good", isOnWatchlist: true },
        create: { userId: 1, movieId: 1, rating: 4, review: "Good", isOnWatchlist: true },
      });
    });

    it("should update an existing movie without UserMoviePreference upsert when no userId provided", async () => {
      const updatedMovieData = {
        name: "Updated Movie Only Name",
        year: 2022,
        genre: "Sci-Fi",
        rating: 4,
        review: "Good",
      };
      const existingMovie = {
        id: 2,
        name: "Movie 2",
        year: 2021,
        genre: "Comedy",
        rating: 3,
        review: "Funny",
        isOnWatchlist: true,
      };
      const updatedMovie = { ...existingMovie, ...updatedMovieData };

      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(existingMovie);
      mockMovieUpdate.mockResolvedValue(updatedMovie);

      const mockRequest = {
        json: async () => updatedMovieData,
      } as Request;

      const response = await PUT(mockRequest, { params: Promise.resolve({ id: "2" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedMovie);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockMovieUpdate).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { name: "Updated Movie Only Name", year: 2022, genre: "Sci-Fi", rating: 4, review: "Good" },
      });
      expect(mockUserMoviePreferenceUpsert).not.toHaveBeenCalled();
    });

    it("should update an existing movie with only isOnWatchlist and upsert UserMoviePreference", async () => {
      const updatedMovieData = {
        name: "Updated Movie No Rating/Review",
        year: 2023,
        genre: "Fantasy",
        isOnWatchlist: true,
        createdByUserId: 2,
      };
      const existingMovie = {
        id: 3,
        name: "Movie with Rating/Review",
        year: 2020,
        genre: "Drama",
        rating: 8,
        review: "Very good",
        isOnWatchlist: false,
      };
      const updatedMovie = { ...existingMovie, ...updatedMovieData, rating: null, review: null };

      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(existingMovie);
      mockMovieUpdate.mockResolvedValue(updatedMovie);

      const mockRequest = {
        json: async () => updatedMovieData,
      } as Request;

      const response = await PUT(mockRequest, { params: Promise.resolve({ id: "3" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedMovie);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockMovieUpdate).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { name: "Updated Movie No Rating/Review", year: 2023, genre: "Fantasy", isOnWatchlist: true },
      });
      expect(mockUserMoviePreferenceUpsert).toHaveBeenCalledWith({
        where: { userId_movieId: { userId: 2, movieId: 3 } },
        update: { isOnWatchlist: true },
        create: { userId: 2, movieId: 3, rating: null, review: null, isOnWatchlist: true },
      });
    });

    it("should not upsert UserMoviePreference when no preference data in body", async () => {
      const updatedMovieData = {
        name: "Updated Movie Name Only",
        year: 2023,
        genre: "Action",
        createdByUserId: 1,
      };
      const existingMovie = {
        id: 4,
        name: "Old Movie",
        year: 2020,
        genre: "Drama",
        rating: null,
        review: null,
        isOnWatchlist: false,
      };
      const updatedMovie = { ...existingMovie, ...updatedMovieData };

      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(existingMovie);
      mockMovieUpdate.mockResolvedValue(updatedMovie);

      const mockRequest = {
        json: async () => updatedMovieData,
      } as Request;

      const response = await PUT(mockRequest, { params: Promise.resolve({ id: "4" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedMovie);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockMovieUpdate).toHaveBeenCalledTimes(1);
      expect(mockUserMoviePreferenceUpsert).not.toHaveBeenCalled();
    });

    it("should clear rating and review when explicitly set to null", async () => {
      const updatedMovieData = {
        name: "Movie with cleared preferences",
        year: 2023,
        genre: "Drama",
        rating: null,
        review: null,
        isOnWatchlist: false,
        createdByUserId: 1,
      };
      const existingMovie = {
        id: 5,
        name: "Movie with preferences",
        year: 2020,
        genre: "Action",
        rating: 8.5,
        review: "Amazing movie!",
        isOnWatchlist: true,
      };
      const updatedMovie = { id: 5, ...updatedMovieData };

      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(existingMovie);
      mockMovieUpdate.mockResolvedValue(updatedMovie);

      const mockRequest = {
        json: async () => updatedMovieData,
      } as Request;

      const response = await PUT(mockRequest, { params: Promise.resolve({ id: "5" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedMovie);
      expect(mockMovieUpdate).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          name: "Movie with cleared preferences",
          year: 2023,
          genre: "Drama",
          rating: null,
          review: null,
          isOnWatchlist: false,
        },
      });
      expect(mockUserMoviePreferenceUpsert).toHaveBeenCalledWith({
        where: { userId_movieId: { userId: 1, movieId: 5 } },
        update: { rating: null, review: null, isOnWatchlist: false },
        create: { userId: 1, movieId: 5, rating: null, review: null, isOnWatchlist: false },
      });
    });

    it("should return 404 if movie to update is not found", async () => {
      const updatedMovieData = { name: "Updated Movie", year: 2022, genre: "Sci-Fi", rating: 4, review: "Good" };
      mockMovieUpdate.mockRejectedValue(new Error("Movie not found"));

      const mockRequest = {
        json: async () => updatedMovieData,
      } as Request;

      const response = await PUT(mockRequest, { params: Promise.resolve({ id: "99" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Movie not found or update failed" });
    });
  });

  describe("DELETE /api/movies/[id]", () => {
    it("should delete a movie", async () => {
      (prisma.movie.delete as jest.Mock).mockResolvedValue({});

      const response = await DELETE({} as Request, { params: Promise.resolve({ id: "1" }) });

      expect(response.status).toBe(204);
      expect(prisma.movie.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("should return 404 if movie to delete is not found", async () => {
      (prisma.movie.delete as jest.Mock).mockRejectedValue(new Error("Movie not.\nFound"));

      const response = await DELETE({} as Request, { params: Promise.resolve({ id: "99" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Movie not found or deletion failed" });
    });
  });
});
