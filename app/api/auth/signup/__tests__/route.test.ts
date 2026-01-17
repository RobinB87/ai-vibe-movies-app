import { POST } from "../route";
import prisma from "@/lib/prisma";

// Mock the prisma instance
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("Signup API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 201 and user data (without password) on successful signup", async () => {
    const mockUser = { id: 1, email: "new@example.com", name: "New User", password: "newpassword" };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // No existing user
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const mockRequest = {
      json: async () => ({ email: "new@example.com", name: "New User", password: "newpassword" }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual({ id: 1, email: "new@example.com", name: "New User" });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "new@example.com" } });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: "new@example.com",
        name: "New User",
        password: "newpassword", // TODO: This should be a hashed password
      },
    });
  });

  it("should return 409 if user with email already exists", async () => {
    const existingUser = { id: 1, email: "existing@example.com", name: "Existing User", password: "password" };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

    const mockRequest = {
      json: async () => ({ email: "existing@example.com", name: "Another User", password: "anotherpassword" }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data).toEqual({ error: "User with this email already exists" });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "existing@example.com" } });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("should return 400 if email is missing", async () => {
    const mockRequest = {
      json: async () => ({ name: "New User", password: "newpassword" }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Email, name, and password are required" });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("should return 400 if name is missing", async () => {
    const mockRequest = {
      json: async () => ({ email: "new@example.com", password: "newpassword" }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Email, name, and password are required" });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("should return 400 if password is missing", async () => {
    const mockRequest = {
      json: async () => ({ email: "new@example.com", name: "New User" }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Email, name, and password are required" });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
