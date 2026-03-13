import type { Offer } from "../backend";

export const SAMPLE_OFFERS: (Offer & { isDemo?: boolean })[] = [
  {
    id: BigInt(1),
    title: "NordVPN — Ultimate Privacy Suite",
    description:
      "Military-grade encryption, 6000+ servers, no-logs policy. The gold standard in VPN security trusted by 15M+ users.",
    imageUrl: "/assets/generated/offer-vpn.dim_600x400.jpg",
    affiliateUrl: "https://nordvpn.com",
    category: "Software",
    commissionRate: 40,
    featured: true,
    active: true,
    isDemo: true,
  },
  {
    id: BigInt(2),
    title: "Masterclass — All-Access Pass",
    description:
      "Learn from 180+ world-class instructors. Gordon Ramsay, Neil deGrasse Tyson, Serena Williams and more.",
    imageUrl: "/assets/generated/offer-course.dim_600x400.jpg",
    affiliateUrl: "https://masterclass.com",
    category: "Education",
    commissionRate: 25,
    featured: true,
    active: true,
    isDemo: true,
  },
  {
    id: BigInt(3),
    title: "Cloudways — Managed Cloud Hosting",
    description:
      "Blazing-fast managed cloud hosting on AWS, Google Cloud, and DigitalOcean. 3-day free trial, no credit card needed.",
    imageUrl: "/assets/generated/offer-hosting.dim_600x400.jpg",
    affiliateUrl: "https://cloudways.com",
    category: "Hosting",
    commissionRate: 7,
    featured: false,
    active: true,
    isDemo: true,
  },
  {
    id: BigInt(4),
    title: "1Password — Zero-Knowledge Security",
    description:
      "The world's most-loved password manager. Store, autofill, and share passwords securely across all devices.",
    imageUrl: "/assets/generated/offer-password.dim_600x400.jpg",
    affiliateUrl: "https://1password.com",
    category: "Software",
    commissionRate: 25,
    featured: false,
    active: true,
    isDemo: true,
  },
  {
    id: BigInt(5),
    title: "ConvertKit — Creator Email Platform",
    description:
      "Email marketing built for creators. Automated sequences, landing pages, and commerce tools in one platform.",
    imageUrl: "/assets/generated/offer-email.dim_600x400.jpg",
    affiliateUrl: "https://convertkit.com",
    category: "Marketing",
    commissionRate: 30,
    featured: true,
    active: true,
    isDemo: true,
  },
  {
    id: BigInt(6),
    title: "TradingView — Advanced Charting",
    description:
      "Professional charting platform with 100+ indicators, real-time data, and a community of 50M+ traders worldwide.",
    imageUrl: "/assets/generated/offer-trading.dim_600x400.jpg",
    affiliateUrl: "https://tradingview.com",
    category: "Finance",
    commissionRate: 30,
    featured: false,
    active: true,
    isDemo: true,
  },
];
