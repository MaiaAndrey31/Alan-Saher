"use client";

import { useState } from "react";
import { TextField, ToggleField, SaveButton } from "@/components/admin/fields";
import { MediaPickerField, type MediaValue } from "@/components/admin/MediaPickerField";
import { useSavedFeedback } from "@/components/admin/useSavedFeedback";
import { updateHeroAction } from "@/app/(admin)/admin/_actions/homepage";

export interface HeroFormValues {
  headlineLine1?: string;
  headlineLine2?: string;
  eyebrowOverride?: string;
  primaryCtaLabel?: string;
  primaryCtaTarget?: string;
  secondaryCtaLabel?: string;
  secondaryCtaTarget?: string;
  enableWebgl?: boolean;
  background?: MediaValue | null;
}

export function HeroForm({ initialValues }: { initialValues: HeroFormValues }) {
  const { state, formAction, showSaved } = useSavedFeedback(updateHeroAction);
  const [background, setBackground] = useState<MediaValue | null>(initialValues.background ?? null);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <MediaPickerField label="Imagem do Hero" folder="hero" aspect="aspect-video" value={background} onChange={setBackground} required />
      <input type="hidden" name="backgroundImageId" value={background?.id ?? ""} />

      <div className="grid grid-cols-2 gap-4">
        <TextField label="Título — linha 1" name="headlineLine1" required defaultValue={initialValues.headlineLine1} error={state.fieldErrors?.headlineLine1?.[0]} />
        <TextField label="Título — linha 2" name="headlineLine2" required defaultValue={initialValues.headlineLine2} error={state.fieldErrors?.headlineLine2?.[0]} />
      </div>

      <TextField
        label="Funções exibidas (opcional)"
        name="eyebrowOverride"
        defaultValue={initialValues.eyebrowOverride}
        placeholder="Ex.: DJ · Producer · Entertainer"
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField label="Texto do CTA principal" name="primaryCtaLabel" required defaultValue={initialValues.primaryCtaLabel ?? "Explore"} />
        <TextField label="Destino do CTA principal" name="primaryCtaTarget" required defaultValue={initialValues.primaryCtaTarget ?? "story"} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Texto do CTA secundário" name="secondaryCtaLabel" required defaultValue={initialValues.secondaryCtaLabel ?? "Booking"} />
        <TextField label="Destino do CTA secundário" name="secondaryCtaTarget" required defaultValue={initialValues.secondaryCtaTarget ?? "booking"} />
      </div>

      <ToggleField
        label="Efeito 3D no Hero (WebGL)"
        name="enableWebgl"
        defaultChecked={initialValues.enableWebgl ?? true}
        hint="Desative para remover o efeito interativo sutil na foto do Hero (desktop apenas)."
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex items-center gap-4">
        <SaveButton />
        {showSaved && <span className="text-sm text-green-600">Alterações salvas.</span>}
      </div>
    </form>
  );
}
