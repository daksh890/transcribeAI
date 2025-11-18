
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DictionaryModal({ open, onClose }: Props) {
  const [words, setWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");

  // Load dictionary on modal open
  useEffect(() => {
    if (!open) return;

    (async () => {
      const res = await fetch("/api/dictionary", { credentials: "include" });
      const data = await res.json();
      setWords(data.words || []);
    })();
  }, [open]);

  const addWord = () => {
    if (!newWord.trim()) return;
    setWords((prev) => [...prev, newWord.trim()]);
    setNewWord("");
  };

  const removeWord = (remove: string) => {
    setWords((prev) => prev.filter((w) => w !== remove));
  };

  const save = async () => {
    await fetch("/api/dictionary", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words }),
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Custom Dictionary</DialogTitle>
        </DialogHeader>

        {/* Add new word */}
        <div className="flex items-center gap-2 mt-4">
          <Input
            placeholder="Type a word..."
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
          />
          <Button onClick={addWord}>Add</Button>
        </div>

        {/* Words list */}
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
          {words.map((word) => (
            <div
              key={word}
              className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg"
            >
              <span className="text-sm">{word}</span>
              <Button
                variant="destructive"
                onClick={() => removeWord(word)}
                className="px-2 py-1 text-xs"
              >
                Remove
              </Button>
            </div>
          ))}

          {words.length === 0 && (
            <p className="text-sm text-gray-400">No dictionary words yet.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
