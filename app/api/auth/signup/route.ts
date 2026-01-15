import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateSalt, hashPassword } from "../core/passwordHasher";

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json();
    if (!email || !name || !password)
      return NextResponse.json({ error: "Email, name, and password are required" }, { status: 400 });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });

    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        salt,
      },
    });

    const { password: userPassword, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
