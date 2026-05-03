export interface CouponDefinition {
  code: string;
  descAr: string;
  discount: number;
  discountLabel: string;
  expiry: string;
  minOrder?: number;
}

export const COUPONS: CouponDefinition[] = [
  {
    code: "SAUDI30",
    descAr: "خصم ٣٠٪ على جميع المنتجات",
    discount: 0.30,
    discountLabel: "٣٠٪",
    expiry: "٣١ مايو ٢٠٢٦",
    minOrder: 200,
  },
  {
    code: "WELCOME10",
    descAr: "خصم ترحيبي ١٠٪ للعملاء الجدد",
    discount: 0.10,
    discountLabel: "١٠٪",
    expiry: "٣٠ يونيو ٢٠٢٦",
  },
  {
    code: "FLASH50",
    descAr: "خصم ٥٠٪ - عرض محدود المدة",
    discount: 0.50,
    discountLabel: "٥٠٪",
    expiry: "٥ مايو ٢٠٢٦",
    minOrder: 500,
  },
  {
    code: "VIP20",
    descAr: "خصم ٢٠٪ حصري للعملاء المميزين",
    discount: 0.20,
    discountLabel: "٢٠٪",
    expiry: "٣١ ديسمبر ٢٠٢٦",
    minOrder: 100,
  },
];

export const COUPON_MAP: Record<string, { discount: number; label: string }> =
  Object.fromEntries(
    COUPONS.map((c) => [c.code, { discount: c.discount, label: `خصم ${c.discountLabel}` }])
  );

export const QUICK_COUPON_CODES = ["SAUDI30", "WELCOME10"];
