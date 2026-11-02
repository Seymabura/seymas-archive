"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase";
import { CATEGORY_COLUMNS, MEME_COLUMNS } from "@/lib/memes";
import { tagCounts } from "@/lib/text";
import type { Category, Meme } from "@/lib/types";
import { Mascot } from "../Mascot";
import { CategoryManager } from "./CategoryManager";
import { SetupNotice } from "../SetupNotice";
import { useToast } from "../useToast";
import { Uploader } from "./Uploader";
import { Manager } from "./Manager";

type Status = "loading" | "signed-out" | "not-admin" | "ready";

export function AdminApp() {
  const sb = getBrowserClient();
  const [status, setStatus] = useState<Status>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { show: showToast, node: toastNode } = useToast();

  const load = useCallback(async () => {
    if (!sb) return;
    const [m, c] = await Promise.all([
      sb.from("memes").select(MEME_COLUMNS).order("created_at", { ascending: false }).limit(2000),
      sb.from("categories").select(CATEGORY_COLUMNS).order("position").order("name"),
    ]);
    if (m.error) showToast(`Arşiv yüklenemedi: ${m.error.message}`, true);
    else setMemes((m.data ?? []) as Meme[]);
    if (c.error) showToast("Kategoriler yüklenemedi. 002_kategoriler.sql dosyasını Supabase'te çalıştırdın mı?", true);
    else setCategories((c.data ?? []) as Category[]);
  }, [sb, showToast]);

  // Giriş durumunu izle; giriş yapan kişi yönetici mi kontrol et.
  useEffect(() => {
    if (!sb) return;
    const check = async (s: Session | null) => {
      setSession(s);
      if (!s) return setStatus("signed-out");
      const { data } = await sb.rpc("is_admin");
      if (data === true) {
        setStatus("ready");
        load();
      } else setStatus("not-admin");
    };
    sb.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => { check(s); });
    return () => sub.subscription.unsubscribe();
  }, [sb, load]);

  /** Değişiklikten sonra listeyi yenile ve herkese açık sayfayı güncelle. */
  const afterChange = useCallback(async () => {
    await load();
    const token = (await sb?.auth.getSession())?.data.session?.access_token;
    if (token) fetch("/api/revalidate", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  }, [load, sb]);

  if (!sb) return <SetupNotice />;
  if (status === "loading") return <main className="container admin-wrap"><p className="hint">Yükleniyor…</p></main>;
  if (status === "signed-out") return <Login />;
  if (status === "not-admin")
    return (
      <main className="container">
        <div className="panel-card auth-card">
          <h1>Yetkin yok</h1>
          <p>{session?.user.email} hesabı yönetici listesinde değil. <code className="mono">admins</code> tablosuna bu e-postayı eklemen gerekiyor.</p>
          <button className="btn" onClick={() => sb.auth.signOut()}>Çıkış yap</button>
        </div>
      </main>
    );

  const known = tagCounts(memes).map(([t]) => t);
  return (
    <main className="container admin-wrap">
      <div className="admin-head">
        <div>
          <h1 className="chrome-text">Yönetim</h1>
          <p>{memes.length} caps · {categories.length} kategori · {known.length} etiket · {session?.user.email}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-sm">Siteyi gör</Link>
          <button className="btn btn-sm btn-ghost" onClick={() => sb.auth.signOut()}>Çıkış yap</button>
        </div>
      </div>
      <Uploader memes={memes} known={known} categories={categories} onSaved={(m) => { showToast(`Arşive eklendi · No. ${String(m.no).padStart(4, "0")}`); afterChange(); }} />
      <Manager memes={memes} known={known} categories={categories} onChanged={afterChange} toast={showToast} />
      <CategoryManager categories={categories} memes={memes} onChanged={afterChange} toast={showToast} />
      {toastNode}
    </main>
  );
}

function Login() {
  const sb = getBrowserClient()!;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setErr(error.message === "Invalid login credentials" ? "E-posta ya da şifre hatalı." : error.message);
  }

  return (
    <main className="container">
      <form className="panel-card auth-card" onSubmit={submit}>
        <Mascot size={90} track />
        <div>
          <h1>Yönetici girişi</h1>
          <p style={{ marginTop: 8 }}>Caps eklemek ve düzenlemek için giriş yap.</p>
        </div>
        <div className="field">
          <label htmlFor="email">E-posta</label>
          <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Şifre</label>
          <input id="password" className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {err && <div className="err-text" role="alert">{err}</div>}
        <button className="btn btn-primary" disabled={busy}>{busy ? "Giriş yapılıyor…" : "Giriş yap"}</button>
      </form>
    </main>
  );
}
