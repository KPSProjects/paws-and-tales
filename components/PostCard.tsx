// components/PostCard.tsx
"use client";

import { useState } from "react";
import { MediaPost } from "@/types/media";
import { supabase } from "@/lib/supabase";

interface Props {
    post: MediaPost;
    dog: "nela" | "szogun";
    isAdmin: boolean;
    onDelete?: (id: string) => void;
}

export default function PostCard({ post, dog, isAdmin, onDelete }: Props) {
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        if (!confirming) {
            setConfirming(true);
            return;
        }

        setDeleting(true);

        // 1. Delete from database
        const { error } = await supabase
            .from("posts")
            .delete()
            .eq("id", post.id);

        if (error) {
            console.error("Failed to delete post:", error.message);
            setDeleting(false);
            return;
        }

        // 2. Tell the parent to remove it from the list
        onDelete?.(post.id);
    }

    return (
        <div className={`post-card dog-${dog}-card`}>
            {/* Media */}
            {post.mediaType === "video" ? (
                <video
                    src={post.url}
                    className="post-card-media"
                    controls
                />
            ) : (
                <img
                    src={post.url}
                    alt={post.caption || "Post image"}
                    className="post-card-media"
                />
            )}

            {/* Caption */}
            {post.caption && (
                <p className="post-card-caption">{post.caption}</p>
            )}

            {/* Date */}
            <span className="post-card-date">
                {new Date(post.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                })}
            </span>

            {/* Delete button — admin only */}
            {isAdmin && (
                <button
                    className={`post-delete-btn ${confirming ? "confirming" : ""}`}
                    onClick={handleDelete}
                    disabled={deleting}
                >
                    {deleting ? "Deleting..." : confirming ? "Sure? Click again" : "🗑 Delete"}
                </button>
            )}
        </div>
    );
}