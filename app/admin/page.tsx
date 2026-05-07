"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError("Wrong email or password.");
            setLoading(false);
            return;
        }

        router.push("/");
    }

    return (
        <main className="admin-page">
            <div className="admin-box">
                <h1 className="admin-title">🐾 Admin Login</h1>
                <p className="admin-sub">Only the owner can post here.</p>

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
            </div>
        </main>
    );
}