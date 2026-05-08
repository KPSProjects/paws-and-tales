"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Profile {
    id: string;
    email: string;
    status: string;
    created_at: string;
}

interface Dog {
    id: string;
    name: string;
    slug: string;
    colour: string;
    owner_id: string;
    photo_url: string | null;
}

export default function AdminUsersPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function init() {
            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData.session?.user;

            if (!user) {
                router.push("/admin");
                return;
            }

            const { data: adminProfile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (adminProfile?.role !== "admin") {
                router.push("/admin");
                return;
            }

            const { data: profilesData } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            setProfiles(profilesData ?? []);

            const { data: dogsData } = await supabase
                .from("dogs")
                .select("*")
                .order("created_at", { ascending: false });

            setDogs(dogsData ?? []);
            setLoading(false);
        }

        void init();
    }, [router]);

    async function updateStatus(id: string, status: string) {
        await supabase
            .from("profiles")
            .update({ status })
            .eq("id", id);

        setProfiles((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status } : p))
        );
    }

    async function deleteUser(id: string) {
        // Get all dogs owned by this user
        const { data: userDogs } = await supabase
            .from("dogs")
            .select("id")
            .eq("owner_id", id);

        const dogIds = (userDogs ?? []).map((d) => d.id);

        // For each dog, delete posts, likes, comments, follows
        for (const dogId of dogIds) {
            const { data: postIds } = await supabase
                .from("posts")
                .select("id")
                .eq("dog_id", dogId);

            const ids = (postIds ?? []).map((p) => p.id);

            if (ids.length > 0) {
                await supabase.from("likes").delete().in("post_id", ids);
                await supabase.from("comments").delete().in("post_id", ids);
            }

            await supabase.from("posts").delete().eq("dog_id", dogId);
            await supabase.from("follows").delete().eq("dog_id", dogId);
        }

        // Delete all dogs
        await supabase.from("dogs").delete().eq("owner_id", id);
        // Delete their follows as a follower
        await supabase.from("follows").delete().eq("user_id", id);
        // Delete their likes and comments
        await supabase.from("likes").delete().eq("user_id", id);
        await supabase.from("comments").delete().eq("user_id", id);
        // Delete their profile
        await supabase.from("profiles").delete().eq("id", id);

        // Delete the auth user via API route
        await fetch("/api/delete-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: id }),
        });

        setProfiles((prev) => prev.filter((p) => p.id !== id));
        setDogs((prev) => prev.filter((d) => d.owner_id !== id));
    }

    async function deleteDog(id: string) {
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

    const pending = profiles.filter((p) => p.status === "pending");
    const approved = profiles.filter((p) => p.status === "approved");
    const rejected = profiles.filter((p) => p.status === "rejected");

    return (
        <main className="admin-page-body" style={{ minHeight: "100vh" }}>
            <nav className="nav">
                <Link href="/" className="nav-brand">
                    Paws<span className="text-green">.</span><span className="text-yellow">.</span>
                </Link>
                <div className="nav-right">
                    <Link href="/" className="nav-back">← Home</Link>
                    <Link href="/dashboard" className="nav-back">My Dogs</Link>
                    <button className="nav-logout-btn" onClick={async () => {
                        await supabase.auth.signOut();
                        router.push("/");
                    }}>
                        Log out
                    </button>
                </div>
            </nav>

            <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
                <h1 style={{ color: "white", fontFamily: "Fraunces, serif", marginBottom: "0.5rem" }}>
                    Admin Panel 🐾
                </h1>
                <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
                    Manage users and dogs.
                </p>

                {/* PENDING */}
                <h2 style={{ color: "var(--neon-yellow)", fontFamily: "Fraunces, serif", marginBottom: "1rem" }}>
                    ⏳ Pending ({pending.length})
                </h2>
                {pending.length === 0 && (
                    <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>No pending users.</p>
                )}
                {pending.map((p) => (
                    <div key={p.id} style={{
                        background: "#1a2a12",
                        border: "2px solid var(--neon-yellow)",
                        borderRadius: "12px",
                        padding: "1rem 1.5rem",
                        marginBottom: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                    }}>
                        <div>
                            <p style={{ color: "white", fontWeight: 700, margin: 0 }}>{p.email}</p>
                            <p style={{ color: "var(--muted)", fontSize: "0.75rem", margin: 0 }}>
                                {new Date(p.created_at).toLocaleDateString("en-GB")}
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => updateStatus(p.id, "approved")} style={{
                                padding: "0.5rem 1.25rem", borderRadius: "50px", border: "none",
                                background: "var(--neon-green)", color: "#000", fontWeight: 800,
                                cursor: "pointer", fontSize: "0.85rem",
                            }}>✅ Approve</button>
                            <button onClick={() => updateStatus(p.id, "rejected")} style={{
                                padding: "0.5rem 1.25rem", borderRadius: "50px", border: "none",
                                background: "#ff4d4d", color: "white", fontWeight: 800,
                                cursor: "pointer", fontSize: "0.85rem",
                            }}>❌ Reject</button>
                            <button onClick={() => deleteUser(p.id)} style={{
                                padding: "0.5rem 1.25rem", borderRadius: "50px", border: "none",
                                background: "#800000", color: "white", fontWeight: 800,
                                cursor: "pointer", fontSize: "0.85rem",
                            }}>🗑 Delete</button>
                        </div>
                    </div>
                ))}

                {/* APPROVED */}
                <h2 style={{ color: "var(--neon-green)", fontFamily: "Fraunces, serif", margin: "2rem 0 1rem" }}>
                    ✅ Approved ({approved.length})
                </h2>
                {approved.map((p) => (
                    <div key={p.id} style={{
                        background: "#1a2a12",
                        border: "2px solid var(--neon-green)",
                        borderRadius: "12px",
                        padding: "1rem 1.5rem",
                        marginBottom: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                    }}>
                        <div>
                            <p style={{ color: "white", fontWeight: 700, margin: 0 }}>{p.email}</p>
                            <p style={{ color: "var(--muted)", fontSize: "0.75rem", margin: 0 }}>
                                {new Date(p.created_at).toLocaleDateString("en-GB")}
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => updateStatus(p.id, "rejected")} style={{
                                padding: "0.5rem 1.25rem", borderRadius: "50px", border: "none",
                                background: "#ff4d4d", color: "white", fontWeight: 800,
                                cursor: "pointer", fontSize: "0.85rem",
                            }}>❌ Reject</button>
                            <button onClick={() => deleteUser(p.id)} style={{
                                padding: "0.5rem 1.25rem", borderRadius: "50px", border: "none",
                                background: "#800000", color: "white", fontWeight: 800,
                                cursor: "pointer", fontSize: "0.85rem",
                            }}>🗑 Delete</button>
                        </div>
                    </div>
                ))}

                {/* REJECTED */}
                <h2 style={{ color: "#ff4d4d", fontFamily: "Fraunces, serif", margin: "2rem 0 1rem" }}>
                    ❌ Rejected ({rejected.length})
                </h2>
                {rejected.map((p) => (
                    <div key={p.id} style={{
                        background: "#1a2a12",
                        border: "2px solid #ff4d4d",
                        borderRadius: "12px",
                        padding: "1rem 1.5rem",
                        marginBottom: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                    }}>
                        <div>
                            <p style={{ color: "white", fontWeight: 700, margin: 0 }}>{p.email}</p>
                            <p style={{ color: "var(--muted)", fontSize: "0.75rem", margin: 0 }}>
                                {new Date(p.created_at).toLocaleDateString("en-GB")}
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => updateStatus(p.id, "approved")} style={{
                                padding: "0.5rem 1.25rem", borderRadius: "50px", border: "none",
                                background: "var(--neon-green)", color: "#000", fontWeight: 800,
                                cursor: "pointer", fontSize: "0.85rem",
                            }}>✅ Approve</button>
                            <button onClick={() => deleteUser(p.id)} style={{
                                padding: "0.5rem 1.25rem", borderRadius: "50px", border: "none",
                                background: "#800000", color: "white", fontWeight: 800,
                                cursor: "pointer", fontSize: "0.85rem",
                            }}>🗑 Delete</button>
                        </div>
                    </div>
                ))}

                {/* ALL DOGS */}
                <h2 style={{ color: "white", fontFamily: "Fraunces, serif", margin: "2rem 0 1rem" }}>
                    🐾 All Dogs ({dogs.length})
                </h2>
                {dogs.map((dog) => (
                    <div key={dog.id} style={{
                        background: "#1a2a12",
                        border: `2px solid ${dog.colour}`,
                        borderRadius: "12px",
                        padding: "1rem 1.5rem",
                        marginBottom: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            {dog.photo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={dog.photo_url} alt={dog.name} style={{
                                    width: "40px", height: "40px", borderRadius: "50%",
                                    objectFit: "cover", border: `2px solid ${dog.colour}`,
                                }} />
                            ) : (
                                <div style={{
                                    width: "40px", height: "40px", borderRadius: "50%",
                                    background: `${dog.colour}22`, border: `2px solid ${dog.colour}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>🐾</div>
                            )}
                            <div>
                                <p style={{ color: dog.colour, fontWeight: 800, margin: 0 }}>{dog.name}</p>
                                <p style={{ color: "var(--muted)", fontSize: "0.75rem", margin: 0 }}>/{dog.slug}</p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <Link href={`/dogs/${dog.slug}`} style={{
                                padding: "0.5rem 1.25rem", borderRadius: "50px",
                                background: dog.colour, color: "#000", fontWeight: 800,
                                fontSize: "0.85rem", textDecoration: "none",
                            }}>View →</Link>
                            <button onClick={() => deleteDog(dog.id)} style={{
                                padding: "0.5rem 1.25rem", borderRadius: "50px", border: "none",
                                background: "#800000", color: "white", fontWeight: 800,
                                cursor: "pointer", fontSize: "0.85rem",
                            }}>🗑 Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}