import { z } from "zod";

export const heroSchema = z.object({
  headlineLine1: z.string().trim().min(1, "Informe a primeira linha."),
  headlineLine2: z.string().trim().min(1, "Informe a segunda linha."),
  eyebrowOverride: z.string().trim().max(120).optional().or(z.literal("")),
  primaryCtaLabel: z.string().trim().min(1),
  primaryCtaTarget: z.string().trim().min(1),
  secondaryCtaLabel: z.string().trim().min(1),
  secondaryCtaTarget: z.string().trim().min(1),
  enableWebgl: z.boolean().optional(),
  backgroundImageId: z.string().trim().optional().or(z.literal("")),
});

export const bioSchema = z.object({
  bioFull: z.string().trim().min(1, "Informe a biografia completa."),
});
