"use client";

import { useRef, useState } from "react";

export function useTranscriptionRecorder() {
  const SLICE_DURATION = 10_000;

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sliceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sliceResultsRef = useRef<string[]>([]);
  const recordingRef = useRef(false);

  const [recording, setRecording] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  // Load history (used by page)

  const loadHistory = async () => {
    const res = await fetch("/api/transcriptions", {
      credentials: "include",
    });
    const items = await res.json();
    setHistory(Array.isArray(items.transcriptions) ? items.transcriptions : []);

  };


  // Send slice

  const sendSlice = async (blob: Blob) => {
    const buffer = await blob.arrayBuffer();

    const res = await fetch("/api/transcribe/chunk", {
      method: "POST",
      headers: { "Content-Type": blob.type },
      body: buffer,
    });

    const data = await res.json();
    if (data.text) sliceResultsRef.current.push(data.text);
  };

  // Start a new slice

  const beginSlice = (stream: MediaStream) => {
    if (!recordingRef.current) return;

    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const recorder = new MediaRecorder(stream, { mimeType: mime });
    recorderRef.current = recorder;

    let chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      const sliceBlob = new Blob(chunks, { type: "audio/webm" });
      chunks = [];

      sendSlice(sliceBlob);

      if (recordingRef.current) beginSlice(stream);
    };

    recorder.start();

    sliceTimerRef.current = setTimeout(() => {
      recorder.stop();
    }, SLICE_DURATION);
  };

  // Public: startRecording()

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    sliceResultsRef.current = [];
    setFinalTranscript("");

    recordingRef.current = true;
    setRecording(true);

    beginSlice(stream);
  };
  
  // Public: stopRecording()

  const stopRecording = async () => {
  recordingRef.current = false;
  setRecording(false);

  // Cancel future slice timer
  if (sliceTimerRef.current) clearTimeout(sliceTimerRef.current);

  // Force stop and process last partial slice
  const lastChunks: Blob[] = [];

  await new Promise<void>((resolve) => {
    if (!recorderRef.current) return resolve();

    recorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) lastChunks.push(e.data);
    };

    recorderRef.current.onstop = () => {
      resolve();
    };

    // Force stop immediately — this triggers ondataavailable + onstop
    recorderRef.current.stop();
  });

  // Process last partial slice (VERY IMPORTANT)
  if (lastChunks.length > 0) {
    const lastBlob = new Blob(lastChunks, { type: "audio/webm" });
    await sendSlice(lastBlob);
  }

  // Stop mic tracks
  streamRef.current?.getTracks().forEach((t) => t.stop());

  // Merge text
  const final = sliceResultsRef.current.join(" ");
  setFinalTranscript(final);

  // Save to DB
  if (final.trim()) {
    await fetch("/api/transcribe/save", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: final }),
    });

    loadHistory();
  }
};

  return {
    recording,
    finalTranscript,
    setFinalTranscript,
    startRecording,
    stopRecording,
    history,
    loadHistory,
  };
}
