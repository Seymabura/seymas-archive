import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

// Her ziyarette arşivden rastgele bir caps'e yönlendirir.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sb = getServerClient();
  const home = new URL("/", req.url);
  if (!sb) return NextResponse.redirect(home);
  const { data } = await sb.from("memes").select("id").limit(2000);
  if (!data?.length) return NextResponse.redirect(home);
  const pick = data[Math.floor(Math.random() * data.length)] as { id: string };
  return NextResponse.redirect(new URL(`/m/${pick.id}`, req.url));
}
