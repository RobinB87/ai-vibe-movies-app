import { Role } from "@/types/role";
import crypto from "crypto";
import redis from "@/lib/redis";
import { cookies } from "next/headers";

const SESSION_EXPIRATION_MS = 60 * 60 * 24 * 7;
const COOKIE_SESSION_KEY = "session_id";

interface SessionSchema {
  id: string;
  role: Role;
}

export async function getUserFromSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_SESSION_KEY)?.value;
  return sessionId ? getUserSessionById(sessionId) : null;
}

export async function createUserSession(userSession: SessionSchema) {
  const sessionId = crypto.randomBytes(512).toString("hex").normalize();
  await redis.set(`session:${sessionId}`, JSON.stringify(userSession), "EX", SESSION_EXPIRATION_MS);
  await setCookie(sessionId);
}

export async function removeUserFromSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_SESSION_KEY)?.value;
  if (!sessionId) return;

  await redis.del(`session:${sessionId}`);
  cookieStore.delete(COOKIE_SESSION_KEY);
}

export async function setCookie(sessionId: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_SESSION_KEY, sessionId, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: Date.now() + SESSION_EXPIRATION_MS * 1000,
  });
}

async function getUserSessionById(sessionId: string) {
  const rawUser = await redis.get(`session:${sessionId}`);
  return rawUser ? (JSON.parse(rawUser) as SessionSchema) : null;
}
