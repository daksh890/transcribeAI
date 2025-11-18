import { NextRequest, NextResponse } from "next/server";
import { Dictionary } from "@/lib/db/entities";
import { getDataSource } from "../../../..//lib/db/data-source";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const buffer = Buffer.from(await req.arrayBuffer());

    if (buffer.length < 2000) {
      return NextResponse.json({ text: "" });
    }

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

     const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as {
          userId: string;
      };
      const userId = decoded.userId;

    const ds = await getDataSource();
    const dictRepo = ds.getRepository(Dictionary);

    const dictEntry = await dictRepo.findOne({
      where: { user: { id: userId } },
    });

    let dictionaryPrompt = "";

    if (dictEntry?.words?.length) {
      dictionaryPrompt =
        "Use these exact spellings in the transcription: " +
        dictEntry.words.join(", ");
    }
    // console.log("Using dictionary prompt:", dictionaryPrompt);


    const file = new File([buffer], "slice.webm", { type: "audio/webm" });

    const form = new FormData();
    form.append("file", file);
    form.append("model", "whisper-large-v3");
    form.append("language", "en");
    if (dictionaryPrompt) {
      form.append("prompt", dictionaryPrompt);
    }

    const resp = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        body: form,
      }
    );

    const out = await resp.json();

    return NextResponse.json({ text: out.text || "" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ text: "" }, { status: 500 });
  }
}
