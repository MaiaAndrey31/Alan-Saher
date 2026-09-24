"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/content/tags";
import { heroSchema, bioSchema } from "@/lib/validations/admin/homepage";
import type { ActionState } from "@/lib/validations/admin/actionState";

export async function updateHeroAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["ADMIN", "EDITOR"]);

  const parsed = heroSchema.safeParse({
    headlineLine1: formData.get("headlineLine1") ?? "",
    headlineLine2: formData.get("headlineLine2") ?? "",
    eyebrowOverride: formData.get("eyebrowOverride") ?? "",
    primaryCtaLabel: formData.get("primaryCtaLabel") ?? "",
    primaryCtaTarget: formData.get("primaryCtaTarget") ?? "",
    secondaryCtaLabel: formData.get("secondaryCtaLabel") ?? "",
    secondaryCtaTarget: formData.get("secondaryCtaTarget") ?? "",
    enableWebgl: formData.get("enableWebgl") === "on",
    backgroundImageId: formData.get("backgroundImageId") ?? "",
  });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;

  await prisma.hero.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      headlineLines: [data.headlineLine1, data.headlineLine2],
      eyebrowOverride: data.eyebrowOverride || null,
      primaryCtaLabel: data.primaryCtaLabel,
      primaryCtaTarget: data.primaryCtaTarget,
      secondaryCtaLabel: data.secondaryCtaLabel,
      secondaryCtaTarget: data.secondaryCtaTarget,
      enableWebgl: data.enableWebgl ?? true,
      backgroundImageId: data.backgroundImageId || null,
    },
    update: {
      headlineLines: [data.headlineLine1, data.headlineLine2],
      eyebrowOverride: data.eyebrowOverride || null,
      primaryCtaLabel: data.primaryCtaLabel,
      primaryCtaTarget: data.primaryCtaTarget,
      secondaryCtaLabel: data.secondaryCtaLabel,
      secondaryCtaTarget: data.secondaryCtaTarget,
      enableWebgl: data.enableWebgl ?? true,
      backgroundImageId: data.backgroundImageId || null,
    },
  });

  revalidateTag(CACHE_TAGS.hero, "max");
  revalidatePath("/");
  return { ok: true };
}

export async function updateBioAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["ADMIN", "EDITOR"]);

  const parsed = bioSchema.safeParse({ bioFull: formData.get("bioFull") ?? "" });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      tagline: "30+ Years. One Sound. Thousands of Stories.",
      originStatement: "From Minas to the World.",
      bioShort: parsed.data.bioFull.slice(0, 200),
      bioFull: parsed.data.bioFull,
    },
    update: { bioFull: parsed.data.bioFull },
  });

  revalidateTag(CACHE_TAGS.site, "max");
  revalidateTag(CACHE_TAGS.presskit, "max");
  revalidatePath("/");
  return { ok: true };
}
