"use client";
import { useEffect, useId, useRef } from "react";

type Mood = "happy" | "sad" | "wow";
type Props = { size?: number; mood?: Mood; track?: boolean; bob?: boolean; className?: string };

/**
 * Sitenin maskotu: göz bebekleri imleci takip eder, ara sıra göz kırpar.
 * mood: mutlu, üzgün (sonuç yokken) ya da şaşkın.
 */
export function Mascot({ size = 40, mood = "happy", track = false, bob = false, className = "" }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    if (!track) return;
    const svg = ref.current;
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pupils = svg.querySelectorAll<SVGCircleElement>(".pupil");
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = svg.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.45;
        const a = Math.atan2(e.clientY - cy, e.clientX - cx);
        const d = Math.min(1, Math.hypot(e.clientX - cx, e.clientY - cy) / 300);
        const x = Math.cos(a) * 7 * d;
        const y = Math.sin(a) * 7 * d;
        pupils.forEach((p) => (p.style.transform = `translate(${x}px, ${y}px)`));
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [track]);

  const mouth =
    mood === "sad" ? (
      <path d="M86 140 q14 -12 28 0" stroke="#17111f" strokeWidth="6" strokeLinecap="round" fill="none" />
    ) : mood === "wow" ? (
      <ellipse cx="100" cy="138" rx="9" ry="11" fill="#17111f" />
    ) : (
      <path d="M82 130 q18 20 36 0" stroke="#17111f" strokeWidth="6" strokeLinecap="round" fill="none" />
    );

  return (
    <svg
      ref={ref}
      className={`mascot${bob ? " bob" : ""} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      aria-hidden
    >
      <defs>
        <linearGradient id={`b${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8fc4" />
          <stop offset="0.55" stopColor="#ff6ab0" />
          <stop offset="1" stopColor="#c58bff" />
        </linearGradient>
      </defs>
      {/* gövde */}
      <path
        d="M100 12c52 0 84 26 84 84 0 60-32 92-84 92s-84-32-84-92c0-58 32-84 84-84Z"
        fill={`url(#b${uid})`}
      />
      <path d="M52 42c12-12 30-17 46-17" stroke="#fff" strokeOpacity=".45" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* yanaklar */}
      <ellipse cx="54" cy="122" rx="14" ry="8" fill="#ffe066" opacity=".55" />
      <ellipse cx="146" cy="122" rx="14" ry="8" fill="#ffe066" opacity=".55" />
      {/* gözler */}
      {[70, 130].map((x) => (
        <g key={x}>
          <circle cx={x} cy="92" r="21" fill="#fff" />
          <circle className="pupil" cx={x} cy={mood === "sad" ? 98 : 92} r={mood === "wow" ? 8 : 11} fill="#17111f" />
          <circle cx={x + 5} cy="86" r="4" fill="#fff" opacity=".9" />
          <rect className="lid" x={x - 23} y="69" width="46" height="46" rx="23" fill="#ff7bb8" />
          {mood === "sad" && <path d={`M${x - 20} 70 l40 ${x < 100 ? -8 : 8}`} stroke="#17111f" strokeWidth="5" strokeLinecap="round" />}
        </g>
      ))}
      {mouth}
    </svg>
  );
}
