// movies-app/app/movies/new/page.tsx
import MovieForm from "../../../components/MovieForm";

const NewMoviePage = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Add New Movie</h1>
      <MovieForm />
    </div>
  );
};

export default NewMoviePage;
