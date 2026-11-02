import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container">
      <div className="empty">
        <div className="empty-art" aria-hidden><i /><i /><i /></div>
        <h2>Bu caps arşivde yok</h2>
        <p>Silinmiş ya da bağlantı hatalı olabilir.</p>
        <Link href="/" className="btn btn-neon">Arşive dön</Link>
      </div>
    </main>
  );
}
