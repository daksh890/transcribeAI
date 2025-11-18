import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getDataSource } from "@/lib/db/data-source";
import { User } from "../../../../lib/db/entities/User";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    //decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as {
      userId: string;
    };

    const ds = await getDataSource();
    const repo = ds.getRepository(User);

    //Find user
    const user = await repo.findOne({ where: { id: decoded.userId } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
