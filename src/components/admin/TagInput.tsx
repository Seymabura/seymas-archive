"use client";
import { useMemo, useRef, useState } from "react";
import { cleanTag, norm } from "@/lib/text";
import { CloseIcon } from "../Icons";

type Props = { id: string; value: string[]; onChange: (tags: string[]) => void; known: string[] };

/** Etiket girişi: Enter ya da virgülle ekle, Backspace ile son etiketi sil, önerilere tıkla. */
export function TagInput({ id, value, onChange, known }: Props) {
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const next = [...value];
    for (const t of raw.split(",").map(cleanTag).filter(Boolean)) if (!next.includes(t) && next.length < 20) next.push(t);
    onChange(next);
    setDraft("");
  };

  const suggestions = useMemo(() => {
    const q = norm(cleanTag(draft));
    return known.filter((t) => !value.includes(t) && (!q || norm(t).includes(q))).slice(0, 10);
  }, [known, value, draft]);

  return (
    <div className="field" style={{ gap: 10 }}>
      <div className="tagbox" onClick={() => ref.current?.focus()}>
        {value.map((t) => (
          <span key={t} className="tk">
            #{t}
            <button type="button" aria-label={`${t} etiketini kaldır`} onClick={(e) => { e.stopPropagation(); onChange(value.filter((x) => x !== t)); }}>
              <CloseIcon size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          ref={ref}
          value={draft}
          placeholder={value.length ? "" : "şaşkın, kedi, futbol…"}
          autoComplete="off"
          onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (draft.trim()) add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => draft.trim() && add(draft)}
        />
      </div>
      {suggestions.length > 0 && (
        <div className="sugg" aria-label="Önerilen etiketler">
          {suggestions.map((t) => (
            <button type="button" key={t} onMouseDown={(e) => e.preventDefault()} onClick={() => add(t)}>+ {t}</button>
          ))}
        </div>
      )}
    </div>
  );
}
