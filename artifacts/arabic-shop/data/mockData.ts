import { ImageSourcePropType } from "react-native";

export interface Product {
  id: string;
  nameAr: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: ImageSourcePropType;
  images: ImageSourcePropType[];
  category: string;
  categoryId: string;
  tags: string[];
  inStock: boolean;
  sizes?: string[];
  colors?: string[];
  descriptionAr: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  soldCount?: number;
  deliveryDays?: number;
}

export interface Category {
  id: string;
  nameAr: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface BannerRoute {
  pathname: string;
  params?: Record<string, string>;
}

export interface Banner {
  id: string;
  titleAr: string;
  subtitleAr: string;
  ctaAr: string;
  image: ImageSourcePropType;
  bgGradient: [string, string];
  textColor: string;
  /** Per-banner navigation destination for the CTA tap */
  ctaRoute: BannerRoute;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  commentAr: string;
  date: string;
  helpful: number;
}

export const CATEGORIES: Category[] = [
  { id: "all",         nameAr: "الكل",       icon: "apps",                  color: "#E63946", bgColor: "#FFF0F1" },
  { id: "fashion",     nameAr: "ملابس",      icon: "shirt-outline",         color: "#7C3AED", bgColor: "#F5F0FF" },
  { id: "electronics", nameAr: "إلكترونيات", icon: "phone-portrait-outline", color: "#3B82F6", bgColor: "#EFF6FF" },
  { id: "home",        nameAr: "المنزل",     icon: "home-outline",          color: "#0D9488", bgColor: "#F0FDFA" },
  { id: "beauty",      nameAr: "جمال",       icon: "flower-outline",        color: "#EC4899", bgColor: "#FDF2F8" },
  { id: "accessories", nameAr: "إكسسوارات", icon: "watch-outline",         color: "#F5A623", bgColor: "#FFF8EC" },
  { id: "sports",      nameAr: "رياضة",      icon: "football-outline",      color: "#10B981", bgColor: "#ECFDF5" },
  { id: "kids",        nameAr: "أطفال",      icon: "happy-outline",         color: "#F59E0B", bgColor: "#FFFBEB" },
];

export const BANNERS: Banner[] = [
  {
    id: "b1",
    titleAr: "تخفيضات الصيف",
    subtitleAr: "خصم يصل إلى ٧٠٪ على جميع الملابس",
    ctaAr: "تسوق الآن",
    image: require("../assets/images/banner1.png"),
    bgGradient: ["#E63946", "#C1121F"],
    textColor: "#FFFFFF",
    ctaRoute: {
      pathname: "/(tabs)/search",
      params: { sale: "true", category: "fashion" },
    },
  },
  {
    id: "b2",
    titleAr: "وصل حديثاً",
    subtitleAr: "أحدث صيحات الموضة لهذا الموسم",
    ctaAr: "اكتشف المجموعة",
    image: require("../assets/images/banner2.png"),
    bgGradient: ["#1D2D50", "#0D1B3E"],
    textColor: "#FFFFFF",
    ctaRoute: {
      pathname: "/(tabs)/search",
      params: { sort: "newest" },
    },
  },
  {
    id: "b3",
    titleAr: "عروض فلاش",
    subtitleAr: "لفترة محدودة فقط — لا تفوت الفرصة",
    ctaAr: "العرض ينتهي قريباً",
    image: require("../assets/images/banner3.png"),
    bgGradient: ["#F5A623", "#D4850A"],
    textColor: "#1D2D50",
    ctaRoute: {
      pathname: "/(tabs)/search",
      params: { sale: "true" },
    },
  },
];

const IMG = {
  p1: require("../assets/images/product1.png"),
  p2: require("../assets/images/product2.png"),
  p3: require("../assets/images/product3.png"),
  p4: require("../assets/images/product4.png"),
  p5: require("../assets/images/product5.png"),
  p6: require("../assets/images/product6.png"),
};

export const PRODUCTS: Product[] = [
  {
    id: "prod1",
    nameAr: "فستان ساتان وردي أنيق",
    brand: "زارا",
    price: 189,
    originalPrice: 320,
    discount: 41,
    rating: 4.8,
    reviewCount: 1240,
    image: IMG.p1,
    images: [IMG.p1, IMG.p2],
    category: "ملابس نسائية",
    categoryId: "fashion",
    tags: ["فستان", "ساتان", "أنيق"],
    inStock: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["#FFC0CB", "#FF69B4", "#C71585"],
    descriptionAr:
      "فستان ساتان فاخر بتصميم أنيق يناسب المناسبات الرسمية وحفلات السهر. مصنوع من أجود أنواع الساتان الناعم الذي يمنح الجسم قوامًا رشيقًا.",
    isNew: false,
    isFeatured: true,
    isFlashSale: true,
    soldCount: 3200,
    deliveryDays: 2,
  },
  {
    id: "prod2",
    nameAr: "بلوزة كاجوال بيضاء",
    brand: "H&M",
    price: 79,
    originalPrice: 120,
    discount: 34,
    rating: 4.5,
    reviewCount: 867,
    image: IMG.p2,
    images: [IMG.p2, IMG.p1],
    category: "ملابس نسائية",
    categoryId: "fashion",
    tags: ["بلوزة", "كاجوال"],
    inStock: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["#FFFFFF", "#F5F5DC", "#E8E8E8"],
    descriptionAr:
      "بلوزة كاجوال خفيفة ومريحة مثالية للارتداء اليومي. مصنوعة من القطن المتميز الذي يمنح الجسم التنفس الطبيعي.",
    isNew: true,
    isFeatured: false,
    isFlashSale: false,
    soldCount: 1500,
    deliveryDays: 3,
  },
  {
    id: "prod3",
    nameAr: "فستان سهرة أحمر",
    brand: "ماسيمو دوتي",
    price: 349,
    originalPrice: 599,
    discount: 42,
    rating: 4.9,
    reviewCount: 420,
    image: IMG.p3,
    images: [IMG.p3, IMG.p2],
    category: "ملابس نسائية",
    categoryId: "fashion",
    tags: ["فستان", "سهرة", "أحمر"],
    inStock: true,
    sizes: ["S", "M", "L"],
    colors: ["#DC143C", "#8B0000", "#FF6B6B"],
    descriptionAr:
      "فستان سهرة راقٍ باللون الأحمر الجذاب، مثالي للمناسبات الفاخرة والحفلات. خامة مخملية فاخرة مع تفاصيل دقيقة.",
    isNew: true,
    isFeatured: true,
    isFlashSale: false,
    soldCount: 890,
    deliveryDays: 2,
  },
  {
    id: "prod4",
    nameAr: "بلوزة كاجوال أنيقة",
    brand: "مانجو",
    price: 95,
    originalPrice: 150,
    discount: 37,
    rating: 4.4,
    reviewCount: 680,
    image: IMG.p2,
    images: [IMG.p2],
    category: "ملابس نسائية",
    categoryId: "fashion",
    tags: ["بلوزة", "أنيقة"],
    inStock: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["#000000", "#FFFFFF", "#808080"],
    descriptionAr: "بلوزة كاجوال أنيقة بتصميم عصري يناسب مختلف المناسبات اليومية والمهنية.",
    isNew: false,
    isFeatured: false,
    isFlashSale: true,
    soldCount: 2100,
    deliveryDays: 2,
  },
  {
    id: "prod5",
    nameAr: "حقيبة جلدية فاخرة",
    brand: "كوتش",
    price: 520,
    originalPrice: 980,
    discount: 47,
    rating: 4.9,
    reviewCount: 560,
    image: IMG.p4,
    images: [IMG.p4, IMG.p5],
    category: "إكسسوارات",
    categoryId: "accessories",
    tags: ["حقيبة", "جلدية", "فاخرة"],
    inStock: true,
    colors: ["#8B4513", "#000000", "#C0C0C0"],
    descriptionAr:
      "حقيبة يد فاخرة من الجلد الطبيعي الأصيل بتصميم كلاسيكي يناسب كل المناسبات. مع قسمين داخليين وجيب خارجي.",
    isNew: false,
    isFeatured: true,
    isFlashSale: false,
    soldCount: 1100,
    deliveryDays: 3,
  },
  {
    id: "prod6",
    nameAr: "ساعة ذكية Pro Max",
    brand: "سامسونج",
    price: 780,
    originalPrice: 1200,
    discount: 35,
    rating: 4.7,
    reviewCount: 3400,
    image: IMG.p5,
    images: [IMG.p5, IMG.p6],
    category: "إلكترونيات",
    categoryId: "electronics",
    tags: ["ساعة", "ذكية", "تقنية"],
    inStock: true,
    colors: ["#000000", "#C0C0C0", "#FFD700"],
    descriptionAr:
      "ساعة ذكية متطورة بمميزات صحية متقدمة وشاشة AMOLED مشرقة. تدوم البطارية حتى 7 أيام مع مقاومة للماء 50 متر.",
    isNew: true,
    isFeatured: true,
    isFlashSale: true,
    soldCount: 5600,
    deliveryDays: 1,
  },
  {
    id: "prod7",
    nameAr: "سماعات لاسلكية فائقة",
    brand: "سوني",
    price: 450,
    originalPrice: 750,
    discount: 40,
    rating: 4.8,
    reviewCount: 2800,
    image: IMG.p6,
    images: [IMG.p6, IMG.p5],
    category: "إلكترونيات",
    categoryId: "electronics",
    tags: ["سماعات", "لاسلكية", "ANC"],
    inStock: true,
    colors: ["#000000", "#FFFFFF", "#1D2D50"],
    descriptionAr:
      "سماعات لاسلكية بتقنية إلغاء الضوضاء النشطة وجودة صوت استثنائية تحاكي الاستديوهات الاحترافية. بطارية تدوم 30 ساعة.",
    isNew: false,
    isFeatured: false,
    isFlashSale: true,
    soldCount: 7200,
    deliveryDays: 2,
  },
  {
    id: "prod8",
    nameAr: "عطر ورد الطائف الفاخر",
    brand: "عربيك عود",
    price: 850,
    originalPrice: 1200,
    discount: 29,
    rating: 4.9,
    reviewCount: 234,
    image: IMG.p3,
    images: [IMG.p3],
    category: "عناية وجمال",
    categoryId: "beauty",
    tags: ["عطر", "ورد الطائف", "فاخر"],
    inStock: true,
    descriptionAr:
      "عطر ورد الطائف الأصيل، رائحة مميزة تدوم طويلاً مستخلصة من أجود أنواع ورد الطائف بتقنية عصرية فريدة.",
    isNew: false,
    isFeatured: true,
    isFlashSale: false,
    soldCount: 480,
    deliveryDays: 2,
  },
  {
    id: "prod9",
    nameAr: "مجموعة مكياج احترافية",
    brand: "MAC",
    price: 620,
    originalPrice: 950,
    discount: 35,
    rating: 4.7,
    reviewCount: 890,
    image: IMG.p1,
    images: [IMG.p1],
    category: "عناية وجمال",
    categoryId: "beauty",
    tags: ["مكياج", "احترافي"],
    inStock: true,
    descriptionAr:
      "مجموعة مكياج احترافية شاملة تحتوي على كل ما تحتاجينه لإطلالة مثالية طوال اليوم. 24 لون + أدوات احترافية.",
    isNew: true,
    isFeatured: false,
    isFlashSale: true,
    soldCount: 1240,
    deliveryDays: 3,
  },
  {
    id: "prod10",
    nameAr: "سجادة تركية فاخرة",
    brand: "أرابيسك",
    price: 1200,
    originalPrice: 2000,
    discount: 40,
    rating: 4.8,
    reviewCount: 178,
    image: IMG.p4,
    images: [IMG.p4],
    category: "ديكور المنزل",
    categoryId: "home",
    tags: ["سجادة", "تركية", "فاخرة"],
    inStock: true,
    descriptionAr:
      "سجادة تركية يدوية الصنع بألوان زاهية وتصاميم كلاسيكية تضيف لمسة من الفخامة والأصالة لمنزلك.",
    isNew: false,
    isFeatured: true,
    isFlashSale: false,
    soldCount: 340,
    deliveryDays: 5,
  },
  {
    id: "prod11",
    nameAr: "طقم أواني سيراميك فاخر",
    brand: "روتشيلت",
    price: 380,
    originalPrice: 580,
    discount: 34,
    rating: 4.5,
    reviewCount: 425,
    image: IMG.p2,
    images: [IMG.p2],
    category: "ديكور المنزل",
    categoryId: "home",
    tags: ["أواني", "سيراميك", "مطبخ"],
    inStock: true,
    descriptionAr:
      "طقم أواني سيراميك عالي الجودة بألوان جميلة، مناسب للفرن والموقد ولزخرفة المطبخ العصري.",
    isNew: true,
    isFeatured: false,
    isFlashSale: false,
    soldCount: 620,
    deliveryDays: 4,
  },
  {
    id: "prod12",
    nameAr: "إسورة ذهبية رقيقة",
    brand: "صايغة",
    price: 195,
    originalPrice: 280,
    discount: 30,
    rating: 4.6,
    reviewCount: 920,
    image: IMG.p5,
    images: [IMG.p5],
    category: "إكسسوارات",
    categoryId: "accessories",
    tags: ["إسورة", "ذهبية", "رقيقة"],
    inStock: true,
    colors: ["#FFD700", "#C0C0C0", "#B87333"],
    descriptionAr:
      "إسورة ذهبية رقيقة أنيقة مصنوعة من الذهب عيار 18، تناسب الارتداء اليومي والمناسبات الفاخرة.",
    isNew: false,
    isFeatured: false,
    isFlashSale: false,
    soldCount: 2300,
    deliveryDays: 2,
  },
];

export const REVIEWS: Review[] = [
  {
    id: "r1",
    userName: "سارة أحمد",
    rating: 5,
    commentAr: "منتج رائع جداً! الجودة ممتازة والتوصيل كان سريعاً. سأشتري مرة أخرى بالتأكيد.",
    date: "١٥ مارس ٢٠٢٤",
    helpful: 24,
  },
  {
    id: "r2",
    userName: "فاطمة العلي",
    rating: 4,
    commentAr: "جميل جداً وتطابق الوصف. الخامة ممتازة والتصميم أنيق. التوصيل جاء في الوقت المحدد.",
    date: "٨ مارس ٢٠٢٤",
    helpful: 18,
  },
  {
    id: "r3",
    userName: "نور محمد",
    rating: 5,
    commentAr: "أفضل شراء قمت به! المنتج يستحق كل ريال. التغليف أنيق والمنتج في حالة ممتازة.",
    date: "١ مارس ٢٠٢٤",
    helpful: 31,
  },
];

export const FLASH_SALE_PRODUCTS = PRODUCTS.filter((p) => p.isFlashSale);
export const FEATURED_PRODUCTS = PRODUCTS.filter((p) => p.isFeatured);
export const NEW_ARRIVALS = PRODUCTS.filter((p) => p.isNew);
