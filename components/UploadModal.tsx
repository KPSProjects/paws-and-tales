// components/UploadModal.tsx
"use client";

import { useState, useRef } from "react";
import { MediaPost, MediaType } from "@/types/media";
import { supabase } from "@/lib/supabase";

interface Props {
    dog: string;
    dogId?: string;
    onClose: () => void;
    onSubmit: (post: MediaPost) => void;
}

export default function UploadModal({ dog, dogId, onClose, onSubmit }: Props) {
    const [caption, setCaption] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<MediaType>("image");
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const picked = e.target.files?.[0];
        if (!picked) return;

        if (picked.type.startsWith("video/")) setMediaType("video");
        else if (picked.type === "image/gif") setMediaType("gif");
        else setMediaType("image");

        setFile(picked);
        setPreview(URL.createObjectURL(picked));
    }

    async function handleSubmit() {
        if (!file || !preview) return;
        setUploading(true);

        // 1. Upload file to Supabase Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${dog}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("post-media")
            .upload(fileName, file);

        if (uploadError) {
            console.error("Upload failed:", uploadError.message);
            setUploading(false);
            return;
        }

        // 2. Get the public URL
        const { data: urlData } = supabase.storage
            .from("post-media")
            .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        // 3. Get current user
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;
        console.log("User ID:", userId); // DEBUG
        console.log("Dog ID:", dogId); // DEBUG

        // 4. Save post to database
        const { data, error } = await supabase
            .from("posts")
            .insert({
                dog,
                dog_id: dogId ?? null,
                owner_id: userId ?? null,
                media_type: mediaType,
                url: publicUrl,
                caption,
            })
            .select()
            .single();

        if (error) {
            console.error("Failed to save post:", error.message);
            setUploading(false);
            return;
        }

        const newPost: MediaPost = {
            id: data.id,
            dog: data.dog,
            mediaType: data.media_type,
            url: data.url,
            caption: data.caption,
            createdAt: data.created_at,
        };

        onSubmit(newPost);
        onClose();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-box ${dog === "szogun" ? "border-green" : "border-yellow"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close" onClick={onClose}>x</button>
                <h2 className="modal-title">
                    New Post for {dog === "nela" ? "Nela" : dog === "szogun" ? "Szogun" : dog}
                </h2>

                <div className="modal-upload-area" onClick={() => fileRef.current?.click()}>
                    {preview ? (
                        mediaType === "video" ? (
                            <video src={preview} className="modal-preview" controls />
                        ) : (
                            <img src={preview} alt="preview" className="modal-preview" />
                        )
                    ) : (
                        <p>Click to choose a photo, GIF, or video</p>
                    )}
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,video/*"
                        style={{ display: "none" }}
                        onChange={handleFile}
                    />
                </div>

                <textarea
                    className="modal-caption"
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                />

                <button
                    className={`modal-submit dog-${dog}`}
                    onClick={handleSubmit}
                    disabled={!file || uploading}
                >
                    {uploading ? "Uploading..." : "Post it!"}
                </button>
            </div>
        </div>
    );
}