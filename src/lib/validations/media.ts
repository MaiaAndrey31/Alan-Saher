import { z } from "zod";

// SVG deliberately excluded — accepting user-uploaded SVG safely requires
// server-side sanitization (embedded <script>/event-handler payloads); out
// of scope for v1, simplest-safe choice per the brief's own caution.
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB — generous for straight-off-camera photos

export const MEDIA_FOLDERS = [
  "hero",
  "story",
  "stages",
  "narrative",
  "experience",
  "gallery",
  "releases",
  "press",
  "presskit",
  "shows",
  "general",
] as const;

export const signUploadSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  contentType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_IMAGE_BYTES),
  folder: z.enum(MEDIA_FOLDERS).default("general"),
});

export const registerMediaSchema = z.object({
  path: z.string().trim().min(1),
  mimeType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().trim().max(300).optional(),
  folder: z.enum(MEDIA_FOLDERS).default("general"),
});
