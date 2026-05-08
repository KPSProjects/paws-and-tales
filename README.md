# Paws & Tales

A community dog blog platform built with Next.js 15, TypeScript, and Supabase.
Share your dog's adventures, follow other dogs, and connect with fellow dog lovers.

**Live site:** [paws-and-tales.vercel.app](https://paws-and-tales.vercel.app)

---

## Features

- Upload photos, GIFs, and videos for your dog
- Posts saved permanently to Supabase database
- Media files stored in Supabase Storage
- Multi-user system with signup and admin approval flow
- Role-based admin system — manage users, dogs and posts
- Follow other dogs and track them in your dashboard
- Like posts and leave comments with usernames
- Grid and slideshow gallery views
- Fully responsive on mobile
- Custom CSS with neon green & yellow theme

---

## Tech Stack

- **Framework** — Next.js 15 (App Router)
- **Language** — TypeScript
- **Styling** — Custom CSS with CSS variables (no Tailwind utilities)
- **Database** — Supabase (PostgreSQL)
- **Storage** — Supabase Storage
- **Auth** — Supabase Auth
- **Deployment** — Vercel

---

## Getting Started

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
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Setup

### Tables required in Supabase:

**`profiles`** — User accounts
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Matches Supabase Auth user ID |
| `email` | `text` | User email |
| `username` | `text` | Unique username |
| `status` | `text` | `pending`, `approved`, `rejected` |
| `role` | `text` | `admin` or null |
| `created_at` | `timestamptz` | Default `now()` |

**`dogs`** — Dog profiles
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `owner_id` | `uuid` | References auth user |
| `name` | `text` | Dog's name |
| `breed` | `text` | Dog's breed |
| `bio` | `text` | Dog's bio |
| `slug` | `text` | URL-friendly name |
| `colour` | `text` | Hex colour code |
| `photo_url` | `text` | Profile photo URL |
| `created_at` | `timestamptz` | Default `now()` |

**`posts`** — Media posts
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `dog_id` | `uuid` | References dogs table |
| `owner_id` | `uuid` | References auth user |
| `media_type` | `text` | `image`, `gif`, or `video` |
| `url` | `text` | Public URL from Supabase Storage |
| `caption` | `text` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |

**`likes`** — Post likes
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `post_id` | `uuid` | References posts |
| `user_id` | `uuid` | References auth user |
| `created_at` | `timestamptz` | Default `now()` |

**`comments`** — Post comments
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `post_id` | `uuid` | References posts |
| `user_id` | `uuid` | References auth user |
| `content` | `text` | Comment text |
| `created_at` | `timestamptz` | Default `now()` |

**`follows`** — Dog follows
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `dog_id` | `uuid` | References dogs |
| `user_id` | `uuid` | References auth user |
| `created_at` | `timestamptz` | Default `now()` |

---

## Access & Roles

| Role | Access |
|---|---|
| Visitor | View all dogs and posts |
| Approved user | Add dogs, post media, like, comment, follow |
| Admin | Full control — manage users, dogs and posts at `/admin` |

New users must be approved by the admin before they can post.
Admin role is assigned manually in the `profiles` table by setting `role = 'admin'`.

---

## Project Structure

```
├── app/
│   ├── page.tsx                    # Homepage
│   ├── admin/
│   │   ├── page.tsx                # Admin login
│   │   └── users/page.tsx          # Admin panel
│   ├── api/
│   │   └── delete-user/route.ts    # Auth user deletion API
│   ├── dashboard/
│   │   ├── page.tsx                # User dashboard
│   │   ├── add-dog/page.tsx        # Add dog form
│   │   └── edit-dog/[id]/page.tsx  # Edit dog form
│   ├── dogs/
│   │   └── [slug]/page.tsx         # Dynamic dog page
│   ├── login/page.tsx              # Login page
│   ├── signup/page.tsx             # Signup page
│   └── pending/page.tsx            # Awaiting approval page
├── components/
│   ├── MediaGallery.tsx            # Grid + slideshow gallery
│   ├── PostCard.tsx                # Post card with likes & comments
│   └── UploadModal.tsx             # Media upload modal
├── lib/
│   ├── supabase.ts                 # Supabase client
│   └── useAdmin.ts                 # Auth & role hook
├── types/
│   └── media.ts                    # TypeScript types
└── public/
    └── photos/                     # Static photos & icons
```

---

Made with love for Nela & Szogun · [paws-and-tales.vercel.app](https://paws-and-tales.vercel.app)
