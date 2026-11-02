"use client";
import { useCallback, useRef, useState } from "react";

export function useToast() {
  const [msg, setMsg] = useState<{ text: string; err: boolean } | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((text: string, err = false) => {
    setMsg({ text, err });
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(null), 2800);
  }, []);
  const node = (
    <div className={`toast${msg ? " on" : ""}${msg?.err ? " err" : ""}`} role="status" aria-live="polite">
      {msg?.text}
    </div>
  );
  return { show, node };
}
