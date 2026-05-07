export interface CouponDefinition {
  code: string;
  descAr: string;
  discount: number;
  discountLabel: string;
  expiry: string;
  expiryDate: Date;
  minOrder?: number;
}

export const COUPONS: CouponDefinition[] = [
  {
    code: "SAUDI30",
    descAr: "خصم ٣٠٪ على جميع المنتجات",
    discount: 0.30,
    discountLabel: "٣٠٪",
    expiry: "٣١ مايو ٢٠٢٦",
    expiryDate: new Date(2026, 4, 31),
    minOrder: 200,
  },
  {
    code: "WELCOME10",
    descAr: "خصم ترحيبي ١٠٪ للعملاء الجدد",
    discount: 0.10,
    discountLabel: "١٠٪",
    expiry: "٣٠ يونيو ٢٠٢٦",
    expiryDate: new Date(2026, 5, 30),
  },
  {
    code: "FLASH50",
    descAr: "خصم ٥٠٪ - عرض محدود المدة",
    discount: 0.50,
    discountLabel: "٥٠٪",
    expiry: "٥ مايو ٢٠٢٦",
    expiryDate: new Date(2026, 4, 5),
    minOrder: 500,
  },
  {
    code: "VIP20",
    descAr: "خصم ٢٠٪ حصري للعملاء المميزين",
    discount: 0.20,
    discountLabel: "٢٠٪",
    expiry: "٣١ ديسمبر ٢٠٢٦",
    expiryDate: new Date(2026, 11, 31),
    minOrder: 100,
  },
];

export interface CouponMapEntry {
  discount: number;
  label: string;
  minOrder?: number;
  expiryDate: Date;
}

export const COUPON_MAP: Record<string, CouponMapEntry> = Object.fromEntries(
  COUPONS.map((c) => [
    c.code,
    {
      discount: c.discount,
      label: `خصم ${c.discountLabel}`,
      minOrder: c.minOrder,
      expiryDate: c.expiryDate,
    },
  ])
);

export function isCouponExpired(entry: CouponMapEntry): boolean {
  return entry.expiryDate < new Date();
}

export function validateCoupon(
  code: string,
  subtotal: number
): { valid: true; entry: CouponMapEntry } | { valid: false; error: string } {
  const entry = COUPON_MAP[code.trim().toUpperCase()];
  if (!entry) return { valid: false, error: "كود الخصم غير صحيح" };
  if (isCouponExpired(entry)) return { valid: false, error: "انتهت صلاحية هذا الكوبون" };
  if (entry.minOrder && subtotal < entry.minOrder) {
    return {
      valid: false,
      error: `الحد الأدنى للطلب ${entry.minOrder.toLocaleString("ar-SA")} ر.س`,
    };
  }
  return { valid: true, entry };
}

export const QUICK_COUPON_CODES = ["SAUDI30", "WELCOME10"];
