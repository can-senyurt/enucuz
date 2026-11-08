/**
 * Slides of the auto-playing banner on the home page.
 * Photos live in public/banners (Pexels, see the README there).
 * Every link points to a page that already exists and has products.
 */
export interface HomeBanner {
  id: string;
  /** Small label above the title. */
  kicker: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  image: string;
  /** Describes the photo for screen readers. */
  alt: string;
}

export const homeBanners: HomeBanner[] = [
  {
    id: "kasim",
    kicker: "Kasım fırsatları",
    title: "Kasım indirimleri başladı",
    text: "Gerçekten ucuzlayan ürünleri tek sayfada gör.",
    cta: "Fırsatları gör",
    href: "/firsatlar",
    image: "/banners/01-kasim.jpg",
    alt: "Elinde kırmızı alışveriş poşeti tutan, şapkalı ve neşeli bir kadın",
  },
  {
    id: "mont",
    kicker: "Kış hazırlığı",
    title: "Kışlık mont ve kaban",
    text: "Soğuk bastırmadan en uygun fiyatı bul.",
    cta: "Montları incele",
    href: "/ara?q=mont",
    image: "/banners/02-mont.jpg",
    alt: "Krem rengi şişme mont giyen bir erkek",
  },
  {
    id: "spor-ayakkabi",
    kicker: "Her gün rahat",
    title: "Spor ayakkabıda fiyat farkı",
    text: "Aynı ayakkabı, farklı mağazalar, farklı fiyatlar.",
    cta: "Ayakkabılara bak",
    href: "/ara?q=spor%20ayakkab%C4%B1",
    image: "/banners/03-spor-ayakkabi.jpg",
    alt: "Ahşap zeminde duran beyaz spor ayakkabılar",
  },
  {
    id: "kadin",
    kicker: "Yeni sezon",
    title: "Kadın giyimde kışın tonları",
    text: "Atkı, palto ve kazakta en düşük fiyatlar.",
    cta: "Kadın giyim",
    href: "/kategori/kadin",
    image: "/banners/04-kadin.jpg",
    alt: "Sarı paltolu, bordo atkılı ve telefonla konuşan bir kadın",
  },
  {
    id: "erkek",
    kicker: "Şık ve rahat",
    title: "Erkek giyimde tam takım",
    text: "Gömlek, ceket ve takımlarda fiyatları karşılaştır.",
    cta: "Erkek giyim",
    href: "/kategori/erkek",
    image: "/banners/05-erkek.jpg",
    alt: "Takım elbise, gömlek ve kravat giyen bir erkek",
  },
  {
    id: "cocuk",
    kicker: "Sıcacık kalsınlar",
    title: "Çocuklara kışlık giysiler",
    text: "Mont, bot ve eşofmanda uygun fiyatlı seçenekler.",
    cta: "Çocuk giyim",
    href: "/kategori/cocuk",
    image: "/banners/06-cocuk.jpg",
    alt: "Kar altında kırmızı kışlık mont ve kürklü şapka giyen bir çocuk",
  },
  {
    id: "triko",
    kicker: "Yumuşacık",
    title: "Triko ve kazak zamanı",
    text: "Yün kazaklarda geçmiş fiyatlara bak, akıllı al.",
    cta: "Kazakları gör",
    href: "/ara?q=kazak",
    image: "/banners/07-triko.jpg",
    alt: "Üst üste katlanmış bej örgü kazaklar",
  },
  {
    id: "kot",
    kicker: "Her zaman moda",
    title: "Kot pantolonda en uygun fiyat",
    text: "Kesimi seç, mağazalar arasındaki farkı gör.",
    cta: "Kot pantolonlar",
    href: "/ara?q=kot%20pantolon",
    image: "/banners/08-kot.jpg",
    alt: "Raflarda üst üste duran kot pantolonlar",
  },
  {
    id: "aksesuar",
    kicker: "Küçük dokunuşlar",
    title: "Bere ve atkıyla tamamla",
    text: "Kışın küçük aksesuarları, küçük fiyatlarla.",
    cta: "Aksesuarlar",
    href: "/kategori/aksesuar",
    image: "/banners/09-bere-atki.jpg",
    alt: "Bej bereli ve mavi atkılı bir genç kadın",
  },
  {
    id: "deri-ceket",
    kicker: "Klasik duruş",
    title: "Deri ceket aşkı",
    text: "Fiyat geçmişine bak, en doğru zamanda al.",
    cta: "Deri ceketler",
    href: "/ara?q=deri%20ceket",
    image: "/banners/10-deri-ceket.jpg",
    alt: "Siyah deri ceket giyen bir kadının yandan görüntüsü",
  },
  {
    id: "gercek-indirim",
    kicker: "İndirim Skoru",
    title: "İndirimin gerçeğini gör",
    text: "Şişirilmiş indirimlere karşı 0–100 arası skor.",
    cta: "Nasıl çalışır?",
    href: "/#neden",
    image: "/banners/11-gercek-indirim.jpg",
    alt: "Kırmızı blazer giyen ve elinde alışveriş poşetleri tutan bir kadın",
  },
  {
    id: "kaban",
    kicker: "Şehrin stili",
    title: "Yün kaban ve palto",
    text: "Şık görünüp bütçeni korumanın yolu burada.",
    cta: "Kabanları incele",
    href: "/ara?q=kaban",
    image: "/banners/12-kaban.jpg",
    alt: "Şapkalı, bej paltolu ve ekose atkılı bir kadın",
  },
];
