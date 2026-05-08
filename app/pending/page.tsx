"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PendingPage() {
    const router = useRouter();

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/");
    }

    return (
        <main className="admin-page admin-page-body">
            <div className="admin-box" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🐾</div>
                <h1 className="admin-title" style={{ textAlign: "center" }}>
                    You&apos;re on the list!
                </h1>
                <p className="admin-sub" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    Your account is waiting for approval from the admin.
                    You&apos;ll be able to add your dog once approved.
                </p>
                <p className="admin-sub" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    Check back soon! 🐕
                </p>
                <button className="admin-btn" onClick={handleLogout}>
                    Log out
                </button>
            </div>
        </main>
    );
}