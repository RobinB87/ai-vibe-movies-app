import { useMovies } from "@/app/context/MovieContext";
import { logOut } from "../actions";

export function LogOutButton() {
  const { setUser } = useMovies();

  const logOutClick = async () => {
    setUser(null);
    await logOut();
  }

  return (
    <button
        type="submit"
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={async () => logOutClick()}
      >
        Log Out
      </button>
  )
}