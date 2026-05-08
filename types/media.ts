// types/media.ts

export type MediaType = "image" | "gif" | "video";

export interface MediaPost {
    id: string;
    dog: string;
    mediaType: MediaType;
    url: string;
    caption: string;
    createdAt: string;
}