# Seyma's Archive

Türk internetinin caps arşivi. Etiketli, numaralı ve aranabilir caps koleksiyonu.

**Teknolojiler:** Next.js 15 · React 19 · TypeScript · Supabase (PostgreSQL + Storage + Auth) · Vercel

## Özellikler

- Türkçe karakterden bağımsız anlık arama (başlık, etiket ve görseldeki yazı)
- Çoklu etiket filtresi, sıralama, klavye kısayolları (`/` arama, `←` `→` gezinme, `Esc` kapat)
- Her caps için paylaşılabilir sayfa ve X (Twitter) büyük görsel kartı
- Yönetim paneli: sürükle-bırak ya da panodan yapıştırarak yükleme, etiket önerileri, düzenleme, silme
- SHA-256 parmak izi ile kopya içerik engelleme
- Veritabanı seviyesinde yetkilendirme (Row Level Security)

## Çalıştırma

```bash
cp .env.example .env.local   # Supabase bilgilerini doldur
npm install
npm run dev
```

Kurulumun tamamı için: [KURULUM.md](./KURULUM.md)
