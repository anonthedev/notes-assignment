"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Trash2, FileText } from "lucide-react";
import { useNotes, useDeleteNote } from "@/lib/hooks/use-notes";
import { useState, useEffect } from 'react';

const stripHtmlTags = (html: string) => {
  return html?.replace(/<[^>]*>/g, '');
};

export default function Dashboard() {
  const { data: notes = [], isLoading } = useNotes();
  const router = useRouter();
  const supabase = createClient();
  const deleteNote = useDeleteNote();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.error('Error fetching user:', error);
      if (user) setUser(user);
    }
    fetchUser();
  }, [supabase]);

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const fallbackInitial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDelete = async (uuid: string, e: React.MouseEvent) => {
    e.preventDefault(); 
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote.mutate(uuid);
    }
  };

  const handleSummarize = (uuid: string, e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/note/${uuid}/summary`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Notes</h1>

        <div className="flex items-center gap-4">
          <Button
            asChild
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <Link target="_blank" href={"/note"}>Create New Note</Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>{fallbackInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No notes found. Create your first note!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .map((note) => (
            <div
              key={note.uuid}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow relative group h-[200px]"
            >
              <Link href={`/note/${note.uuid}`} className="h-full flex flex-col">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">
                    {note.title || "Untitled Note"}
                  </h2>
                  <p className="text-muted-foreground line-clamp-3">{stripHtmlTags(note.notes)}</p>
                </div>
                <div className="text-sm text-muted-foreground self-end">
                  Updated at - {new Date(note.updated_at).toLocaleDateString()}
                </div>
              </Link>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-blue-500"
                  onClick={(e) => handleSummarize(note.uuid, e)}
                  title="Summarize"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-red-500"
                  onClick={(e) => handleDelete(note.uuid, e)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
