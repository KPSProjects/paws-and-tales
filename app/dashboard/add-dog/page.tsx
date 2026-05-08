"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const COLOUR_OPTIONS = [
    { label: "Neon Green", value: "#39FF14" },
    { label: "Neon Yellow", value: "#FFE600" },
    { label: "Neon Pink", value: "#FF6EC7" },
    { label: "Neon Blue", value: "#00FFFF" },
    { label: "Neon Orange", value: "#FF6600" },
    { label: "Neon Purple", value: "#BF00FF" },
];

export default function AddDogPage() {
    const [name, setName] = useState("");
    const [breed, setBreed] = useState("");
    const [bio, setBio] = useState("");
    const [colour, setColour] = useState("#39FF14");
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        async function check() {
            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData.session?.user;
            if (!user) { router.push("/login"); return; }
            const { data: profile } = await supabase
                .from("profiles")
                .select("status")
                .eq("id", user.id)
                .single();
            if (!profile || profile.status !== "approved") router.push("/pending");
        }
        void check();
    }, [router]);

    function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;
        if (!user) { router.push("/login"); return; }

        // Check dog limit
        const { count } = await supabase
            .from("dogs")
            .select("*", { count: "exact", head: true })
            .eq("owner_id", user.id);

        if ((count ?? 0) >= 2) {
            setError("You already have 2 dogs — the maximum allowed.");
            setLoading(false);
            return;
        }

        // Generate slug
        const slug = name.toLowerCase().trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");

        // Check slug is unique
        const { data: existing } = await supabase
            .from("dogs")
            .select("id")
            .eq("slug", slug)
            .single();

        if (existing) {
            setError("A dog with this name already exists. Try a different name.");
            setLoading(false);
            return;
        }

        // Upload photo if provided
        let photoUrl = null;
        if (photo) {
            const fileExt = photo.name.split(".").pop();
            const fileName = `dogs/${slug}-${crypto.randomUUID()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("post-media")
                .upload(fileName, photo);

            if (uploadError) {
                setError("Photo upload failed. Please try again.");
                setLoading(false);
                return;
            }

            const { data: urlData } = supabase.storage
                .from("post-media")
                .getPublicUrl(fileName);

            photoUrl = urlData.publicUrl;
        }

        // Insert dog
        const { error: insertError } = await supabase
            .from("dogs")
            .insert({
                owner_id: user.id,
                name,
                breed,
                bio,
                slug,
                colour,
                photo_url: photoUrl,
            });

        if (insertError) {
            setError("Failed to add dog. Please try again.");
            setLoading(false);
            return;
        }

        router.push("/dashboard");
    }

    return (
        <main className="admin-page-body" style={{ minHeight: "100vh" }}>
            <nav className="nav">
                <Link href="/" className="nav-brand">
                    Paws<span className="text-green">.</span><span className="text-yellow">.</span>
                </Link>
                <div className="nav-right">
                    <Link href="/dashboard" className="nav-back">← Dashboard</Link>
                </div>
            </nav>

            <div style={{ padding: "2rem", maxWidth: "560px", margin: "0 auto" }}>
                <h1 style={{ color: "white", fontFamily: "Fraunces, serif", marginBottom: "0.5rem" }}>
                    Add your dog 🐾
                </h1>
                <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
                    Fill in your dog&apos;s details to create their page.
                </p>

                <form onSubmit={handleSubmit} className="admin-form">
                    <input
                        className="admin-input"
                        type="text"
                        placeholder="Dog's name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        className="admin-input"
                        type="text"
                        placeholder="Breed (e.g. Labrador, Schnauzer Mix)"
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                        required
                    />
                    <textarea
                        className="admin-input modal-caption"
                        placeholder="Bio — tell us about your dog!"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                    />

                    {/* Photo upload */}
                    <div>
                        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                            Profile photo:
                        </p>
                        <div
                            className="modal-upload-area"
                            onClick={() => fileRef.current?.click()}
                            style={{ minHeight: "140px" }}
                        >
                            {photoPreview ? (
                                <img src={photoPreview} alt="preview" style={{
                                    width: "100%",
                                    maxHeight: "200px",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                }} />
                            ) : (
                                <p>Click to upload a profile photo</p>
                            )}
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handlePhoto}
                            />
                        </div>
                    </div>

                    {/* Colour picker */}
                    <div>
                        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                            Pick your dog&apos;s colour:
                        </p>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {COLOUR_OPTIONS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColour(c.value)}
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "50%",
                                        background: c.value,
                                        border: colour === c.value ? "3px solid white" : "3px solid transparent",
                                        cursor: "pointer",
                                        transition: "border 0.2s",
                                    }}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>

                    {error && <p className="admin-error">{error}</p>}

                    <button className="admin-btn" type="submit" disabled={loading}>
                        {loading ? "Adding dog..." : "Add dog 🐾"}
                    </button>
                </form>
            </div>
        </main>
    );
}