"use client";

import { useEffect } from "react";
import { Mic, Square, Copy, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useAuthUser } from "./../../hooks/useAuth";
import { useTranscriptionRecorder } from "./../../hooks/useTranscription";
import DictionaryModal from "../../components/dictionaryModal";
import { useState } from "react";



export default function TranscribePage() {
  const { user, authLoading } = useAuthUser();
  const {
    recording,
    finalTranscript,
    setFinalTranscript,
    startRecording,
    stopRecording,
    history,
    loadHistory
  } = useTranscriptionRecorder();
  const [showDict, setShowDict] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSignOut = async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  window.location.href = "/login"; // hard redirect for clean state
};


  if (authLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-primary rounded-full"></div>
        <p className="text-gray-600 text-sm">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">

      {/* ---------------- HEADER ---------------- */}
      <header className="w-full sticky top-0 bg-white shadow-sm border-b z-10">
        <div className="w-full px-6 py-4 flex items-center justify-between">

          {/* LEFT — Page Title */}
          <h1 className="text-2xl font-bold tracking-tight">
            Transcribe
          </h1>

          {/* RIGHT — User Badge + Dictionary Button */}
          <div className="flex items-center gap-4">

          

          {/* Dictionary Button */}
          <Button
          onClick={() => setShowDict(true)}
          className="bg-gray-100 text-white bg-gray-800 hover:bg-gray-700 border shadow px-4 py-2 rounded-lg"
          >
            Dictionary
          </Button>
            
          {/* User Badge */}

          <div className="relative group">
          {/* User Badge */}
          <div className="flex items-center gap-2 text-gray-700 bg-gray-100 
                          px-4 py-2 rounded-full text-sm shadow-sm border cursor-pointer">
            <UserCircle size={18} />
            {user?.email}
          </div>

          {/* Dropdown */}
          <div
            className="
              absolute right-0 mt-0 w-32 bg-white border shadow-md rounded-full 
              opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto
              transition-all duration-150
            "
          >
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
          {/* Modal */}
          <DictionaryModal open={showDict} onClose={() => setShowDict(false)} />
        </div>
      </div>
    </header>

     

      {/* -------------- MAIN CONTENT -------------- */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-6 space-y-8 overflow-hidden">

        {/* Record Button */}
        <div className="flex justify-center">
          <Button
            onClick={recording ? stopRecording : startRecording}
            className={`h-20 w-20 rounded-full flex items-center justify-center transition-all
              ${
                recording
                  ? "bg-red-500 animate-pulse shadow-xl scale-105"
                  : "bg-primary"
              }`}
          >
            {recording ? (
              <Square size={34} className="text-white" />
            ) : (
              <Mic size={34} className="text-white" />
            )}
          </Button>
        </div>

        {/* Final transcript */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Current Transcription</h2>
          <Textarea
            placeholder="Your final transcription appears here after recording stops..."
            value={finalTranscript}
            onChange={(e) => setFinalTranscript(e.target.value)}
            className="h-40 resize-none"
          />
        </div>

        {/* Previous Transcriptions (Scrollable Only) */}
        <div className="flex flex-col h-[40vh]">
          <h2 className="text-lg font-semibold mb-3">Previous Transcriptions</h2>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {history.length === 0 && (
              <p className="text-muted-foreground">No transcriptions yet.</p>
            )}

            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-xl shadow hover:shadow-md transition relative group border"
              >
                <p className="whitespace-pre-wrap text-gray-800">{item.text}</p>

                <button
                  onClick={() => navigator.clipboard.writeText(item.text)}
                  className="absolute top-3 right-3 p-2 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <Copy size={16} />
                </button>

                <span className="text-xs text-gray-400 block mt-3">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
