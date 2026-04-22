# SharePrompt - Proje Özeti ve Mimari Yapı (AI Asistanlar İçin Rehber)

Bu dosya, projenin temel mimarisini, kullanılan teknolojileri ve geçmişte yapılan kritik güncellemeleri özetlemek amacıyla oluşturulmuştur. Yeni bir yapay zeka asistanı (Claude vb.) ile çalışmaya başlandığında, projenin bağlamını (context) hızlıca anlaması için bu dosyayı okuması yeterlidir.

## 1. Teknoloji Yığını (Tech Stack)
- **Framework:** Next.js 14+ (App Router kullanılarak)
- **Dil:** TypeScript
- **Stil / Tasarım:** TailwindCSS, minimalist Slate/Dark konsept, Shadcn UI (Radix tabanlı) bileşenleri.
- **Backend & Veritabanı:** Supabase (PostgreSQL veritabanı ve Supabase Auth)
- **Çoklu Dil (i18n):** `next-intl` (Şu an aktif olarak İngilizce `en` ve Türkçe `tr` destekleniyor)
- **İkonlar:** Lucide React

## 2. Veritabanı Mimarisi (Supabase)
Tüm tablolar `public` şemasındadır ve Row Level Security (RLS) ile korunmaktadır.
- **`profiles`:** Kullanıcı verileri. `auth.users` ile bağlantılı (`ON DELETE CASCADE`). Yeni kayıt olunduğunda `handle_new_user` trigger'ı ile otomatik oluşturulur. Yakın zamanda profile `description` (Hakkımda) sütunu eklenmiştir.
- **`categories`:** Prompt kategorileri (Yazılım, Tasarım, Eğitim vs.).
- **`prompts`:** Kullanıcıların paylaştığı komutlar. `user_id` ve `category_id` içerir. Bir prompt başka bir prompttan türetildiyse `parent_id` kullanılarak takip edilir (Fork mantığı). `star_count` ve `fork_count` sütunları triggerlar ile otomatik güncellenir.
- **`stars`:** Kullanıcıların beğendiği promptların kaydı (Many-to-Many ilişkisi).
- **`forks`:** Hangi promptun hangi kullanıcı tarafından kopyalandığının kaydı.

## 3. Yakın Zamanda Çözülen Kritik Sorunlar ve Kararlar
- **Trigger Güvenlik (RLS) Sorunu:** Kullanıcılar başkasının promptunu "Yıldızladığında" (Star) veya "Forkladığında" `prompts` tablosundaki sayaçlar artmıyordu. Bunun sebebi RLS kurallarının kullanıcının başkasının promptunu güncellemesini engellemesiydi. Çözüm olarak Supabase üzerindeki `handle_star_insert`, `handle_star_delete` ve `handle_fork_insert` fonksiyonlarına **`SECURITY DEFINER`** yetkisi verilerek RLS bypass edildi ve sayaçların sorunsuz çalışması sağlandı. (Bkz. `001_initial.sql` ve `003_fix_triggers_security_definer.sql`).
- **Form Doğrulaması (Validation):** Kayıt ol (Register) ve Giriş yap (Login) formlarındaki tarayıcı kaynaklı standart HTML5 uyarıları (`required`, email type vb.) lokalizasyon (i18n) diline göre uyarlandı. Tarayıcının işletim sistemi diline bakmaksızın site dili (EN/TR) neyse hata mesajı o dilde veriliyor (`onInvalid` ile `setCustomValidity` kullanıldı). Zorunlu alanların yanına kırmızı yıldız (`*`) eklendi.
- **Tasarım Kararları:** Arayüz tamamen "Minimalist Slate" karanlık temasında (Dark Mode) tutuldu. Sıkça Sorulan Sorular (FAQ) bölümü, aynı anda birden fazla sekmenin açık kalabileceği şekilde (`Set` mantığıyla) güncellendi. Orijinal mavi favicon yerine site konseptine uygun sarı-slate `icon.svg` şimşek logosu yapıldı.

## 4. Dizin Yapısı (Klasörler)
- `src/app/[locale]/`: Tüm Next.js sayfaları burada yer alır (Çoklu dil destekli dinamik route).
- `src/components/`: Tekrar kullanılabilir UI bileşenleri.
- `src/lib/supabase/`: Supabase client ve server (SSR) bağlantı ayarları.
- `messages/`: İngilizce (`en.json`) ve Türkçe (`tr.json`) çeviri dosyaları.
- `supabase/migrations/`: Veritabanı tablolarını, RLS kurallarını ve trigger'ları kuran/güncelleyen SQL dosyaları.

## 5. Yapay Zeka Asistanlarına Not
Kodda herhangi bir `prompts` veya sayaç güncellemesi yapacaksanız, doğrudan tabloya `UPDATE` atmak yerine, sistemin halihazırda var olan trigger'lara (`SECURITY DEFINER` yetkili) güvendiğini unutmayın. Yeni bir alan (sütun) eklenecekse, migration dosyası oluşturduğunuzdan ve UI'daki `types.ts` ile eşleştiğinden emin olun. Her zaman minimalist Slate tasarım diline sadık kalın.
