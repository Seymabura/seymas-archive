# Seyma's Archive — Kurulum Rehberi

Bu rehberi baştan sona bir kez yapman yeterli. Toplam süre yaklaşık 20-30 dakika.
Hepsi ücretsiz.

---

## 1. Supabase (veritabanı ve görsel deposu)

1. [supabase.com](https://supabase.com) adresine gir, **Start your project** de ve GitHub hesabınla giriş yap.
2. **New project** oluştur:
   - Name: `seymas-archive`
   - Database Password: güçlü bir şifre seç ve bir yere not et
   - Region: **Central EU (Frankfurt)** (Türkiye'ye en yakın)
3. Proje açılınca soldaki menüden **SQL Editor** → **New query**.
4. Bu klasördeki `supabase/schema.sql` dosyasının **tamamını** kopyala, yapıştır ve **Run** de.
   "Success" görmelisin.
5. Yeni bir sorgu aç, aşağıdaki satırı **kendi e-postanla** değiştirip çalıştır:
   ```sql
   insert into public.admins (email) values ('SENIN_EMAILIN@ornek.com');
   ```
6. Soldaki menüden **Authentication** → **Users** → **Add user** → **Create new user**:
   - Aynı e-posta ve kendine bir şifre yaz (sitedeki yönetici şifren bu olacak)
   - **Auto Confirm User** kutusunu işaretle
7. **Authentication** → **Sign In / Providers** sayfasında **Allow new users to sign up** seçeneğini **kapat**.
   Böylece senden başka kimse hesap açamaz.
8. **Project Settings** → **API** sayfasından iki değeri kopyala:
   - **Project URL**
   - **anon public** key

## 2. Siteyi kendi bilgisayarında çalıştır

1. Bilgisayarında [Node.js](https://nodejs.org) yüklü olmalı (LTS sürümü).
2. Proje klasöründe `.env.example` dosyasını kopyala, kopyanın adını `.env.local` yap.
3. `.env.local` dosyasını aç ve Supabase'ten kopyaladığın iki değeri yapıştır.
4. Proje klasöründe bir terminal aç (klasöre sağ tık → **Terminalde aç**) ve şunları yaz:
   ```
   npm install
   npm run dev
   ```
5. Tarayıcıda **http://localhost:3000** adresini aç. Site çalışıyor!
6. Caps eklemek için **http://localhost:3000/admin** adresine git ve giriş yap.

## 3. GitHub'a yükle

1. [github.com/new](https://github.com/new) adresinden `seymas-archive` adında yeni bir depo oluştur.
2. Proje klasöründe terminalde:
   ```
   git init
   git add .
   git commit -m "Seyma's Archive ilk sürüm"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADIN/seymas-archive.git
   git push -u origin main
   ```
   `.env.local` dosyan GitHub'a **gitmez** (`.gitignore` bunu engeller). Bu bilerek böyle.

## 4. İnternete aç (Vercel)

1. [vercel.com](https://vercel.com) adresine GitHub hesabınla giriş yap.
2. **Add New** → **Project** → `seymas-archive` deposunu seç → **Import**.
3. **Environment Variables** bölümüne `.env.local` dosyandaki değişkenleri tek tek ekle:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_X_HANDLE` (X kullanıcı adın, @ olmadan)
   - `NEXT_PUBLIC_SITE_URL` (ilk seferde boş bırakabilirsin)
4. **Deploy** de. Birkaç dakika sonra siten `seymas-archive.vercel.app` gibi bir adreste yayında.
5. Siten açılınca adresini `NEXT_PUBLIC_SITE_URL` olarak ekle ve **Redeploy** de.
   Bu, X'te paylaşınca görselin büyük kart olarak çıkması için gerekli.

Bundan sonra GitHub'a her `git push` yaptığında Vercel siteyi otomatik günceller.

---

## Günlük kullanım

- **Caps eklemek:** `siteadresin/admin` → giriş yap → görseli sürükle ya da **Ctrl+V** ile yapıştır → başlık ve etiket yaz → **Arşive ekle**.
- **Twitter'dan caps almak:** Görsele sağ tık → **Resmi kopyala** → yönetim sayfasında **Ctrl+V**.
- **Görseldeki yazı alanı:** Doldurursan, ziyaretçiler caps'i içindeki cümleyle de bulabilir.
- Aynı dosyayı ikinci kez eklemeye çalışırsan site seni uyarır (SHA-256 parmak izi kontrolü).

## Projenin teknik özeti (CV ve mülakat için)

- **Next.js 15 (App Router) + React 19 + TypeScript**
- **Supabase (PostgreSQL)**: Row Level Security ile yetkilendirme. Okuma herkese açık, yazma yalnızca `admins` tablosundaki hesaplara açık. Kural veritabanı seviyesinde uygulanıyor, yani site kodu atlatılsa bile yetkisiz kimse yazamaz.
- **İçerik bütünlüğü**: Her dosyanın SHA-256 özeti tarayıcıda hesaplanıyor. Dosya bu özetle adlandırılarak depolanıyor ve veritabanında `unique` kısıtı var, böylece aynı içerik iki kez arşive giremiyor.
- **Güvenli yükleme**: Dosya türü ve boyutu hem istemcide hem depolama kovası ayarlarında sınırlı.
- **Güvenlik başlıkları**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Arama**: Türkçe karakterden bağımsız (ş→s, ı→i, ğ→g …), başlık, etiket ve görsel içi metinde çalışıyor.
- **SEO ve paylaşım**: Her caps için ayrı sayfa ve Open Graph / X Card meta etiketleri.
- **Önbellek**: Sayfalar statik üretilip önbelleğe alınıyor (ISR). Yönetici değişiklik yapınca, kimliği sunucuda doğrulanan bir uç nokta önbelleği hemen yeniliyor.
