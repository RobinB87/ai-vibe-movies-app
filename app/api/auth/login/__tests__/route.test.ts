import { POST } from '../route';
import prisma from '@/lib/prisma';

// Mock the prisma instance
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Login API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and user data (without password) on successful login', async () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', password: 'correctpassword' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const mockRequest = {
      json: async () => ({ email: 'test@example.com', password: 'correctpassword' }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ id: 1, email: 'test@example.com', name: 'Test User' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
  });

  it('should return 401 for incorrect password', async () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', password: 'correctpassword' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const mockRequest = {
      json: async () => ({ email: 'test@example.com', password: 'wrongpassword' }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Invalid credentials' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
  });

  it('should return 401 if user is not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const mockRequest = {
      json: async () => ({ email: 'nonexistent@example.com', password: 'anypassword' }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Invalid credentials' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
  });

  it('should return 400 if email is missing', async () => {
    const mockRequest = {
      json: async () => ({ password: 'anypassword' }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Email and password are required' });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return 400 if password is missing', async () => {
    const mockRequest = {
      json: async () => ({ email: 'test@example.com' }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Email and password are required' });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
