import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function checkSession() {
            const { data } = await supabase.auth.getSession();
            setIsAdmin(!!data.session);
        }

        checkSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAdmin(!!session);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    return isAdmin;
}