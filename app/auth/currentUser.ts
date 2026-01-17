import { getUserFromSession } from "@/app/api/auth/core/session";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  return await getUserFromSession();
});
