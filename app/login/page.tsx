"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (loginError || !data.user) {
            setError("Wrong email or password.");
            setLoading(false);
            return;
        }

        // Check profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("status, role")
            .eq("id", data.user.id)
            .single();

        if (!profile) {
            setError("Profile not found.");
            setLoading(false);
            return;
        }

        // Admin goes straight to admin panel
        if (profile.role === "admin") {
            router.push("/admin/users");
            return;
        }

        if (profile.status === "pending") {
            router.push("/pending");
            return;
        }

        if (profile.status === "rejected") {
            setError("Your account has been rejected.");
            setLoading(false);
            return;
        }

        // Approved — go to dashboard
        router.push("/dashboard");
    }

    return (
        <main className="admin-page admin-page-body">
            <div className="admin-box">
                <h1 className="admin-title">🐾 Welcome back!</h1>
                <p className="admin-sub">Log in to manage your dog&apos;s page.</p>

                <form onSubmit={handleLogin} className="admin-form">
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
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="admin-error">{error}</p>}
                    <button className="admin-btn" type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <p className="admin-sub" style={{ textAlign: "center", marginTop: "1rem" }}>
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" style={{ color: "var(--neon-green)" }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    );
}