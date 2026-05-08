"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Dog {
    id: string;
    name: string;
    breed: string;
    bio: string;
    slug: string;
    colour: string;
    created_at: string;
    photo_url: string | null;
}

interface Follow {
    id: string;
    dog_id: string;
    dogs: {
        id: string;
        name: string;
        slug: string;
        colour: string;
        photo_url: string | null;
    };
}

export default function DashboardPage() {
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [follows, setFollows] = useState<Follow[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function init() {
            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData.session?.user;

            if (!user) {
                router.push("/login");
                return;
            }

            const { data: roleProfile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();
            setIsAdmin(roleProfile?.role === "admin");

            const { data: profile } = await supabase
                .from("profiles")
                .select("status")
                .eq("id", user.id)
                .single();

            if (!profile || profile.status !== "approved") {
                router.push("/pending");
                return;
            }

            const { data: dogsData } = await supabase
                .from("dogs")
                .select("*")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: true });

            setDogs(dogsData ?? []);

            const { data: followsData } = await supabase
                .from("follows")
                .select("id, dog_id, dogs(id, name, slug, colour, photo_url)")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            setFollows((followsData as unknown as Follow[]) ?? []);
            setLoading(false);
        }

        void init();
    }, [router]);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/");
    }

    async function handleDeleteDog(id: string) {
        if (!confirm("Are you sure? This will delete the dog and all their posts.")) return;

        const { data: postIds } = await supabase
            .from("posts")
            .select("id")
            .eq("dog_id", id);

        const ids = (postIds ?? []).map((p) => p.id);

        if (ids.length > 0) {
            await supabase.from("likes").delete().in("post_id", ids);
            await supabase.from("comments").delete().in("post_id", ids);
        }

        await supabase.from("posts").delete().eq("dog_id", id);
        await supabase.from("follows").delete().eq("dog_id", id);
        await supabase.from("dogs").delete().eq("id", id);

        setDogs((prev) => prev.filter((d) => d.id !== id));
    }

    if (loading) {
        return (
            <main className="admin-page admin-page-body">
                <p style={{ color: "white" }}>Loading...</p>
            </main>
        );
    }

    return (
        <main className="admin-page-body" style={{ minHeight: "100vh" }}>
            <nav className="nav">
                <Link href="/" className="nav-brand">
                    Paws<span className="text-green">.</span><span className="text-yellow">.</span>
                </Link>
                <div className="nav-right">
                    <Link href="/" className="nav-back">← Home</Link>
                    {isAdmin && (
                        <Link href="/admin/users" className="nav-back">Admin Panel</Link>
                    )}
                    <button className="nav-logout-btn" onClick={handleLogout}>
                        Log out
                    </button>
                </div>
            </nav>

            <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
                <h1 style={{ color: "white", fontFamily: "Fraunces, serif", marginBottom: "0.5rem" }}>
                    Your Dogs 🐾
                </h1>
                <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
                    You can add up to 2 dogs.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                    {dogs.map((dog) => (
                        <div key={dog.id} style={{
                            background: "#1a2a12",
                            border: `2px solid ${dog.colour}`,
                            borderRadius: "16px",
                            padding: "1.5rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                {dog.photo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={dog.photo_url}
                                        alt={dog.name}
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            border: `2px solid ${dog.colour}`,
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: "60px",
                                        height: "60px",
                                        borderRadius: "50%",
                                        background: `${dog.colour}22`,
                                        border: `2px solid ${dog.colour}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1.5rem",
                                    }}>
                                        🐾
                                    </div>
                                )}
                                <div>
                                    <h2 style={{ color: dog.colour, fontFamily: "Fraunces, serif", margin: "0 0 0.25rem" }}>
                                        {dog.name}
                                    </h2>
                                    <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.85rem" }}>
                                        {dog.breed} · /{dog.slug}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                <Link
                                    href={`/dogs/${dog.slug}`}
                                    style={{
                                        padding: "0.5rem 1.25rem",
                                        borderRadius: "50px",
                                        background: dog.colour,
                                        color: "#000",
                                        fontWeight: 800,
                                        fontSize: "0.85rem",
                                        textDecoration: "none",
                                    }}
                                >
                                    View page →
                                </Link>
                                <Link
                                    href={`/dashboard/edit-dog/${dog.id}`}
                                    style={{
                                        padding: "0.5rem 1.25rem",
                                        borderRadius: "50px",
                                        background: "transparent",
                                        border: `2px solid ${dog.colour}`,
                                        color: dog.colour,
                                        fontWeight: 800,
                                        fontSize: "0.85rem",
                                        textDecoration: "none",
                                    }}
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDeleteDog(dog.id)}
                                    style={{
                                        padding: "0.5rem 1.25rem",
                                        borderRadius: "50px",
                                        background: "transparent",
                                        border: "2px solid #ff4d4d",
                                        color: "#ff4d4d",
                                        fontWeight: 800,
                                        fontSize: "0.85rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    🗑 Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {dogs.length < 2 && (
                    <Link href="/dashboard/add-dog" style={{
                        display: "inline-block",
                        padding: "0.75rem 2rem",
                        borderRadius: "50px",
                        background: "var(--neon-green)",
                        color: "#000",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        textDecoration: "none",
                    }}>
                        + Add a dog
                    </Link>
                )}

                {dogs.length >= 2 && (
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        You&apos;ve reached the maximum of 2 dogs.
                    </p>
                )}

                {/* Following section */}
                {follows.length > 0 && (
                    <div style={{ marginTop: "3rem" }}>
                        <h2 style={{ color: "white", fontFamily: "Fraunces, serif", marginBottom: "1rem" }}>
                            Following 🐾
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {follows.map((f) => (
                                <div key={f.id} style={{
                                    background: "#1a2a12",
                                    border: `2px solid ${f.dogs.colour}`,
                                    borderRadius: "12px",
                                    padding: "1rem 1.5rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        {f.dogs.photo_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={f.dogs.photo_url}
                                                alt={f.dogs.name}
                                                style={{
                                                    width: "44px",
                                                    height: "44px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    border: `2px solid ${f.dogs.colour}`,
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: "44px",
                                                height: "44px",
                                                borderRadius: "50%",
                                                background: `${f.dogs.colour}22`,
                                                border: `2px solid ${f.dogs.colour}`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "1.2rem",
                                            }}>
                                                🐾
                                            </div>
                                        )}
                                        <p style={{ color: f.dogs.colour, fontWeight: 800, margin: 0 }}>
                                            {f.dogs.name}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <Link
                                            href={`/dogs/${f.dogs.slug}`}
                                            style={{
                                                padding: "0.4rem 1rem",
                                                borderRadius: "50px",
                                                background: f.dogs.colour,
                                                color: "#000",
                                                fontWeight: 800,
                                                fontSize: "0.8rem",
                                                textDecoration: "none",
                                            }}
                                        >
                                            Visit →
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                await supabase
                                                    .from("follows")
                                                    .delete()
                                                    .eq("id", f.id);
                                                setFollows((prev) => prev.filter((x) => x.id !== f.id));
                                            }}
                                            style={{
                                                padding: "0.4rem 1rem",
                                                borderRadius: "50px",
                                                background: "transparent",
                                                border: "2px solid #ff4d4d",
                                                color: "#ff4d4d",
                                                fontWeight: 800,
                                                fontSize: "0.8rem",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Unfollow
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}