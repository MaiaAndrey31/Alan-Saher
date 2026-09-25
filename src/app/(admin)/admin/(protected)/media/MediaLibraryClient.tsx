"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { listMedia, type MediaListItem } from "@/app/(admin)/admin/_actions/mediaQueries";
import { deleteMedia } from "@/app/(admin)/admin/_actions/media";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { MEDIA_FOLDERS } from "@/lib/validations/media";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibraryClient({ initialItems }: { initialItems: MediaListItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [folder, setFolder] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const results = await listMedia({ folder, search: search || undefined });
      setItems(results);
    });
  }, [folder, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por descrição…"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        >
          <option value="all">Todas as categorias</option>
          {MEDIA_FOLDERS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Nenhum arquivo encontrado.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <div key={item.id} className="rounded-md border border-neutral-200 bg-white p-2">
              <div className="relative aspect-square overflow-hidden rounded">
                {item.kind === "VIDEO" ? (
                  <video src={item.url} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <Image src={item.url} alt={item.alt ?? ""} fill sizes="200px" className="object-cover" unoptimized />
                )}
              </div>
              <p className="mt-2 truncate text-xs text-neutral-600" title={item.alt ?? ""}>
                {item.alt || "(sem descrição)"}
              </p>
              <p className="text-[11px] text-neutral-400">
                {item.width}×{item.height} · {formatSize(item.sizeBytes)}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.url);
                  }}
                  className="text-[11px] text-neutral-500 hover:text-neutral-900"
                >
                  Copiar URL
                </button>
                <DeleteButton
                  label="Excluir"
                  confirmMessage="Excluir esta imagem?"
                  action={async () => {
                    const result = await deleteMedia(item.id);
                    if (result.ok) setItems((prev) => prev.filter((i) => i.id !== item.id));
                    return result;
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
