"use client";

import Head from "next/head";
import Note from "@/components/Note/Note";
import { useNote } from "@/lib/hooks/use-notes";
import { createClient } from "@/lib/supabase/client";
import { useEffect, use } from "react";
import { redirect } from "next/navigation";

export default function Page({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const { data: note, isLoading, error } = useNote(uuid);
  const supabase = createClient();

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

  if (error) {
    redirect("/note");
  }

  return (
    <>
      <Head>
        <title>Edit Note | Your App Name</title>
        <meta name="description" content="Edit your note" />
        <meta name="keywords" content="notes, editor, rich text, edit note" />
        <meta property="og:title" content="Edit Note | Your App Name" />
        <meta
          property="og:description"
          content="Edit your note with our rich text editor."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main className="w-full flex flex-row justify-center h-[calc(100vh-80px)]">
        {!isLoading && note ? (
          <Note
            serverNotes={note.notes}
            uuid={uuid}
            title={note.title}
            email={note.email}
          />
        ) : (
          <div className="self-center">Loading note...</div>
        )}
      </main>
    </>
  );
}
