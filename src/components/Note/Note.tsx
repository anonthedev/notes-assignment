"use client"

import './styles.css'

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
import { MouseEventHandler, useEffect, useState } from 'react'
import { useCreateNote, useUpdateNote } from '@/lib/hooks/use-notes'
import { useRouter } from 'next/navigation'

type MenuBarProps = {
  editor: Editor | null;
  saveNotesFunc: MouseEventHandler<HTMLButtonElement>;
  saving: boolean;
};

type MenuButtonConfig = {
  icon: React.ElementType;
  title: string;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
}

const menuButtons: MenuButtonConfig[] = [
  {
    icon: Bold,
    title: "Bold",
    action: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive("bold"),
  },
  {
    icon: Italic,
    title: "Italic",
    action: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive("italic"),
  },
  {
    icon: Strikethrough,
    title: "Strikethrough",
    action: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive("strike"),
  },
  {
    icon: Heading1,
    title: "Heading 1",
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    icon: Heading2,
    title: "Heading 2",
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    icon: Heading3,
    title: "Heading 3",
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    icon: Code,
    title: "Inline Code",
    action: (editor) => editor.chain().focus().toggleCode().run(),
    isActive: (editor) => editor.isActive("code"),
  },
  {
    icon: CodeSquare,
    title: "Code Block",
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive("codeBlock"),
  },
  {
    icon: Pilcrow,
    title: "Paragraph",
    action: (editor) => editor.chain().focus().setParagraph().run(),
    isActive: (editor) => editor.isActive("paragraph"),
  },
  {
    icon: List,
    title: "Bullet List",
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    icon: ListOrdered,
    title: "Ordered List",
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  {
    icon: Quote,
    title: "Blockquote",
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive("blockquote"),
  },
  {
    icon: Minus,
    title: "Horizontal Rule",
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    icon: Undo,
    title: "Undo",
    action: (editor) => editor.chain().focus().undo().run(),
  },
  {
    icon: Redo,
    title: "Redo",
    action: (editor) => editor.chain().focus().redo().run(),
  },
  {
    icon: ImageIcon,
    title: "Insert Image",
    action: (editor) => {
      const url = window.prompt("Enter the URL of the image:");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
  },
  {
    icon: RemoveFormatting,
    title: "Remove Formatting",
    action: (editor) => editor.chain().focus().unsetAllMarks().run(),
  },
  {
    icon: X,
    title: "Clear Nodes",
    action: (editor) => editor.chain().focus().clearNodes().run(),
  },
  {
    icon: Save,
    title: "Save",
    action: () => {},
  },
];

const MenuBar = ({ editor, saveNotesFunc, saving }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-row flex-wrap gap-3 border-b-2 pb-3">
      {menuButtons.map((button, index) => {
        const Icon = button.icon;
        if (button.title === "Save") {
          return (
            <button
              key={index}
              onClick={saveNotesFunc}
              disabled={saving}
              title={button.title}
              className="menu-item cursor-pointer"
            >
              <Icon size={20} />
            </button>
          );
        }
        
        return (
          <button
            key={index}
            onClick={() => button.action(editor)}
            className={`menu-item cursor-pointer ${
              button.isActive?.(editor) ? "active" : ""
            }`}
            disabled={saving}
            title={button.title}
          >
            <Icon size={20} />
          </button>
        );
      })}
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
  const [notes, setNotes] = useState(serverNotes)
  const [noteTitle, setNoteTitle] = useState(title)
  const router = useRouter()
  
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()

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

  useEffect(() => {
    if (serverNotes && editor && !editor.isDestroyed) {
      editor.commands.setContent(serverNotes)
    }
  }, [serverNotes, editor])

  async function saveNotes(e: React.MouseEvent<HTMLButtonElement>) {
    if (uuid) {
      updateNote.mutate({
        uuid,
        notes,
        title: noteTitle,
        email,
      }, {
        onSuccess: (data) => {
        }
      })
    } else {
      createNote.mutate({
        notes,
        title: noteTitle,
        email,
      }, {
        onSuccess: (data) => {
          router.push(`/note/${data.uuid}`)
        }
      })
    }
  }

  return (
    <div className="text-editor unreset w-full h-screen border-2 p-2 flex flex-col gap-2">
      <MenuBar 
        editor={editor} 
        saveNotesFunc={saveNotes} 
        saving={createNote.isPending || updateNote.isPending} 
      />
      <input
        type="text"
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
        placeholder="Enter note title..."
        className="text-2xl font-bold py-2 focus:outline-none focus:border-blue-500 transition-colors"
      />
      <EditorContent editor={editor} />
    </div>
  );
}