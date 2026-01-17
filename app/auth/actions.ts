"use server"

import { redirect } from "next/navigation";
import { removeUserFromSession } from "../api/auth/core/session";

export async function logOut() {
    await removeUserFromSession();
    redirect('/');
}