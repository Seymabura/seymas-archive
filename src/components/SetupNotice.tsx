export function SetupNotice({ error }: { error?: string | null }) {
  return (
    <div className="container">
      <div className="notice">
        {error ? (
          <>
            <h2>Veritabanına bağlanılamadı</h2>
            <p>Supabase şu hatayı verdi: <code>{error}</code></p>
            <p>Şema dosyasını (<code>supabase/schema.sql</code>) Supabase SQL Editor&apos;da çalıştırdığından emin ol.</p>
          </>
        ) : (
          <>
            <h2>Site çalışıyor, veritabanı bağlantısı bekleniyor</h2>
            <p>Arşivin görünmesi için <code>.env.local</code> dosyasına Supabase bilgilerini eklemen gerekiyor:</p>
            <ol>
              <li><code>.env.example</code> dosyasını kopyalayıp adını <code>.env.local</code> yap.</li>
              <li>Supabase panelinde Project Settings → API sayfasındaki URL ve anon key değerlerini yapıştır.</li>
              <li>Sunucuyu yeniden başlat: <code>npm run dev</code></li>
            </ol>
            <p>Ayrıntılı anlatım <code>KURULUM.md</code> dosyasında.</p>
          </>
        )}
      </div>
    </div>
  );
}
