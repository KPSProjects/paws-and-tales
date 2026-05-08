// components/MediaGallery.tsx
"use client";

import { useState } from "react";
import { MediaPost } from "@/types/media";
import PostCard from "@/components/PostCard";

interface Props {
    posts: MediaPost[];
    dog: string;
    isAdmin: boolean;
    onDelete: (id: string) => void;
}

export default function MediaGallery({ posts, dog, isAdmin, onDelete }: Props) {
    const [view, setView] = useState<"grid" | "slideshow">("grid");
    const [slideIndex, setSlideIndex] = useState(0);
    const [lightboxPost, setLightboxPost] = useState<MediaPost | null>(null);

    if (posts.length === 0) {
        return <p className="gallery-empty">No posts yet. Add the first one!</p>;
    }

    return (
        <div className="gallery-wrapper">

            {/* Toggle buttons */}
            <div className="gallery-toggle">
                <button
                    className={`toggle-btn ${view === "grid" ? "active" : ""}`}
                    onClick={() => setView("grid")}
                >
                    Grid
                </button>
                <button
                    className={`toggle-btn ${view === "slideshow" ? "active" : ""}`}
                    onClick={() => setView("slideshow")}
                >
                    Slideshow
                </button>
            </div>

            {/* Grid view */}
            {view === "grid" && (
                <div className="gallery-grid">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            style={{ position: "relative" }}
                        >
                            <PostCard
                                post={post}
                                dog={dog}
                                isAdmin={isAdmin}
                                onDelete={onDelete}
                            />
                            <div
                                className="grid-click-overlay"
                                onClick={() => setLightboxPost(post)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Slideshow view */}
            {view === "slideshow" && (
                <div className="gallery-slideshow">
                    <button
                        className="slide-arrow left"
                        onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
                        disabled={slideIndex === 0}
                    >
                        ‹
                    </button>

                    <PostCard
                        post={posts[slideIndex]}
                        dog={dog}
                        isAdmin={isAdmin}
                        onDelete={onDelete}
                    />

                    <button
                        className="slide-arrow right"
                        onClick={() => setSlideIndex((i) => Math.min(posts.length - 1, i + 1))}
                        disabled={slideIndex === posts.length - 1}
                    >
                        ›
                    </button>

                    <p className="slide-counter">{slideIndex + 1} / {posts.length}</p>
                </div>
            )}

            {/* Lightbox */}
            {lightboxPost && (
                <div
                    className="lightbox-overlay"
                    onClick={() => setLightboxPost(null)}
                >
                    <div
                        className="lightbox-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="lightbox-close"
                            onClick={() => setLightboxPost(null)}
                        >
                            ✕
                        </button>
                        <PostCard
                            post={lightboxPost}
                            dog={dog}
                            isAdmin={isAdmin}
                            onDelete={(id) => {
                                onDelete(id);
                                setLightboxPost(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}