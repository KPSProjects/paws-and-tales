// components/PostCard.tsx
"use client";

import { useState, useEffect } from "react";
import { MediaPost } from "@/types/media";
import { supabase } from "@/lib/supabase";

interface Props {
    post: MediaPost;
    dog: string;
    isAdmin: boolean;
    onDelete?: (id: string) => void;
}

interface Comment {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    username?: string;
}

export default function PostCard({ post, dog, isAdmin, onDelete }: Props) {
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        async function loadData() {
            // Get current user
            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData.session?.user;
            setUserId(user?.id ?? null);

            // Load likes count
            const { count: likeCount } = await supabase
                .from("likes")
                .select("*", { count: "exact", head: true })
                .eq("post_id", post.id);

            setLikes(likeCount ?? 0);

            // Check if current user liked this post
            if (user) {
                const { data: userLike } = await supabase
                    .from("likes")
                    .select("id")
                    .eq("post_id", post.id)
                    .eq("user_id", user.id)
                    .maybeSingle();

                setLiked(!!userLike);
            }

            // Load comments with usernames
            const { data: commentsData } = await supabase
                .from("comments")
                .select("*, profiles(username)")
                .eq("post_id", post.id)
                .order("created_at", { ascending: true });

            const commentsWithUsernames = (commentsData ?? []).map((c) => ({
                ...c,
                username: c.profiles?.username ?? "user",
            }));

            setComments(commentsWithUsernames);
        }

        void loadData();
    }, [post.id]);

    async function handleLike() {
        if (!userId) return;

        if (liked) {
            await supabase
                .from("likes")
                .delete()
                .eq("post_id", post.id)
                .eq("user_id", userId);

            setLikes((prev) => prev - 1);
            setLiked(false);
        } else {
            await supabase
                .from("likes")
                .insert({ post_id: post.id, user_id: userId });

            setLikes((prev) => prev + 1);
            setLiked(true);
        }
    }

    async function handleComment() {
        if (!userId || !newComment.trim()) return;
        setSubmittingComment(true);

        const { data, error } = await supabase
            .from("comments")
            .insert({
                post_id: post.id,
                user_id: userId,
                content: newComment.trim(),
            })
            .select()
            .single();

        if (!error && data) {
            setComments((prev) => [...prev, data]);
            setNewComment("");
        }

        setSubmittingComment(false);
    }

    async function handleDeleteComment(commentId: string) {
        await supabase
            .from("comments")
            .delete()
            .eq("id", commentId);

        setComments((prev) => prev.filter((c) => c.id !== commentId));
    }

    async function handleDelete() {
        if (!confirming) {
            setConfirming(true);
            return;
        }

        setDeleting(true);

        const { error } = await supabase
            .from("posts")
            .delete()
            .eq("id", post.id);

        if (error) {
            console.error("Failed to delete post:", error.message);
            setDeleting(false);
            return;
        }

        onDelete?.(post.id);
    }

    return (
        <div className={`post-card dog-${dog}-card`}>
            {/* Media */}
            {post.mediaType === "video" ? (
                <video src={post.url} className="post-card-media" controls />
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
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

            {/* Likes & Comments bar */}
            <div className="post-actions">
                <button
                    className={`post-like-btn ${liked ? "liked" : ""}`}
                    onClick={handleLike}
                    disabled={!userId}
                    title={!userId ? "Log in to like" : ""}
                >
                    {liked ? "🫙" : "🫙"} {likes}
                </button>

                <button
                    className="post-comment-btn"
                    onClick={() => setShowComments(!showComments)}
                >
                    💬 {comments.length}
                </button>
            </div>

            {/* Comments section */}
            {showComments && (
                <div className="post-comments">
                    {comments.length === 0 && (
                        <p className="no-comments">No comments yet.</p>
                    )}
                    {comments.map((c) => (
                        <div key={c.id} className="comment">
                            <p className="comment-content">
                            <span style={{ color: "var(--neon-green)", fontWeight: 800, marginRight: "0.4rem" }}>
                            @{c.username}
                            </span>
                                {c.content}
                            </p>
                            {(isAdmin || c.user_id === userId) && (
                                <button
                                    className="comment-delete"
                                    onClick={() => handleDeleteComment(c.id)}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add comment */}
                    {userId ? (
                        <div className="comment-input-row">
                            <input
                                className="comment-input"
                                type="text"
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") void handleComment();
                                }}
                            />
                            <button
                                className="comment-submit"
                                onClick={() => void handleComment()}
                                disabled={submittingComment || !newComment.trim()}
                            >
                                Post
                            </button>
                        </div>
                    ) : (
                        <p className="no-comments">
                            <a href="/login" style={{ color: "var(--neon-green)" }}>Log in</a> to comment.
                        </p>
                    )}
                </div>
            )}

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