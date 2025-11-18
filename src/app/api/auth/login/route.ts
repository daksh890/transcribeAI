// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { getDataSource } from "../../../..//lib/db/data-source";
import { User } from "../../../../lib/db/entities/User";
import { Session } from "../../../../lib/db/entities/Session";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const userRepo = ds.getRepository(User);
    const sessionRepo = ds.getRepository(Session);

    // Find user
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Compare passwords
    const isValid = await bcrypt.compare(password, user.password as string);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

     // Create session
    const session = sessionRepo.create({ user });
    await sessionRepo.save(session);


    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, sessionId: session.id, email: user.email },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "30d" }
    );
   
    // Create response
    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    // Set cookie
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {

  return NextResponse.json(
    { error: "Something went wrong."},
    { status: 500 }
  );
}
}
