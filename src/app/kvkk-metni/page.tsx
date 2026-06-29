import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası ve KVKK Aydınlatma Metni | Birlikteydik.com",
  description: "Birlikteydik.com gizlilik politikası, KVKK aydınlatma metni ve kişisel verilerin korunması hakkında bilgi.",
};

const C = {
  bg: "#0B0F1A",
  gold: "#C9A84C",
  text: "#F0EDE8",
  muted: "rgba(240,237,232,0.55)",
  border: "rgba(255,255,255,0.07)",
  card: "rgba(255,255,255,0.03)",
};

export default function KvkkMetniPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${C.bg}; overflow-x: hidden; color: ${C.text}; }
        ::selection { background: rgba(201,168,76,0.28); color: ${C.text}; }
      `}</style>

      {/* Arka plan */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 50% at 20% 10%, rgba(201,168,76,0.06) 0%, transparent 60%), linear-gradient(160deg, #0B0F1A 0%, #0d1220 60%, #0a0d18 100%)" }} />

      <main style={{ position: "relative", zIndex: 1, maxWidth: "780px", margin: "0 auto", padding: "100px 24px 80px" }}>

        {/* Geri butonu */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "rgba(240,237,232,0.35)", textDecoration: "none", letterSpacing: "0.06em", marginBottom: "48px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Ana Sayfaya Dön
        </Link>

        {/* Başlık */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, color: C.text, lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: "16px" }}>
            BİRLİKTEYDİK.COM<br />
            <em style={{ color: C.gold, fontStyle: "italic" }}>KVKK Aydınlatma Metni ve Kullanım Koşulları Sözleşmesi </em>
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300, lineHeight: 1.7 }}>
            İşbu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun (&quot;KVKK&quot;) 10. maddesi uyarınca, birlikteydik.com kullanıcılarının kişisel verilerinin işlenme amaçları, hukuki sebepleri ve hakları konusunda bilgilendirilmesi amacıyla hazırlanmıştır.
          </p>
        </div>

        {/* İçerik */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

          {/* Bölüm 1 */}
          <Section number="1" title="Veri Sorumlusu">
            Sitede toplanan ve veritabanımızda güvenli bir şekilde şifrelenerek saklanan kişisel verileriniz bakımından veri sorumlusu <strong style={{ color: C.text, fontWeight: 500 }}>birlikteydik.com yönetimidir</strong>.
          </Section>

          {/* Bölüm 2 */}
          <Section number="2" title="İşlenen Kişisel Verileriniz">
            <p style={{ marginBottom: "14px" }}>Sitemize kayıt olurken ve hizmeti kullanırken aşağıdaki verileriniz dijital altyapımızda işlenmektedir:</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              <BulletItem label="Kimlik ve İletişim Bilgisi">Adınız, soyadınız, e-posta adresiniz.</BulletItem>
              <BulletItem label="Kullanıcı İşlem Bilgisi">Şifreniz (veritabanında geri döndürülemeyecek şekilde şifrelenmiş/hashlenmiş olarak tutulur), sisteme giriş-çıkış hareketleriniz, oluşturduğunuz şablon tercihleri.</BulletItem>
              <BulletItem label="Görsel ve İşitsel Veriler">Profil fotoğrafları, anı sayfalarına kendi isteğinizle yüklediğiniz fotoğraflar ve metinsel içerikler.</BulletItem>
            </ul>
          </Section>

          {/* Bölüm 3 */}
          <Section number="3" title="Kişisel Verilerin İşlenme Amaçları">
            <p style={{ marginBottom: "14px" }}>Toplanan kişisel verileriniz, aşağıdaki yasal ve teknik amaçlar dahilinde işlenmektedir:</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Kullanıcı hesabı oluşturulması ve kimlik doğrulaması yapılması (NextAuth altyapısı ile),",
                "Sitenin temel fonksiyonlarının yerine getirilmesi, anıların ve dijital kasetlerin doğru kullanıcı profili ile eşleştirilmesi,",
                "Sunucu güvenliğinin ve siber güvenliğin (Cloudflare koruması dahilinde) sağlanması,",
                "Olası yasal uyuşmazlıklarda adli makamların resmi taleplerine cevap verilmesi.",
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", gap: "10px", fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: C.muted, fontWeight: 300, lineHeight: 1.65 }}>
                  <span style={{ color: C.gold, marginTop: "2px", flexShrink: 0 }}>—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Bölüm 4 */}
          <Section number="4" title="Kişisel Verilerin Üçüncü Kişilere Aktarılması">
            birlikteydik.com, topladığı kişisel verileri hiçbir surette üçüncü şahıslara <strong style={{ color: C.text, fontWeight: 500 }}>satmaz, kiralamaz veya ticari amaçlarla paylaşmaz</strong>. Veriler, yalnızca yasal zorunluluklar çerçevesinde resmi makamlarca (Savcılık, Mahkemeler vb.) usulüne uygun olarak talep edilmesi halinde yetkili kamu kurum ve kuruluşları ile paylaşılabilir. Sitenin siber güvenliğini ve SSL/TLS şifrelemesini sağlamak adına Cloudflare servis altyapısından yararlanılmaktadır.
          </Section>

          {/* Bölüm 5 */}
          <Section number="5" title="Veri Güvenliği ve Saklama Politikası">
            Verileriniz, sunucumuzda bulunan izole ve şifreli veritabanı odasında saklanmaktadır. Şifreleriniz sisteme düz metin olarak değil, kriptografik hash algoritmalarıyla kaydedilir. Yetkisiz erişimleri engellemek amacıyla sunucu düzeyinde SSH anahtar koruması ve port kısıtlamaları uygulanmaktadır.
          </Section>

          {/* Bölüm 6 */}
          <Section number="6" title="KVKK Kapsamındaki Haklarınız">
            <p style={{ marginBottom: "14px" }}>KVKK'nın 11. maddesi uyarınca birlikteydik.com yönetimine e-posta yoluyla başvurarak;</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Kişisel verilerinizin işlenip işlenmediğini öğrenme,",
                "İşlenmişse buna ilişkin bilgi talep etme,",
                "Verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,",
                "Kanuna uygun olarak işlenmiş olmasına rağmen, işlenmesini gerektiren sebeplerin ortadan kalkması hâlinde verilerinizin silinmesini veya yok edilmesini isteme hakkına sahipsiniz.",
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", gap: "10px", fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: C.muted, fontWeight: 300, lineHeight: 1.65 }}>
                  <span style={{ color: C.gold, marginTop: "2px", flexShrink: 0 }}>—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

        </div>

        {/* ─── KULLANIM KOŞULLARI ──────────────────────────────────────────── */}
        <div style={{ marginTop: "56px", paddingTop: "48px", borderTop: `2px solid ${C.border}` }}>

          <div style={{ marginBottom: "36px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 600, color: C.text, lineHeight: 1.2 }}>
              BİRLİKTEYDİK.COM <em style={{ color: C.gold, fontStyle: "italic" }}>Kullanım Koşulları</em> Sözleşmesi
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            <Section number="1" title="Taraflar ve Tanımlar">
              İşbu Kullanım Koşulları Sözleşmesi (&quot;Sözleşme&quot;), birlikteydik.com web sitesine (&quot;Site&quot;) kayıt olan kullanıcı (&quot;Kullanıcı&quot;) ile Site yönetimi arasında, Sitenin kullanımına ilişkin kuralları, hak ve yükümlülükleri belirlemek amacıyla akdedilmiştir. Siteye üye olarak veya Siteyi kullanarak işbu Sözleşme&apos;deki tüm şartları kabul etmiş sayılırsınız.
            </Section>

            <Section number="2" title="Hizmetin Tanımı">
              birlikteydik.com, kullanıcıların kişisel anılarını, fotoğraflarını, retro sinema konseptli içeriklerini ve dijital kaset/widget yapılarını dijital ortamda saklamalarına, düzenlemelerine ve kendi belirledikleri kişilerle paylaşmalarına olanak tanıyan bir web uygulaması platformudur.
            </Section>

            <Section number="3" title="Üyelik ve Hesap Güvenliği">
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "Üyelik oluşturulurken verilen e-posta, isim ve şifre bilgilerinin doğruluğundan tamamen Kullanıcı sorumludur.",
                  "Kullanıcı, hesaba erişim şifresinin güvenliğini sağlamakla yükümlüdür. Şifrenin üçüncü şahısların eline geçmesi neticesinde doğabilecek veri kayıplarından veya yasal sorumluluklardan Site yönetimi sorumlu tutulamaz.",
                  "Bir hesapta gerçekleştirilen tüm aktivitelerden, o hesabın sahibi olan Kullanıcı doğrudan sorumludur.",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "10px", fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: C.muted, fontWeight: 300, lineHeight: 1.65 }}>
                    <span style={{ color: C.gold, marginTop: "2px", flexShrink: 0 }}>—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section number="4" title="Kullanım Kuralları ve İçerik Politikası">
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "Kullanıcı, Siteye yüklediği tüm görsel, metin, fotoğraf ve anı içeriklerinin (\"İçerik\") yasal hak sahibi olduğunu veya bu içerikleri kullanma hakkına sahip olduğunu kabul eder.",
                  "Siteye; Türkiye Cumhuriyeti kanunlarına aykırı, genel ahlaka, kamu düzenine ve kişilik haklarına tecavüz eden, telif hakkı ihlali barındıran, pornografik, yasa dışı bahis veya suç teşkil eden hiçbir içerik yüklenemez.",
                  "Sitenin teknik altyapısına zarar verebilecek, veri madenciliği, tersine mühendislik (reverse engineering), sunucu kaynaklarını kasıtlı olarak manipüle etme veya aşırı yükleme (DDoS vb.) gibi faaliyetlerde bulunmak kesinlikle yasaktır.",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "10px", fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: C.muted, fontWeight: 300, lineHeight: 1.65 }}>
                    <span style={{ color: C.gold, marginTop: "2px", flexShrink: 0 }}>—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section number="5" title="Sorumluluğun Sınırlandırılması">
              birlikteydik.com, sunucu sağlayıcılardan (Hetzner VDS vb.) veya küresel internet hatlarından kaynaklanabilecek geçici kesintilerden, veri tabanı gecikmelerinden veya mücbir sebeplerden ötürü yaşanabilecek veri kayıplarından ötürü doğrudan maddi/manevi tazminat sorumluluğu taşımaz. Kullanıcıya kesintisiz ve kusursuz bir hizmet sunmak için teknik olarak azami gayret gösterilmektedir.
            </Section>

            <Section number="6" title="Sözleşmenin Feshi ve Değişiklikler">
              Site yönetimi, işbu sözleşme maddelerini, gelişen teknik şartlar ve yasal mevzuatlar çerçevesinde tek taraflı olarak güncelleme hakkına sahiptir. Koşulların ihlali durumunda Kullanıcı hesabı askıya alınabilir veya kalıcı olarak silinebilir.
            </Section>

          </div>
        </div>

        {/* Alt bilgi */}
        <div style={{ marginTop: "56px", paddingTop: "32px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "center" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.18)", letterSpacing: "0.06em", textAlign: "center" }}>
            Son güncelleme: {new Date().getFullYear()} · birlikteydik.com
          </p>
        </div>
      </main>
    </>
  );
}

// ─── Yardımcı bileşenler ──────────────────────────────────────────────────────
function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "28px 28px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "16px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: C.gold + "88", fontWeight: 600 }}>{number}.</span>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 600, color: C.text, letterSpacing: "0.01em" }}>{title}</h2>
      </div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: "rgba(240,237,232,0.55)", fontWeight: 300, lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}

function BulletItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "10px", padding: "12px 14px" }}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: C.gold, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>{label}</span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "rgba(240,237,232,0.5)", fontWeight: 300, lineHeight: 1.65 }}>{children}</span>
    </li>
  );
}
