"use client"

import Head from "next/head";
import Note from '@/components/Note/Note'
import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { useEffect } from "react";
// import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default function Page() {
  const supabase = createClient();

  useEffect(() => {
    // Check authentication
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        redirect('/login');
      }
    }
    checkAuth();
  }, []);

  return (
    <>
      <Head>
        <title>New Note | Your App Name</title>
        <meta name="description" content="Create a new note" />
        <meta name="keywords" content="notes, editor, rich text, new note" />
        <meta property="og:title" content="New Note | Your App Name" />
        <meta property="og:description" content="Create a new note with our rich text editor." />
        <meta property="og:type" content="website" />
      </Head>
      <main className="w justify-center h-full">
        <Note />
        {/* <SimpleEditor/> */}
      </main>
    </>
  );
}
