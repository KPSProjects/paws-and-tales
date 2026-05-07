# 🐾 Paws & Tales

A personal dog blog built with Next.js 15, TypeScript, and Supabase.
Follow the adventures of **Nela** ☀️ the Lurcher and **Szogun** ⚡ the Schnauzer Mix.

---

## ✨ Features

- 📸 Upload photos, GIFs, and videos for each dog
- 🗃️ Posts saved permanently to Supabase database
- ☁️ Media files stored in Supabase Storage
- 🔒 Admin-only upload and delete (via Supabase Auth)
- 🖼️ Grid and slideshow gallery views
- 📱 Fully responsive on mobile
- 🎨 Custom CSS with neon green & yellow theme

---

## 🐕 The Dogs

| | Nela ☀️ | Szogun ⚡ |
|---|---|---|
| **Breed** | Lurcher | Schnauzer Mix |
| **Vibe** | Professional napper | Chaos gremlin |
| **Colour** | Neon Yellow `#FFE600` | Neon Green `#39FF14` |

---

## 🛠️ Tech Stack

- **Framework** — Next.js 15 (App Router)
- **Language** — TypeScript
- **Styling** — Custom CSS with CSS variables (no Tailwind utilities)
- **Database** — Supabase (PostgreSQL)
- **Storage** — Supabase Storage
- **Auth** — Supabase Auth
- **Deployment** — Vercel

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/KPSProjects/paws-and-tales.git
cd paws-and-tales
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Setup

Create a `posts` table in Supabase with these columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, `gen_random_uuid()` |
| `dog` | `text` | `"nela"` or `"szogun"` |
| `media_type` | `text` | `"image"`, `"gif"`, or `"video"` |
| `url` | `text` | Public URL from Supabase Storage |
| `caption` | `text` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |

---

## 🔐 Admin Access

The admin panel is available at `/admin`. Only the owner can log in to upload or delete posts. Visitors see a read-only view of the blog.

---

## 📁 Project Structure

```
├── app/
│   ├── page.tsx              # Homepage
│   ├── admin/
│   │   └── page.tsx          # Admin login
│   └── dogs/
│       ├── nela/
│       │   └── page.tsx      # Nela's page
│       └── szogun/
│           └── page.tsx      # Szogun's page
├── components/
│   ├── MediaGallery.tsx      # Grid + slideshow gallery
│   ├── PostCard.tsx          # Individual post card
│   └── UploadModal.tsx       # Upload modal
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── useAdmin.ts           # Auth hook
├── types/
│   └── media.ts              # TypeScript types
└── public/
    └── photos/               # Static dog photos
```

---

*Made with ❤️ for Nela & Szogun 🐾*
