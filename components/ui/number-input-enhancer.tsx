"use client";

import { useEffect } from "react";

export function NumberInputEnhancer() {
  useEffect(() => {
    function selectNumberValue(target: EventTarget | null) {
      if (!(target instanceof HTMLInputElement) || target.type !== "number") {
        return;
      }

      window.requestAnimationFrame(() => {
        target.select();
      });
    }

    function onFocusIn(event: FocusEvent) {
      selectNumberValue(event.target);
    }

    function onPointerUp(event: PointerEvent) {
      selectNumberValue(event.target);
    }

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("pointerup", onPointerUp);

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  return null;
}
