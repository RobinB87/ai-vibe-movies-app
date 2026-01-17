import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "./app/api/auth/core/session";

const privateExactRoutes = ["/admin", "/profile"];
const privatePrefixRoutes = ["/movies"];

export async function proxy(request: NextRequest) {
  const response = (await middlewareAuth(request)) ?? NextResponse.next();
  return response;
}

async function middlewareAuth(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const user = await getUserFromSession();

  if (privateExactRoutes.includes(path)) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
  }

  for (const prefix of privatePrefixRoutes) {
    if (path.startsWith(prefix) && path !== prefix) {
      // e.g., /movies != /movies/123
      if (!user) return NextResponse.redirect(new URL("/login", request.url));
    }
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
