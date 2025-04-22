"use client"

import './styles.css'

import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  RemoveFormatting,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CodeSquare,
  Quote,
  Minus,
  Undo,
  Redo,
  Image as ImageIcon,
  X,
  Save,
} from "lucide-react";
import { MouseEventHandler, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import axios from 'axios'
import { toast } from 'sonner'

type MenuBarProps = {
  editor: Editor | null;
  saveNotesFunc: MouseEventHandler<HTMLButtonElement>;
  saving: boolean;
};

const MenuBar: React.FC<MenuBarProps> = ({ editor, saveNotesFunc, saving }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-row flex-wrap gap-3 border-b-2 pb-3">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={
          editor.isActive("bold")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Bold"
      >
        <Bold size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={
          editor.isActive("italic")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Italic"
      >
        <Italic size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={
          editor.isActive("strike")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Strikethrough"
      >
        <Strikethrough size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={
          editor.isActive("heading", { level: 1 })
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Heading 1"
      >
        <Heading1 size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={
          editor.isActive("heading", { level: 2 })
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Heading 2"
      >
        <Heading2 size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={
          editor.isActive("heading", { level: 3 })
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Heading 3"
      >
        <Heading3 size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={
          editor.isActive("code")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Inline Code"
      >
        <Code size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={
          editor.isActive("codeBlock")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Code Block"
      >
        <CodeSquare size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={
          editor.isActive("paragraph")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Paragraph"
      >
        <Pilcrow size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive("bulletList")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Bullet List"
      >
        <List size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive("orderedList")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Ordered List"
      >
        <ListOrdered size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={
          editor.isActive("blockquote")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Blockquote"
      >
        <Quote size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
        className="menu-item cursor-pointer"
      >
        <Minus size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
        className="menu-item cursor-pointer"
      >
        <Undo size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
        className="menu-item cursor-pointer"
      >
        <Redo size={20} />
      </button>
      <button
        onClick={() => {
          const url = window.prompt("Enter the URL of the image:");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        title="Insert Image"
        className="menu-item cursor-pointer"
      >
        <ImageIcon size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        title="Remove Formatting"
        className="menu-item cursor-pointer"
      >
        <RemoveFormatting size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().clearNodes().run()}
        title="Clear Nodes"
        className="menu-item cursor-pointer"
      >
        <X size={20} />
      </button>
      <button
        disabled={saving}
        onClick={saveNotesFunc}
        title="Save"
        className="menu-item cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save size={20} />
      </button>
    </div>
  );
};

interface NoteProps {
  serverNotes?: string;
  uuid?: string;
  title?: string;
  email?: string;
}

export default function Note({ serverNotes = "", uuid, title = "", email = "" }: NoteProps) {
  const [notes, setNotes] = useState(serverNotes);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content: serverNotes || `<h2>Start taking notes!</h2>
    <p>Use the toolbar above to format your notes.</p>`,
    onUpdate({ editor }) {
      setNotes(editor.getHTML());
    },
  });

  async function saveNotes(e: React.MouseEvent<HTMLButtonElement>) {
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No session found');
      }

      // If UUID exists, update the note, otherwise create a new one
      const endpoint = uuid ? `/api/notes?uuid=${encodeURIComponent(uuid)}` : '/api/notes';
      const method = uuid ? 'PUT' : 'POST';

      const response = await axios({
        method,
        url: endpoint,
        data: { 
          notes,
          title,
          email
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.status === 200) {
        toast.success(uuid ? "Notes saved successfully" : "New note created successfully");
        // If this was a new note, redirect to the note's page
        if (!uuid && response.data?.[0]?.uuid) {
          window.location.href = `/note/${response.data[0].uuid}`;
        }
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Couldn't save notes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="text-editor unreset h-screen border-2 p-2 flex flex-col gap-2">
      <MenuBar editor={editor} saveNotesFunc={saveNotes} saving={saving} />
      <EditorContent editor={editor} />
    </div>
  );
}