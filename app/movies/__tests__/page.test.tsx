// app/movies/__tests__/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('@/app/context/MovieContext', () => ({
  useMovies: () => ({
    movies: [
      { id: 1, name: 'Movie 1', year: 2020, genre: 'Action', rating: 5, review: 'Great' },
      { id: 2, name: 'Movie 2', year: 2021, genre: 'Comedy', rating: 4, review: 'Funny' },
    ],
    loading: false,
    error: null,
    searchTerm: '',
    setSearchTerm: jest.fn(),
    showWatchlistOnly: false,
    setShowWatchlistOnly: jest.fn(),
    addMovie: jest.fn(),
    updateMovie: jest.fn(),
    removeMovie: jest.fn(),
    fetchMovies: jest.fn(),
    currentUser: { id: 1, email: 'test@test.com', name: 'Test User' },
    loginUser: jest.fn().mockResolvedValue(true),
  }),
}));
import MoviesPage from '../page';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(

);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

describe('Movies Page', () => {
  it('should render the movies', async () => {
    render(<MoviesPage />);

    expect(await screen.findByText(/Movie 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/Movie 2/i)).toBeInTheDocument();
  });
});
