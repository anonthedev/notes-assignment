"use client";

import { useNote, useUpdateNote } from "@/lib/hooks/use-notes";
import { useEffect, use, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Model {
  id: string;
  name: string;
}

export default function Page({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const { data: note, isLoading } = useNote(uuid);
  const updateNote = useUpdateNote();
  const supabase = createClient();
  const [summary, setSummary] = useState<string>("");
  const [newSummary, setNewSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("llama3-70b-8192");
  const [summaryLength, setSummaryLength] = useState<string>("medium");
  const [summaryTone, setSummaryTone] = useState<string>("neutral");
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch("/api/ai/models");
        if (response.ok) {
          const {data} = await response.json();
          console.log(data)
          setModels(data);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        setIsLoadingModels(false);
      }
    }
    fetchModels();
  }, []);

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
      if (note.summary) {
        setSummary(note.summary);
      } else {
        generateSummary(true);
      }
    }
  }, [note]);

  const generateSummary = async (shouldSave: boolean = false) => {
    if (!note?.notes) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          title: note.title,
          text: note.notes,
          model: selectedModel,
          length: summaryLength,
          tone: summaryTone
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      
      if (shouldSave) {
        setSummary(data.summary);
        updateNote.mutate({
          uuid,
          notes: note.notes,
          title: note.title,
          email: note.email,
          summary: data.summary,
        });
        toast.success("Summary generated and saved successfully");
      } else {
        setNewSummary(data.summary);
        toast.success("New summary generated successfully");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error(
        shouldSave 
          ? "Failed to generate and save summary" 
          : "Failed to generate new summary"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveNewSummary = () => {
    if (!newSummary) return;
    try {
      setSummary(newSummary);
      updateNote.mutate({
        uuid,
        notes: note!.notes,
        title: note!.title,
        email: note!.email,
        summary: newSummary,
      });
      toast.success("New summary saved successfully");
      setNewSummary("");
    } catch (error) {
      console.error("Error saving new summary:", error);
      toast.error("Failed to save new summary");
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Note Summary</h1>
        <div className="flex items-center gap-4">
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
            disabled={isLoadingModels || isGenerating}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={summaryLength}
            onValueChange={setSummaryLength}
            disabled={isGenerating}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Summary Length" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={summaryTone}
            onValueChange={setSummaryTone}
            disabled={isGenerating}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Summary Tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="simple">Simple</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateSummary(false)}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate Summary
          </Button>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-background rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {note?.title || "Untitled Note"}
          </h2>
          <div className="prose max-w-none">
            <h3 className="text-lg font-medium mb-2">Current Summary</h3>
            {summary ? (
              <div className="bg-secondary p-4 rounded-md">
                <div className="prose">
                  <ReactMarkdown>
                    {summary}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div>No summary available yet.</div>
            )}
          </div>
        </div>

        {(isGenerating || newSummary) && (
          <div className="bg-background rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">New Summary</h3>
              {newSummary && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveNewSummary}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save New Summary
                </Button>
              )}
            </div>
            {isGenerating ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Generating new summary...</span>
              </div>
            ) : newSummary ? (
              <div className="prose max-w-none">
                <div className="bg-secondary p-4 rounded-md">
                  <div className="prose">
                    <ReactMarkdown>
                      {newSummary}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
} 