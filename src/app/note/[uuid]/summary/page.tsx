"use client";

import { useNote } from "@/lib/hooks/use-notes";
import { useEffect, use, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Page({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const { data: note, isLoading } = useNote(uuid);
  const supabase = createClient();
  const [summary, setSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        redirect("/login");
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (note?.notes) {
      generateSummary();
    }
  }, [note]);

  const generateSummary = async () => {
    if (!note?.notes) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: note.notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading note...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Note Summary</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {note?.title || "Untitled Note"}
        </h2>
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Generating summary...</span>
          </div>
        ) : (
          <div className="prose max-w-none">
            {summary ? (
              <div>{summary}</div>
            ) : (
              <div>Failed to generate summary. Please try again.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 