"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { ActionState } from "@/lib/validations/admin/actionState";

/** Wraps useActionState for singleton settings forms that stay on the page after saving — surfaces a transient "Alterações salvas." confirmation instead of navigating away. */
export function useSavedFeedback(action: (prev: ActionState, formData: FormData) => Promise<ActionState>) {
  const [state, formAction, isPending] = useActionState(action, { ok: true });
  const isFirstRender = useRef(true);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isPending) {
      // Deferred (not called synchronously in the effect body) — both
      // setState calls happen from a timer callback, satisfying the
      // "don't setState directly in an effect" rule while still reacting
      // to the action's completion.
      const showTimeout = setTimeout(() => setShowSaved(state.ok), 0);
      const hideTimeout = setTimeout(() => setShowSaved(false), 3000);
      return () => {
        clearTimeout(showTimeout);
        clearTimeout(hideTimeout);
      };
    }
  }, [state, isPending]);

  return { state, formAction, isPending, showSaved };
}
