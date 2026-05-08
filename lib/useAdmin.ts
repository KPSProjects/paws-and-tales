import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        async function checkSession() {
            const { data } = await supabase.auth.getSession();
            const user = data.session?.user;
            setIsLoggedIn(!!user);

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                setIsAdmin(profile?.role === "admin");
            }
        }

        checkSession();

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const user = session?.user;
            setIsLoggedIn(!!user);

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                setIsAdmin(profile?.role === "admin");
            } else {
                setIsAdmin(false);
            }
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    return { isAdmin, isLoggedIn };
}