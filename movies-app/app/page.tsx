import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-black dark:text-white">Welcome to the Movie App</h1>
        <p className="text-lg mb-8 text-zinc-600 dark:text-zinc-400">
          Tired of figuring out if you have seen a movie? Try your personal movie collection!
        </p>
        <Link
          href="/movies"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out"
        >
          View My Movies
        </Link>
      </main>
    </div>
  );
}
