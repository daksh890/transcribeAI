import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import jwt from "jsonwebtoken";
import { User } from "@/lib/db/entities/User";
import { Session } from "@/lib/db/entities/Session";
import { Transcription } from "@/lib/db/entities/Transcription";
import { In } from "typeorm";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ transcriptions: [] });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret"
    ) as { userId: string };

    const ds = await getDataSource();

    const userRepo = ds.getRepository(User);
    const sessionRepo = ds.getRepository(Session);
    const tRepo = ds.getRepository(Transcription);

    const user = await userRepo.findOne({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ transcriptions: [] });
    }

    // Get ALL sessions for user
    const sessions = await sessionRepo.find({
      where: { user: { id: user.id } },
    });

    if (sessions.length === 0) {
      return NextResponse.json({ transcriptions: [] });
    }

    const sessionIds = sessions.map((s) => s.id);

    const transcriptions = await tRepo.find({
      where: {
        session: { id: In(sessionIds) },
      },
      order: {
        createdAt: "DESC",
      },
    });

    return NextResponse.json({ transcriptions });
  } catch (err) {
    console.error("Err loading transcriptions:", err);
    return NextResponse.json({ transcriptions: [] });
  }
}
