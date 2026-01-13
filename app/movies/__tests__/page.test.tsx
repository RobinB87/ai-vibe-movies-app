// app/movies/__tests__/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import MoviesPage from '../page';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/movies', () => {
    return HttpResponse.json([
      { id: 1, name: 'Movie 1', year: 2020, genre: 'Action', myRating: 5, review: 'Great' },
      { id: 2, name: 'Movie 2', year: 2021, genre: 'Comedy', myRating: 4, review: 'Funny' },
    ]);
  })
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

    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Movie 2')).toBeInTheDocument();
    });
  });
});
