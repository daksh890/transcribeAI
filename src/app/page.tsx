import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // If JWT exists, send user to dictation page
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
      redirect("/transcribe");
    } catch {}
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold">Welcome to Transcriber</h1>
        <p className="text-muted-foreground">
          Fast, accurate voice-to-text transcription powered by Whisper + LLM clean-up.
        </p>

        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
