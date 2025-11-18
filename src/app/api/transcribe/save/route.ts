import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getDataSource } from "@/lib/db/data-source";
import { Session } from "@/lib/db/entities/Session";
import { Transcription } from "@/lib/db/entities/Transcription";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Transcription text is empty" },
        { status: 400 }
      );
    }

    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;
    const sessionId = decoded.sessionId;

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 }
      );
    }

    const ds = await getDataSource();
    const sessionRepo = ds.getRepository(Session);
    const tRepo = ds.getRepository(Transcription);

    // Validate that session belongs to the authenticated user
    const session = await sessionRepo.findOne({
      where: {
        id: sessionId,
        user: { id: userId },
      },
      relations: ["user"],
    });

    if (!session) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const record = tRepo.create({
      text,
      session,
    });

    await tRepo.save(record);

    return NextResponse.json({
      success: true,
      id: record.id,
    });
  } catch (err) {
    console.error("Save transcription error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
