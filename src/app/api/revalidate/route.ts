import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

// Yönetim panelinde değişiklik yapınca ana sayfanın beklemeden yenilenmesini sağlar.
// Sadece giriş yapmış bir yönetici çağırabilir.
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const sb = getServerClient(token);
  if (!sb) return NextResponse.json({ ok: false }, { status: 500 });

  const { data: isAdmin, error } = await sb.rpc("is_admin");
  if (error || isAdmin !== true) return NextResponse.json({ ok: false }, { status: 403 });

  revalidatePath("/");
  revalidatePath("/m/[id]", "page");
  return NextResponse.json({ ok: true });
}
