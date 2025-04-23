# Notes Assignment App

A full-stack note-taking application built with **Next.js**, **Supabase** for authentication and storage, **Tailwind CSS** for styling, and **Groq** for AI note summarization. This app allows users to sign up, log in, and manage their notes with a rich text editor interface. Notes are securely stored and associated with user accounts. You can also generate concise AI summaries of your notes with a single click.

---

## Features
- **User Authentication:** Sign up, log in, and log out with email/password or Google OAuth (via Supabase Auth).
- **Notes CRUD:** Create, read, update, and delete notes. Each note supports rich text formatting.
- **AI Summarization:** Instantly generate concise summaries of your notes using an integrated AI API (powered by GROQ).
- **Auto-Save & Summarize:** Notes can be summarized and changes are saved in real-time.
- **Responsive UI:** Built using Tailwind CSS and Shadcn for a modern, accessible experience.
- **Theming:** Light/dark mode toggle.

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or newer recommended)
- **npm** (v9 or newer) or **yarn** or **pnpm**
- **Supabase** project (get your API keys and URL)
- **GROQ API Key** (for AI summarization)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd notes-assignment
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
```

### 4. Run the Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

You can also try the deployed version here: [https://takenoteofit.vercel.app](https://takenoteofit.vercel.app)

---

## Project Structure
```
notes-assignment/
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # UI and feature components
│   ├── lib/          # Hooks, providers, and Supabase utils
│   └── middleware.ts # Session and auth middleware
├── public/           # Static assets
├── package.json      # Project dependencies and scripts
└── README.md         # Project documentation
```

---

## Implementation Overview
- **Frontend:** Built with Next.js App Router, Tailwind CSS, and Shadcn for accessible components and Tiptap for the rich text editor.
- **Authentication:** Managed via Supabase Auth (email/password and Google OAuth). Session is handled in middleware and on the client.
- **Notes API:** CRUD operations are handled via Next.js API routes (`/api/notes`). Each request checks user authentication with Supabase before accessing or mutating notes.
- **AI Summarization:** GROQ's API is used to generate summaries for notes.
- **State Management:** Uses React Query (`@tanstack/react-query`) for efficient data fetching and cache management.

---

## Deployment
You can deploy this app on Vercel, Netlify, or any platform that supports Next.js. Make sure to set your environment variables in the deployment settings.

---

## Acknowledgements
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com/)
- [Tiptap Editor](https://tiptap.dev/)
- [GROQ](https://groq.dev/)

---
