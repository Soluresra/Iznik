export default function Footer() {
  return (
    <footer id="hakkinda" className="bg-navy-800 text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Hakkında */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-iznik-500 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none">
                  <circle cx="20" cy="20" r="16" stroke="white" strokeWidth="2" fill="none" />
                  <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="1.5" fill="none" />
                  <circle cx="20" cy="20" r="2.5" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-lg">İznikle</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              İznik&apos;in yerel işletmelerini, esnaflarını ve el sanatı ustalarını
              bir araya getiren dijital pazar yeri ve iletişim rehberi.
            </p>
          </div>

          {/* Hızlı Bağlantılar */}
          <div>
            <h3 className="font-semibold mb-3 text-iznik-300">Hızlı Bağlantılar</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/" className="hover:text-iznik-300 transition-colors">Ana Sayfa</a></li>
              <li><a href="/hakkimizda" className="hover:text-iznik-300 transition-colors">Hakkımızda</a></li>
              <li><a href="/admin/login" className="hover:text-iznik-300 transition-colors">Yönetim Paneli</a></li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="font-semibold mb-3 text-iznik-300">İletişim</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>İznik, Bursa / Türkiye</li>
              <li>info@iznikle.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-700 mt-8 pt-6 text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} İznikle. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
