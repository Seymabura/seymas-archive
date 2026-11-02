import Link from "next/link";
import { Mascot } from "@/components/Mascot";

export default function NotFound() {
  return (
    <main className="container">
      <div className="empty">
        <Mascot size={120} mood="sad" />
        <h2>Bu caps arşivde yok</h2>
        <p>Silinmiş ya da bağlantı hatalı olabilir.</p>
        <Link href="/" className="btn btn-primary">Arşive dön</Link>
      </div>
    </main>
  );
}
