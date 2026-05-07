"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MediaPost } from "@/types/media";
import UploadModal from "@/components/UploadModal";
import MediaGallery from "@/components/MediaGallery";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/lib/useAdmin";

export default function SzogunPage() {
    const [posts, setPosts] = useState<MediaPost[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const isAdmin = useAdmin();

    useEffect(() => {
        async function loadPosts() {
            const { data, error } = await supabase
                .from("posts")
                .select("*")
                .eq("dog", "szogun")
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

        void loadPosts();
    }, []);

    function handleNewPost(post: MediaPost) {
        setPosts((prev) => [post, ...prev]);
    }

    function handleDelete(id: string) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }

    return (
        <main>
            <nav className="nav">
                <Link href="/" className="nav-brand">
                    Paws<span className="text-green">.</span><span className="text-yellow">.</span>
                </Link>
                <div className="nav-right">
                    <Link href="/" className="nav-back">← Home</Link>
                    <Link href="/dogs/nela" className="nav-dog-btn btn-yellow">☀️ Nela</Link>
                    <Link href="/dogs/szogun" className="nav-dog-btn active-green">⚡ Szogun</Link>
                    {isAdmin && (
                        <button
                            className="nav-logout-btn"
                            onClick={async () => { await supabase.auth.signOut(); }}
                        >
                            Log out
                        </button>
                    )}
                </div>
            </nav>

            <div className="dog-hero hero-green">
                <div className="hero-glow-g" />
                <div className="hero-stripe-green" />
                <div className="dh-info">
                    <div className="dh-name name-green">Szogun ⚡</div>
                    <div className="dh-breed">Schnauzer Mix · The chaos gremlin</div>
                    <div className="dh-bio">
                        Active, anxious, and running on pure chaos energy.
                        Never stops. Never slows down. Beard game unmatched.
                    </div>
                </div>
            </div>

            <div className="toolbar toolbar-dark">
                {isAdmin && (
                    <button className="upload-btn ubtn-green" onClick={() => setModalOpen(true)}>
                        ⚡ Add post
                    </button>
                )}
                <div className="toolbar-right">
                    <span className="post-count">{posts.length} posts</span>
                </div>
            </div>

            {posts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🐾</div>
                    <h4>No posts yet!</h4>
                    <p>Hit &quot;Add post&quot; to share Szogun&apos;s first moment.</p>
                </div>
            ) : (
                <div className="dog-szogun">
                    <MediaGallery
                        posts={posts}
                        dog="szogun"
                        isAdmin={isAdmin}
                        onDelete={handleDelete}
                    />
                </div>
            )}

            {modalOpen && (
                <UploadModal
                    dog="szogun"
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleNewPost}
                />
            )}
        </main>
    );
}