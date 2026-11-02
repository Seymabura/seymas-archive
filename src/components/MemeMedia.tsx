"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { mediaUrl } from "@/lib/media";
import { isVideo } from "@/lib/text";
import type { Meme } from "@/lib/types";

type Props = { meme: Meme; mode: "thumb" | "full"; playOnHover?: boolean };

export function MemeMedia({ meme, mode, playOnHover }: Props) {
  const [broken, setBroken] = useState(false);
  const src = mediaUrl(meme.storage_path);
  if (broken) return <div className="broken">Görsel yüklenemedi</div>;

  if (isVideo(meme.media_type)) {
    return mode === "full" ? (
      <video src={src} controls autoPlay muted loop playsInline onError={() => setBroken(true)} />
    ) : (
      <video
        src={`${src}#t=0.1`}
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setBroken(true)}
        onMouseEnter={playOnHover ? (e) => e.currentTarget.play().catch(() => {}) : undefined}
        onMouseLeave={playOnHover ? (e) => e.currentTarget.pause() : undefined}
      />
    );
  }
  return (
    <img
      src={src}
      alt={meme.caption ? `${meme.title}: ${meme.caption}` : meme.title}
      width={meme.width ?? undefined}
      height={meme.height ?? undefined}
      loading={mode === "thumb" ? "lazy" : "eager"}
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}
