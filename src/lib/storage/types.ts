export interface UploadTicket {
  provider: "supabase" | "local";
  path: string;
  token: string;
  signedUrl: string;
  maxBytes: number;
  expiresAt: Date;
}

export interface HeadResult {
  exists: boolean;
  sizeBytes: number;
  mimeType: string | null;
}

export interface CreateUploadTicketInput {
  /** Pre-computed, collision-free storage path (see src/lib/storage/paths.ts) — never the raw client filename. */
  path: string;
  contentType: string;
  maxBytes: number;
}

/**
 * Everything the CMS knows about "where files live" goes through this
 * interface — never `fs.writeFile()` scattered through the app. Swapping the
 * active implementation (Supabase Storage today; S3/R2/etc. later) never
 * requires touching a Server Action or admin screen.
 */
export interface StorageProvider {
  createUploadTicket(input: CreateUploadTicketInput): Promise<UploadTicket>;
  head(path: string): Promise<HeadResult>;
  getPublicUrl(path: string): string;
  delete(paths: string[]): Promise<void>;
}
