import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Hakkımızda - İznikle',
  description: 'İznikle hakkında bilgi edinin. İznik\'in dijital meydanına hoş geldiniz.',
}

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-navy-800 via-navy-700 to-iznik-800 text-white py-16 md:py-24 iznik-pattern">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Hakkımızda
          </h2>
          <p className="text-iznik-200 text-base md:text-lg max-w-2xl mx-auto">
            İznik&apos;in Dijital Meydanına Hoş Geldiniz!
          </p>
        </div>
      </section>

      {/* İçerik */}
      <main className="flex-1 py-12 md:py-16">
        <article className="max-w-3xl mx-auto px-4 text-gray-700 leading-relaxed text-[15px] md:text-base space-y-5">
          <p>
            Her şey, doğduğum topraklara yıllar sonra geri dönmemle başladı.
          </p>
          <p>
            Bir endüstri mühendisi olarak hayatım boyunca sistemleri iyileştirmek ve süreçleri daha verimli hale getirmek üzerine çalıştım. Ancak memleketime yeniden yerleşme sürecimde oldukça tanıdık ve günlük bir sorunla karşılaştım: Evim için güvenilir bir ustaya, yerel bir üreticiye veya spesifik bir el emeği ürününe ulaşmak, dijital çağda olmamıza rağmen beklediğimden çok daha zordu.
          </p>
          <p>
            İşte bu kişisel arayış, zamanla &ldquo;Benim yaşadığım bu zorluğu, burada yaşayan veya burayı ziyarete gelen kim bilir kaç kişi yaşıyordur?&rdquo; sorusuna dönüştü. İznik gibi köklü, üreten ve zengin bir kültüre sahip bir ilçenin, herkesin kolayca erişebileceği dijital bir buluşma noktasına ihtiyacı vardı. Bu platform, tam olarak bu ihtiyacı karşılamak üzere hayata geçirildi.
          </p>
          <p className="font-semibold text-navy-800 text-lg md:text-xl mt-8 mb-4">
            Ne Yapıyoruz?
          </p>
          <p>
            Amacımız; İznik&apos;in değerli esnafını, kendi el ürünlerini üreten zanaatkârlarını ve hizmet sağlayıcılarını modern, hızlı ve herkesin telefonunda taşıyabileceği bir rehberde bir araya getirmek.
          </p>
          <p>
            <strong>İznikliler İçin Pratik Çözümler:</strong> Evinizdeki bir arıza için tamirciye, günlük işleriniz için doğru hizmete veya mahallenizdeki esnafa tek bir noktadan, saniyeler içinde ulaşabilmenizi sağlıyoruz.
          </p>
          <p>
            <strong>Misafirlerimiz İçin Doğru Rehberlik:</strong> İznik&apos;in eşsiz tarihini ve kültürünü deneyimlemeye gelen turistlerin; gerçek çini sanatçılarına, yöresel lezzetlere ve otantik el emeği ürünlere en &ldquo;doğru ellerden&rdquo; aracısız bir şekilde ulaşmasına köprü oluyoruz.
          </p>
          <p>
            Bizim için bu platform sadece bir işletme rehberi değil; İznik&apos;in yerel ekonomisini destekleyen, komşuyu komşuyla, misafiri ev sahibiyle buluşturan dijital bir dayanışma ağıdır.
          </p>
          <p>
            Telefonunuza tek tıkla kaydedip ihtiyaç duyduğunuz her an yanınızda bulabileceğiniz bu rehberle, İznik&apos;in gerçek potansiyelini keşfetmeye davetlisiniz.
          </p>

          <div className="text-center pt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-iznik-600 hover:bg-iznik-700 text-white font-medium px-8 py-3 rounded-xl transition-colors text-sm"
            >
              İşletmeleri Keşfet
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
