// types/media.ts

export type MediaType = "image" | "gif" | "video";

export interface MediaPost {
    id: string;
    dog: "nela" | "szogun";
    mediaType: MediaType;
    url: string;        // temporary local blob URL from the file picker
    caption: string;
    createdAt: string;  // ISO date string
}