"use client"

import Head from "next/head";
import Note from '@/components/Note/Note'
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from '@/lib/supabase/client'
import React from "react";
import { redirect } from 'next/navigation'

export default function Page({ params }: { params: Promise<{ uuid: string }> }) {
  const {uuid} = React.use(params)
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [gettingData, setGettingData] = useState(true);

  async function getNotesData() {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return redirect('/login')
      }

      const response = await axios.get(
        `/api/notes?uuid=${uuid}`,
        {
          headers: { 
            Authorization: `Bearer ${session.access_token}` 
          },
        }
      );
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const noteData = response.data[0];
        
        if (noteData.notes) {
          setNotes(noteData.notes);
          setTitle(noteData.title || "");
          setEmail(noteData.email || session.user?.email || "");
        } else {
          // If no note found with this UUID, redirect to new note page
          redirect('/note');
        }
      } else {
        toast.error("No note found");
        redirect('/note');
      }
    } catch (error) {
      console.error("Error fetching note data:", error);
      toast.error("Something went wrong");
      redirect('/note');
    } finally {
      setGettingData(false);
    }
  }

  useEffect(() => {
    getNotesData();
  }, [uuid]);

  return (
    <>
      <Head>
        <title>Edit Note | Your App Name</title>
        <meta name="description" content="Edit your note" />
        <meta name="keywords" content="notes, editor, rich text, edit note" />
        <meta property="og:title" content="Edit Note | Your App Name" />
        <meta property="og:description" content="Edit your note with our rich text editor." />
        <meta property="og:type" content="website" />
      </Head>
      <main className="w-full flex flex-row justify-center h-[calc(100vh-80px)]">
        {!gettingData ? (
          <Note 
            serverNotes={notes} 
            uuid={uuid}
            title={title}
            email={email}
          />
        ) : (
          <div className="self-center">Loading note...</div>
        )}
      </main>
    </>
  );
}
