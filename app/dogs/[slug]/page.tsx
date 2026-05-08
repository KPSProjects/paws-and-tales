"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MediaPost } from "@/types/media";
import UploadModal from "@/components/UploadModal";
import MediaGallery from "@/components/MediaGallery";
import { supabase } from "@/lib/supabase";

interface Dog {
    id: string;
    name: string;
    breed: string;
    bio: string;
    slug: string;
    colour: string;
    owner_id: string;
}

export default function DogPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const [dog, setDog] = useState<Dog | null>(null);
    const [posts, setPosts] = useState<MediaPost[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followCount, setFollowCount] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            const { data: dogData } = await supabase
                .from("dogs")
                .select("*")
                .eq("slug", slug)
                .single();

            if (!dogData) {
                router.push("/");
                return;
            }

            setDog(dogData);

            const { data: postsData } = await supabase
                .from("posts")
                .select("*")
                .eq("dog_id", dogData.id)
                .order("created_at", { ascending: false });

            const loaded: MediaPost[] = (postsData ?? []).map((p) => ({
                id: p.id,
                dog: p.dog,
                mediaType: p.media_type,
                url: p.url,
                caption: p.caption,
                createdAt: p.created_at,
            }));

            setPosts(loaded);

            const { count: fCount } = await supabase
                .from("follows")
                .select("*", { count: "exact", head: true })
                .eq("dog_id", dogData.id);

            setFollowCount(fCount ?? 0);

            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData.session?.user;

            if (user) {
                setUserId(user.id);

                if (user.id === dogData.owner_id) {
                    setIsOwner(true);
                }

                const { data: followData } = await supabase
                    .from("follows")
                    .select("id")
                    .eq("dog_id", dogData.id)
                    .eq("user_id", user.id)
                    .maybeSingle();

                setIsFollowing(!!followData);;
            }

            setLoading(false);
        }

        void init();
    }, [slug, router]);

    async function handleFollow() {
        if (!userId || !dog) return;

        if (isFollowing) {
            await supabase
                .from("follows")
                .delete()
                .eq("dog_id", dog.id)
                .eq("user_id", userId);

            setIsFollowing(false);
            setFollowCount((prev) => prev - 1);
        } else {
            await supabase
                .from("follows")
                .insert({ dog_id: dog.id, user_id: userId });

            setIsFollowing(true);
            setFollowCount((prev) => prev + 1);
        }
    }

    function handleNewPost(post: MediaPost) {
        setPosts((prev) => [post, ...prev]);
    }

    function handleDelete(id: string) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }

    if (loading || !dog) {
        return (
            <main className="admin-page-body" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "white" }}>Loading...</p>
            </main>
        );
    }

    const dogProp = dog.slug;

    return (
        <main>
            {/* NAV */}
            <nav className="nav">
                <Link href="/" className="nav-brand">
                    Paws<span className="text-green">.</span><span className="text-yellow">.</span>
                </Link>
                <div className="nav-right">
                    <Link href="/" className="nav-back">← Home</Link>
                    {userId && (
                        <Link href="/dashboard" className="nav-back">Dashboard</Link>
                    )}
                    {userId && (
                        <button
                            className="nav-logout-btn"
                            onClick={async () => {
                                await supabase.auth.signOut();
                                router.push("/");
                            }}
                        >
                            Log out
                        </button>
                    )}
                </div>
            </nav>

            {/* HERO */}
            <div className="dog-hero" style={{ background: "var(--dark)" }}>
                <div style={{
                    position: "absolute",
                    width: "300px",
                    height: "300px",
                    borderRadius: "50%",
                    background: dog.colour,
                    opacity: 0.15,
                    top: "-80px",
                    right: "-40px",
                    filter: "blur(60px)",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "5px",
                    background: dog.colour,
                }} />
                <div className="dh-info">
                    <div className="dh-name" style={{ color: dog.colour, textShadow: `0 0 30px ${dog.colour}66` }}>
                        {dog.name}
                    </div>
                    <div className="dh-breed">{dog.breed}</div>
                    {dog.bio && <div className="dh-bio">{dog.bio}</div>}

                    {/* Follow button */}
                    {userId && !isOwner && (
                        <button
                            onClick={handleFollow}
                            style={{
                                marginTop: "1rem",
                                padding: "0.5rem 1.5rem",
                                borderRadius: "50px",
                                border: `2px solid ${dog.colour}`,
                                background: isFollowing ? dog.colour : "transparent",
                                color: isFollowing ? "#000" : dog.colour,
                                fontWeight: 800,
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                fontFamily: "Nunito, sans-serif",
                                transition: "all 0.2s",
                            }}
                        >
                            {isFollowing ? "✓ Following" : "+ Follow"}
                        </button>
                    )}
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                        {followCount} {followCount === 1 ? "follower" : "followers"}
                    </p>
                </div>
            </div>

            {/* TOOLBAR */}
            <div className="toolbar toolbar-dark">
                {isOwner && (
                    <button
                        className="upload-btn"
                        style={{ background: dog.colour, color: "#000" }}
                        onClick={() => setModalOpen(true)}
                    >
                        + Add post
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
                    <p>No posts here yet.</p>
                </div>
            ) : (
                <div>
                    <MediaGallery
                        posts={posts}
                        dog={dogProp}
                        isAdmin={isOwner}
                        onDelete={handleDelete}
                    />
                </div>
            )}

            {/* MODAL */}
            {modalOpen && (
                <UploadModal
                    dog={dogProp}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleNewPost}
                    dogId={dog.id}
                />
            )}
        </main>
    );
}