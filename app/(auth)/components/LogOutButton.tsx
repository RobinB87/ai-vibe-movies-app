import { useMovies } from "@/app/context/MovieContext";
import { logOut } from "../actions";
import Button from "@/components/Button";

export function LogOutButton() {
  const { setUser } = useMovies();

  const handleLogOut = async () => {
    setUser(null);
    await logOut();
  };

  return <Button label="Log Out" color="red" onClick={handleLogOut} />;
}
