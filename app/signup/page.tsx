"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, "_");

        // Check username is unique
        const { data: existingUsername } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", cleanUsername)
            .single();

        if (existingUsername) {
            setError("That username is already taken. Try another!");
            setLoading(false);
            return;
        }

        // Create auth account
        const { data, error: signupError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signupError) {
            setError(signupError.message);
            setLoading(false);
            return;
        }

        if (!data.user) {
            setError("Something went wrong.");
            setLoading(false);
            return;
        }

        // Check if profile already exists
        const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id, status")
            .eq("id", data.user.id)
            .single();

        if (existingProfile) {
            if (existingProfile.status === "approved") {
                router.push("/dashboard");
            } else {
                router.push("/pending");
            }
            return;
        }

        // Create profile with username
        const { error: profileError } = await supabase
            .from("profiles")
            .insert({
                id: data.user.id,
                email: email,
                username: cleanUsername,
                status: "pending",
            });

        if (profileError) {
            setError("Account created but profile setup failed.");
            setLoading(false);
            return;
        }

        router.push("/pending");
    }

    return (
        <main className="admin-page admin-page-body">
            <div className="admin-box">
                <h1 className="admin-title">🐾 Join Paws & Tales</h1>
                <p className="admin-sub">Create an account to share your dog.</p>

                <form onSubmit={handleSignup} className="admin-form">
                    <input
                        className="admin-input"
                        type="text"
                        placeholder="Username (e.g. dogdad99)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        minLength={3}
                        maxLength={20}
                    />
                    <p style={{ color: "var(--muted)", fontSize: "0.8rem", margin: 0 }}>
                        3-20 characters. Letters, numbers and underscores only.
                    </p>
                    <input
                        className="admin-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="admin-input"
                        type="password"
                        placeholder="Password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    {error && <p className="admin-error">{error}</p>}
                    <button className="admin-btn" type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Sign up"}
                    </button>
                </form>

                <p className="admin-sub" style={{ textAlign: "center", marginTop: "1rem" }}>
                    Already have an account?{" "}
                    <Link href="/login" style={{ color: "var(--neon-green)" }}>
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
}