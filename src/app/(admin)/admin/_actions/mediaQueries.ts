"use server";

import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export interface MediaListItem {
  id: string;
  url: string;
  kind: "IMAGE" | "VIDEO" | "DOCUMENT";
  alt: string | null;
  folder: string;
  width: number | null;
  height: number | null;
  sizeBytes: number;
  createdAt: string;
}

export async function listMedia(params: { folder?: string; search?: string; kind?: "IMAGE" | "VIDEO" } = {}): Promise<MediaListItem[]> {
  await requireRole(["ADMIN", "EDITOR"]);

  const rows = await prisma.media.findMany({
    where: {
      ...(params.folder && params.folder !== "all" ? { folder: params.folder } : {}),
      ...(params.kind ? { kind: params.kind } : {}),
      ...(params.search
        ? { OR: [{ alt: { contains: params.search, mode: "insensitive" } }, { title: { contains: params.search, mode: "insensitive" } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return rows.map((row) => ({
    id: row.id,
    url: row.url,
    kind: row.kind,
    alt: row.alt,
    folder: row.folder,
    width: row.width,
    height: row.height,
    sizeBytes: row.sizeBytes,
    createdAt: row.createdAt.toISOString(),
  }));
}
