"use client";

import { useEffect, useRef } from "react";

/** Keep keyboard and screen-reader focus with a calculator's view change. */
export default function useStepFocus(step: string, targetId: string) {
  const previousStep = useRef(step);

  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    const target = document.getElementById(targetId);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [step, targetId]);
}
