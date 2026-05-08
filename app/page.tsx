"use client";

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Dog {
    id: string;
    name: string;
    breed: string;
    bio: string;
    slug: string;
    colour: string;
    photo_url: string | null;
}

interface DogWithCount extends Dog {
    postCount: number;
    pawsCount: number;
    bonesCount: number;
}

export default function Home() {
    const [dogs, setDogs] = useState<DogWithCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function init() {
            const { data: dogsData } = await supabase
                .from("dogs")
                .select("*")
                .order("created_at", { ascending: true });

            if (dogsData) {
                const dogsWithCounts = await Promise.all(
                    dogsData.map(async (dog) => {
                        const { count: postCount } = await supabase
                            .from("posts")
                            .select("*", { count: "exact", head: true })
                            .eq("dog_id", dog.id);

                        const { count: pawsCount } = await supabase
                            .from("follows")
                            .select("*", { count: "exact", head: true })
                            .eq("dog_id", dog.id);

                        const { data: postIds } = await supabase
                            .from("posts")
                            .select("id")
                            .eq("dog_id", dog.id);

                        const ids = (postIds ?? []).map((p) => p.id);

                        let bonesCount = 0;
                        if (ids.length > 0) {
                            const { count } = await supabase
                                .from("likes")
                                .select("*", { count: "exact", head: true })
                                .in("post_id", ids);
                            bonesCount = count ?? 0;
                        }

                        return {
                            ...dog,
                            postCount: postCount ?? 0,
                            pawsCount: pawsCount ?? 0,
                            bonesCount,
                        };
                    })
                );
                setDogs(dogsWithCounts);
            }

            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData.session?.user;
            setIsLoggedIn(!!user);
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();
                setIsAdmin(profile?.role === "admin");
            }
            setLoading(false);
        }

        void init();
    }, []);

    return (
        <main>
            {/* NAV */}
            <nav className="nav">
                <div className="nav-brand">
                    Paws<span className="text-green">.</span><span className="text-yellow">.</span>
                </div>
                <div className="nav-right">
                    {isLoggedIn ? (
                        <>
                            <Link
                                href={isAdmin ? "/admin/users" : "/dashboard"}
                                className="nav-back"
                            >
                                {isAdmin ? "Admin Panel" : "Dashboard"}
                            </Link>
                            <button className="nav-logout-btn" onClick={async () => {
                                await supabase.auth.signOut();
                                setIsLoggedIn(false);
                                setIsAdmin(false);
                            }}>
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="nav-back">Log in</Link>
                            <Link href="/signup" className="nav-dog-btn active-green">Join</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* HERO BANNER */}
            <div className="hero-banner">
                <span className="paw p1">🐾</span>
                <span className="paw p2">🐾</span>
                <span className="paw p3">🐾</span>
                <span className="paw p4">🐾</span>
                <span className="paw p5">🐾</span>
                <span className="paw p6">🐾</span>
                <span className="paw p7">🐾</span>
                <span className="paw p8">🐾</span>
                <span className="paw p9">🐾</span>
                <span className="paw p10">🐾</span>
                <span className="paw p11">🐾</span>
                <h1>
                    Paws <em>&amp; Tales</em>
                </h1>
                <p>A home for dogs. Pick your pup 🐾</p>
            </div>

            {/* CARDS */}
            <section className="cards-section">
                <p className="section-label">Meet the dogs</p>

                {loading && (
                    <p style={{ color: "var(--muted)", fontWeight: 700 }}>Loading dogs...</p>
                )}

                {!loading && dogs.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🐾</div>
                        <h4>No dogs yet!</h4>
                        <p>Be the first to join and add your dog.</p>
                    </div>
                )}

                <div className="cards-row">
                    {dogs.map((dog) => (
                        <Link
                            key={dog.id}
                            href={`/dogs/${dog.slug}`}
                            className="dog-card"
                            style={{ borderColor: "var(--border)" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = dog.colour;
                                e.currentTarget.style.boxShadow = `0 30px 60px ${dog.colour}40`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "var(--border)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            <div className="card-photo-wrap">
                                {dog.photo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={dog.photo_url}
                                        alt={dog.name}
                                        className="card-real-img"
                                    />
                                ) : (
                                    <div className="card-placeholder" style={{
                                        background: `linear-gradient(145deg, ${dog.colour}22, ${dog.colour}44)`,
                                        fontSize: "5rem",
                                    }}>
                                        🐾
                                    </div>
                                )}
                            </div>

                            <div className="colour-strip" style={{ background: dog.colour }} />

                            <div className="card-body">
                                <div className="card-top">
                                    <div className="card-name">{dog.name}</div>
                                    <div className="cbadge" style={{
                                        background: `${dog.colour}22`,
                                        color: dog.colour,
                                    }}>
                                        {dog.breed}
                                    </div>
                                </div>

                                <div className="card-stats">
                                    <div className="cstat">
                                        <span className="cstat-num">{dog.postCount}</span>
                                        <span className="cstat-lbl">Posts</span>
                                    </div>
                                    <div className="cstat">
                                        <span className="cstat-num" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
                                            {dog.pawsCount}
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="/photos/icons/paw-icon-likes.png" alt="paw" style={{ width: "18px", height: "18px", objectFit: "contain" }} />
                                        </span>
                                        <span className="cstat-lbl">Paws</span>
                                    </div>
                                    <div className="cstat">
                                        <span className="cstat-num" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
                                            {dog.bonesCount}
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="/photos/icons/treat-icon.png" alt="treat" style={{ width: "18px", height: "18px", objectFit: "contain" }} />
                                        </span>
                                        <span className="cstat-lbl">Treats</span>
                                    </div>
                                </div>

                                {dog.bio && (
                                    <div className="card-desc">{dog.bio}</div>
                                )}

                                <div className="card-cta" style={{
                                    background: dog.colour,
                                    color: "#000",
                                }}>
                                    Visit {dog.name}&apos;s page →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="site-footer">
                Made with 🐾 love · Paws &amp; Tales ·{" "}
                <Link href="/signup" style={{ color: "var(--neon-green)" }}>
                    Join us
                </Link>
            </footer>
        </main>
    )
}