export interface Order {
  id: string;
  number: string;
  date: string;
  status: "delivered" | "shipping" | "processing" | "cancelled";
  statusAr: string;
  items: string[];
  productIds?: string[];
  total: number;
  itemCount: number;
}

export const MOCK_ORDERS: Order[] = [
  {
    id: "o1",
    number: "SAQ-829341",
    date: "٢ مايو ٢٠٢٦",
    status: "shipping",
    statusAr: "في الطريق",
    items: ["فستان صيفي أنيق", "حقيبة جلدية"],
    total: 489,
    itemCount: 2,
  },
  {
    id: "o2",
    number: "SAQ-718204",
    date: "٢٨ أبريل ٢٠٢٦",
    status: "delivered",
    statusAr: "تم التسليم",
    items: ["ساعة ذكية فاخرة"],
    productIds: ["prod6"],
    total: 1250,
    itemCount: 1,
  },
  {
    id: "o3",
    number: "SAQ-603915",
    date: "١٥ أبريل ٢٠٢٦",
    status: "delivered",
    statusAr: "تم التسليم",
    items: ["سماعات لاسلكية", "حافظة جلدية", "شاحن سريع"],
    productIds: ["prod7", "prod5"],
    total: 670,
    itemCount: 3,
  },
  {
    id: "o4",
    number: "SAQ-512007",
    date: "١ أبريل ٢٠٢٦",
    status: "cancelled",
    statusAr: "ملغي",
    items: ["عطر فرنسي فاخر"],
    total: 320,
    itemCount: 1,
  },
  {
    id: "o5",
    number: "SAQ-401183",
    date: "١٨ مارس ٢٠٢٦",
    status: "delivered",
    statusAr: "تم التسليم",
    items: ["بلوزة قطنية", "بنطلون جينز"],
    productIds: ["prod2", "prod4"],
    total: 235,
    itemCount: 2,
  },
];

export const ACTIVE_ORDER = MOCK_ORDERS.find((o) => o.status === "shipping");
