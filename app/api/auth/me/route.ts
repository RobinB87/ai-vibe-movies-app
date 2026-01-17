  import { getUserFromSession } from "../core/session";
  import { NextResponse } from "next/server";

  export async function GET() {
    const user = await getUserFromSession();
    return NextResponse.json(user);
  }