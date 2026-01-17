import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { comparePasswords } from "../core/passwordHasher";
import { createUserSession } from "../core/session";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return NextResponse.json({ error: "Unable to login" }, { status: 401 });

    const isCorrectPassword = await comparePasswords({ hashedPassword: user.password, password, salt: user.salt });
    if (!isCorrectPassword) return NextResponse.json({ error: "Unable to login" }, { status: 401 });

    await createUserSession({ id: user.id.toString(), role: "user" });
    const { password: userPassword, salt: userSalt, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
