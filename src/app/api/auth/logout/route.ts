import { NextResponse } from "next/server";

export async function POST() {
  // Clear JWT cookie
  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0, // expire immediately
  });

  return res;
}
