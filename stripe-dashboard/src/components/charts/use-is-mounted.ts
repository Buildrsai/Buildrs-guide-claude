"use client";

import { useEffect, useState } from "react";

/** Recharts measures its container; render charts only after mount. */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
