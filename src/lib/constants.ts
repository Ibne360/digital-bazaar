export const SITE = {
  name: "Digital Bazaar",
  tagline: "Get Digital Products at Wholesale Prices",
  description:
    "The premium marketplace for AI subscriptions, design tools, dev kits, and digital credits — instant delivery, lifetime warranty, wholesale tier for resellers.",
  url: "https://digital-bazaar.local",
  currency: "USD" as const,
};

/** Public WhatsApp group invite link for live customer support. */
export const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/FoDA5kHvG4UBE6pBdgaXpv";

export const RESELLER_COMMISSION_RATE = 0.1;
/** Wallet uses USD. Minimum deposit / withdraw expressed in USD. */
export const MIN_DEPOSIT = 1; // 1 USD
export const MIN_WITHDRAW = 5; // 5 USD
/** BDT to USD conversion rate for Bangladeshi deposit methods. */
export const BDT_PER_USD = 125;
/** Equivalent BDT minimums for UX hints. */
export const MIN_DEPOSIT_BDT = MIN_DEPOSIT * BDT_PER_USD; // 125 BDT
export const MIN_WITHDRAW_BDT = MIN_WITHDRAW * BDT_PER_USD; // 625 BDT

export const HERO_BADGES = [
  "Instant Delivery",
  "100% Warranty",
  "Wholesale Available",
  "24/7 Support",
];

export const PRODUCT_BADGES = {
  INSTANT: "instant",
  LIMITED: "limited",
  HOT: "hot",
  WHOLESALE: "wholesale",
  NEW: "new",
} as const;

export type DepositMethodId =
  | "bkash"
  | "nagad"
  | "rocket"
  | "bank"
  | "binance"
  | "usdt";

export interface DepositMethodMeta {
  id: DepositMethodId;
  label: string;
  account: string;
  type: "Personal" | "Agent" | "Bank" | "Crypto";
  /** Currency the user actually pays in. Wallet always credits USD. */
  payCurrency: "BDT" | "USD";
  instructions: string;
  color: string;
}

export const DEPOSIT_METHODS: DepositMethodMeta[] = [
  {
    id: "bkash",
    label: "bKash",
    account: "01711-000000",
    type: "Personal",
    payCurrency: "BDT",
    instructions:
      "Send Money to the bKash personal number above. Use the exact TrxID after success.",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "nagad",
    label: "Nagad",
    account: "01755-000000",
    type: "Personal",
    payCurrency: "BDT",
    instructions:
      "Send Money to the Nagad personal number above. Then submit the TrxID.",
    color: "from-orange-500 to-amber-600",
  },
  {
    id: "rocket",
    label: "Rocket",
    account: "017550000000",
    type: "Personal",
    payCurrency: "BDT",
    instructions: "Send Money to the Rocket personal number, then submit TrxID.",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "bank",
    label: "Bank Transfer",
    account: "Digital Bazaar · DBBL · 123456789012",
    type: "Bank",
    payCurrency: "BDT",
    instructions:
      "Transfer to the DBBL account above (any bank/branch). Submit reference / TrxID.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "binance",
    label: "Binance Pay",
    account: "Pay ID: 192 837 465",
    type: "Crypto",
    payCurrency: "USD",
    instructions:
      "Send USD-equivalent USDT via Binance Pay to the ID above. Submit Binance order ID.",
    color: "from-yellow-400 to-amber-500",
  },
  {
    id: "usdt",
    label: "USDT (TRC20)",
    account: "TXYZab1234567890DigitalBazaar",
    type: "Crypto",
    payCurrency: "USD",
    instructions:
      "Send USDT (TRC-20) to the address above and submit the transaction hash.",
    color: "from-green-500 to-emerald-600",
  },
];

export function depositMethodMeta(id: string) {
  return DEPOSIT_METHODS.find((m) => m.id === id);
}

export const DELIVERY_LABEL: Record<string, string> = {
  account: "Login credentials",
  license_key: "License Key / CDK",
  invite_link: "Invite link",
  credits: "Credit top-up",
  manual: "Manual fulfilment",
};
