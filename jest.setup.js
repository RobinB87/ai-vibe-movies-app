import "@testing-library/jest-dom";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => {
      const status = init?.status || 200;
      return {
        status,
        json: async () => data,
      };
    }),
  },
}));
