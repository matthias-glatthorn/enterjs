import { computed, signal } from "@angular/core";

export function useReloadIcon() {
  const shouldShowSig = signal(false);
  const shouldShow = computed(() => shouldShowSig());

  function show() {
    shouldShowSig.set(true);
    setTimeout(() => {
      shouldShowSig.set(false);
    }, 500);
  }

  return { shouldShow, show }
}