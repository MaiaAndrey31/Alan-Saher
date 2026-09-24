"use server";

import { fileTypeFromBuffer } from "file-type";
import { revalidateTag, revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { storage } from "@/lib/storage";
import { CACHE_TAGS } from "@/lib/content/tags";
import { getMediaUsage } from "@/lib/content/media";
import { registerMediaSchema, ALLOWED_IMAGE_MIME_TYPES } from "@/lib/validations/media";

type ActionResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Runs AFTER the browser has already PUT the file's bytes directly to
 * Supabase Storage (bypassing Vercel's body-size limits). This is the real
 * security checkpoint: it re-verifies the object actually exists, re-checks
 * its real size, and sniffs its true magic bytes — never trusting the
 * client's declared Content-Type — before creating the Media row.
 */
export async function registerUploadedMedia(input: unknown): Promise<ActionResult> {
  const user = await requireRole(["ADMIN", "EDITOR"]);

  const parsed = registerMediaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };
  const { path, width, height, alt, folder } = parsed.data;

  const head = await storage.head(path);
  if (!head.exists) return { ok: false, error: "Falha no envio — arquivo não encontrado." };

  // Sniff real magic bytes from the uploaded object — a spoofed
  // Content-Type header on the original PUT request is never trusted.
  const publicUrl = storage.getPublicUrl(path);
  const rangeResponse = await fetch(publicUrl, { headers: { Range: "bytes=0-4100" } }).catch(() => null);
  if (!rangeResponse || !rangeResponse.ok) {
    await storage.delete([path]);
    return { ok: false, error: "Não foi possível validar o arquivo enviado." };
  }
  const buffer = Buffer.from(await rangeResponse.arrayBuffer());
  const sniffed = await fileTypeFromBuffer(buffer);

  if (!sniffed || !ALLOWED_IMAGE_MIME_TYPES.includes(sniffed.mime as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    await storage.delete([path]);
    return { ok: false, error: "Tipo de arquivo não permitido." };
  }

  const media = await prisma.media.create({
    data: {
      bucket: "uploads",
      path,
      url: publicUrl,
      mimeType: sniffed.mime,
      sizeBytes: head.sizeBytes,
      width,
      height,
      alt: alt ?? null,
      folder,
      uploadedById: user.id,
    },
  });

  revalidateTag(CACHE_TAGS.media, "max");
  return { ok: true, id: media.id };
}

export async function updateMediaMeta(id: string, data: { alt?: string; title?: string; folder?: string }) {
  await requireRole(["ADMIN", "EDITOR"]);
  await prisma.media.update({ where: { id }, data });
  revalidateTag(CACHE_TAGS.media, "max");
  revalidateTag(CACHE_TAGS.all, "max");
  revalidatePath("/");
}

export async function deleteMedia(id: string): Promise<{ ok: boolean; error?: string; usedIn?: string[] }> {
  await requireRole(["ADMIN", "EDITOR"]);

  const usage = await getMediaUsage(id);
  if (usage.inUseCount > 0) {
    return { ok: false, error: "Esta imagem está em uso e não pode ser excluída.", usedIn: usage.usedIn };
  }

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return { ok: true };

  await prisma.media.delete({ where: { id } });
  await storage.delete([media.path]);

  revalidateTag(CACHE_TAGS.media, "max");
  return { ok: true };
}
