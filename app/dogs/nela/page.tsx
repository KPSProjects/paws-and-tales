"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MediaPost } from "@/types/media";
import UploadModal from "@/components/UploadModal";
import MediaGallery from "@/components/MediaGallery";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/lib/useAdmin";

export default function NelaPage() {
    const [posts, setPosts] = useState<MediaPost[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const isAdmin = useAdmin();

    useEffect(() => {
        async function loadPosts() {
            const { data, error } = await supabase
                .from("posts")
                .select("*")
                .eq("dog", "nela")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Failed to load posts:", error.message);
                return;
            }

            const loaded: MediaPost[] = data.map((p) => ({
                id: p.id,
                dog: p.dog,
                mediaType: p.media_type,
                url: p.url,
                caption: p.caption,
                createdAt: p.created_at,
            }));

            setPosts(loaded);
        }

        loadPosts();
    }, []);

    function handleNewPost(post: MediaPost) {
        setPosts((prev) => [post, ...prev]);
    }

    function handleDelete(id: string) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }

    return (
        <main>
            {/* NAV */}
            <nav className="nav">
                <Link href="/" className="nav-brand">
                    Paws<span className="text-green">.</span><span className="text-yellow">.</span>
                </Link>
                <div className="nav-right">
                    <Link href="/" className="nav-back">← Home</Link>
                    <Link href="/dogs/nela" className="nav-dog-btn active-yellow">☀️ Nela</Link>
                    <Link href="/dogs/szogun" className="nav-dog-btn btn-green">⚡ Szogun</Link>
                </div>
            </nav>

            {/* HERO */}
            <div className="dog-hero hero-yellow">
                <div className="hero-glow-y" />
                <div className="hero-stripe-yellow" />
                <div className="dh-info">
                    <div className="dh-name name-yellow">Nela ☀️</div>
                    <div className="dh-breed">Lurcher · The professional napper</div>
                    <div className="dh-bio">
                        Spends 22 hours horizontal. The other 2? Pure greyhound terror.
                        0 to 40mph before you've finished your coffee.
                    </div>
                </div>
            </div>

            {/* TOOLBAR */}
            <div className="toolbar toolbar-dark">
                {isAdmin && (
                    <button className="upload-btn ubtn-yellow" onClick={() => setModalOpen(true)}>
                        ☀️ Add post
                    </button>
                )}
                <div className="toolbar-right">
                    <span className="post-count">{posts.length} posts</span>
                </div>
            </div>

            {/* GALLERY OR EMPTY STATE */}
            {posts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🐾</div>
                    <h4>No posts yet!</h4>
                    <p>Hit "Add post" to share Nela's first moment.</p>
                </div>
            ) : (
                <div className="dog-nela">
                    <MediaGallery
                        posts={posts}
                        dog="nela"
                        isAdmin={isAdmin}
                        onDelete={handleDelete}
                    />
                </div>
            )}

            {/* MODAL */}
            {modalOpen && (
                <UploadModal
                    dog="nela"
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleNewPost}
                />
            )}
        </main>
    );
}