"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { registerUploadedMedia } from "@/app/(admin)/admin/_actions/media";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "@/lib/validations/media";

export interface UploadResult {
  ok: boolean;
  mediaId?: string;
  url?: string;
  error?: string;
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Não foi possível ler a imagem."));
    };
    img.src = objectUrl;
  });
}

/** Client-side fast-feedback checks only — the real security boundary is server-side (see registerUploadedMedia). */
function validateClientSide(file: File): string | null {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return "Formato não suportado. Use JPG, PNG, WEBP ou AVIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `Arquivo muito grande (máx. ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB).`;
  }
  return null;
}

export async function uploadFile(
  file: File,
  folder: string,
  alt?: string
): Promise<UploadResult> {
  const clientError = validateClientSide(file);
  if (clientError) return { ok: false, error: clientError };

  let dimensions: { width: number; height: number };
  try {
    dimensions = await readImageDimensions(file);
  } catch {
    return { ok: false, error: "Não foi possível ler a imagem." };
  }

  const signRes = await fetch("/api/admin/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, sizeBytes: file.size, folder }),
  });
  if (!signRes.ok) return { ok: false, error: "Falha ao preparar o envio." };
  const ticket = (await signRes.json()) as {
    ok: boolean;
    provider: "supabase" | "local";
    path: string;
    token: string;
    signedUrl: string;
  };

  if (ticket.provider === "supabase") {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.storage.from("uploads").uploadToSignedUrl(ticket.path, ticket.token, file);
    if (error) return { ok: false, error: "Falha no envio do arquivo." };
  } else {
    const putRes = await fetch(ticket.signedUrl, { method: "PUT", body: file });
    if (!putRes.ok) return { ok: false, error: "Falha no envio do arquivo." };
  }

  const result = await registerUploadedMedia({
    path: ticket.path,
    mimeType: file.type,
    width: dimensions.width,
    height: dimensions.height,
    alt,
    folder,
  });

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, mediaId: result.id };
}
