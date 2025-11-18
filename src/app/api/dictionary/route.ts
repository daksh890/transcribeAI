import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getDataSource } from "@/lib/db/data-source";


// GET /api/dictionary

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any;
    const userId = decoded.userId;

    const ds = await getDataSource();
    const dictRepo = ds.getRepository("dictionaries");

    const dict = await dictRepo.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });


    return NextResponse.json({
      words: dict?.words ?? [],
    });
  } catch (err) {
    console.error("GET /dictionary error:", err);
    return NextResponse.json({ words: [] });
  }
}


// POST /api/dictionary

export async function POST(req: NextRequest) {
  try {
    const { words } = await req.json();

    if (!Array.isArray(words)) {
      return NextResponse.json(
        { error: "Invalid dictionary format" },
        { status: 400 }
      );
    }

    const token = (await cookies()).get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any;
    const userId = decoded.userId;

    const ds = await getDataSource();
    const userRepo = ds.getRepository("users");
    const dictRepo = ds.getRepository("dictionaries");

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 401 });

    // Lookup existing dictionary row
    let dict = await dictRepo.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });

    if (!dict) {
      // Create new dictionary row
      dict = dictRepo.create({
        user,
        words,
      });
    } else {
      // Update existing dictionary words
      dict.words = words;
    }

    await dictRepo.save(dict);

    return NextResponse.json({ success: true, words });
  } catch (err) {
    console.error("POST /dictionary error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
