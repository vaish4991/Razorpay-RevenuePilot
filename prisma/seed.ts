import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  category: string;
  priceInPaise: number;
  inventoryQuantity: number;
  metadata?: Prisma.InputJsonValue;
};

const merchantSeed = {
  name: "NovaCart Electronics",
  slug: "novacart-electronics",
  currency: "INR",
};

const products: SeedProduct[] = [
  {
    name: "NovaBeat ANC Pro Headphones",
    slug: "novabeat-anc-pro-headphones",
    description: "Wireless over-ear ANC headphones with 40-hour battery and fast charging.",
    category: "headphones",
    priceInPaise: 899900,
    inventoryQuantity: 120,
    metadata: { relatedSlugs: ["airmesh-laptop-stand-pro", "chargecore-65w-gan-charger"] },
  },
  {
    name: "PulseLite Wireless Earbuds",
    slug: "pulselite-wireless-earbuds",
    description: "Compact true wireless earbuds tuned for calls and commute listening.",
    category: "headphones",
    priceInPaise: 349900,
    inventoryQuantity: 200,
    metadata: { relatedSlugs: ["chargecore-dual-usb-c-cable", "chargecore-30w-mini-charger"] },
  },
  {
    name: "StudioTone Monitoring Headphones",
    slug: "studiotone-monitoring-headphones",
    description: "Closed-back studio monitoring headphones for podcast and editing workflows.",
    category: "headphones",
    priceInPaise: 599900,
    inventoryQuantity: 80,
    metadata: { relatedSlugs: ["voicecraft-usb-microphone", "clearcast-pop-filter-kit"] },
  },
  {
    name: "TypeFlow Mechanical Keyboard",
    slug: "typeflow-mechanical-keyboard",
    description: "Hot-swappable mechanical keyboard with tactile switches and RGB backlight.",
    category: "keyboards",
    priceInPaise: 749900,
    inventoryQuantity: 95,
    metadata: { relatedSlugs: ["swiftglide-wireless-mouse", "deskmat-xl-carbon"] },
  },
  {
    name: "TypeFlow Wireless Compact Keyboard",
    slug: "typeflow-wireless-compact-keyboard",
    description: "Low-profile wireless keyboard for hybrid work and multi-device switching.",
    category: "keyboards",
    priceInPaise: 459900,
    inventoryQuantity: 130,
    metadata: { relatedSlugs: ["swiftglide-silent-mouse", "airmesh-laptop-stand-lite"] },
  },
  {
    name: "CodeKey Ergo Split Keyboard",
    slug: "codekey-ergo-split-keyboard",
    description: "Ergonomic split keyboard with tenting kit and programmable layers.",
    category: "keyboards",
    priceInPaise: 1099900,
    inventoryQuantity: 45,
    metadata: { relatedSlugs: ["swiftglide-trackball-mouse", "wristrest-memory-foam-pair"] },
  },
  {
    name: "SwiftGlide Wireless Mouse",
    slug: "swiftglide-wireless-mouse",
    description: "2.4G wireless productivity mouse with adjustable DPI and side buttons.",
    category: "mice",
    priceInPaise: 199900,
    inventoryQuantity: 240,
    metadata: { relatedSlugs: ["typeflow-mechanical-keyboard", "airmesh-laptop-stand-lite"] },
  },
  {
    name: "SwiftGlide Silent Mouse",
    slug: "swiftglide-silent-mouse",
    description: "Silent click Bluetooth mouse for shared office and late-night sessions.",
    category: "mice",
    priceInPaise: 259900,
    inventoryQuantity: 180,
    metadata: { relatedSlugs: ["typeflow-wireless-compact-keyboard", "dockport-7in1-usb-c-hub"] },
  },
  {
    name: "SwiftGlide Trackball Mouse",
    slug: "swiftglide-trackball-mouse",
    description: "Ergonomic trackball mouse for reduced wrist movement over long sessions.",
    category: "mice",
    priceInPaise: 499900,
    inventoryQuantity: 60,
    metadata: { relatedSlugs: ["codekey-ergo-split-keyboard", "wristrest-memory-foam-pair"] },
  },
  {
    name: "FocusCam 1080p Webcam",
    slug: "focuscam-1080p-webcam",
    description: "1080p webcam with autofocus and privacy shutter for meetings.",
    category: "webcams",
    priceInPaise: 389900,
    inventoryQuantity: 110,
    metadata: { relatedSlugs: ["voicecraft-usb-microphone", "ringlight-mini-desk"] },
  },
  {
    name: "FocusCam 4K Webcam",
    slug: "focuscam-4k-webcam",
    description: "4K webcam with HDR and dual noise-reduction microphones.",
    category: "webcams",
    priceInPaise: 849900,
    inventoryQuantity: 70,
    metadata: { relatedSlugs: ["voicecraft-pro-xlr-microphone", "armflex-boom-arm"] },
  },
  {
    name: "DeskView UltraWide Webcam",
    slug: "deskview-ultrawide-webcam",
    description: "Ultra-wide webcam optimized for product demos and whiteboard framing.",
    category: "webcams",
    priceInPaise: 629900,
    inventoryQuantity: 55,
    metadata: { relatedSlugs: ["voicecraft-usb-microphone", "clearcast-pop-filter-kit"] },
  },
  {
    name: "VoiceCraft USB Microphone",
    slug: "voicecraft-usb-microphone",
    description: "Cardioid USB microphone with gain control for streaming and podcasts.",
    category: "microphones",
    priceInPaise: 549900,
    inventoryQuantity: 85,
    metadata: { relatedSlugs: ["focuscam-1080p-webcam", "armflex-boom-arm"] },
  },
  {
    name: "VoiceCraft Pro XLR Microphone",
    slug: "voicecraft-pro-xlr-microphone",
    description: "Broadcast-grade XLR microphone with low self-noise and rich vocal capture.",
    category: "microphones",
    priceInPaise: 1299900,
    inventoryQuantity: 35,
    metadata: { relatedSlugs: ["focuscam-4k-webcam", "mixmate-mini-audio-interface"] },
  },
  {
    name: "ClearCast Pop Filter Kit",
    slug: "clearcast-pop-filter-kit",
    description: "Dual-layer pop filter and shock mount kit for cleaner vocal recordings.",
    category: "microphones",
    priceInPaise: 89900,
    inventoryQuantity: 150,
    metadata: { relatedSlugs: ["voicecraft-usb-microphone", "voicecraft-pro-xlr-microphone"] },
  },
  {
    name: "AirMesh Laptop Stand Pro",
    slug: "airmesh-laptop-stand-pro",
    description: "Aluminum height-adjustable stand with cable routing channel.",
    category: "laptop-stands",
    priceInPaise: 279900,
    inventoryQuantity: 140,
    metadata: { relatedSlugs: ["typeflow-wireless-compact-keyboard", "swiftglide-wireless-mouse"] },
  },
  {
    name: "AirMesh Laptop Stand Lite",
    slug: "airmesh-laptop-stand-lite",
    description: "Foldable laptop riser for compact desks and travel setups.",
    category: "laptop-stands",
    priceInPaise: 159900,
    inventoryQuantity: 190,
    metadata: { relatedSlugs: ["typeflow-wireless-compact-keyboard", "swiftglide-silent-mouse"] },
  },
  {
    name: "PostureLift Vertical Laptop Stand",
    slug: "posturelift-vertical-laptop-stand",
    description: "Vertical stand for docked laptops to save desk space near monitors.",
    category: "laptop-stands",
    priceInPaise: 219900,
    inventoryQuantity: 90,
    metadata: { relatedSlugs: ["dockport-7in1-usb-c-hub", "pixelview-27-qhd-monitor"] },
  },
  {
    name: "DockPort 7-in-1 USB-C Hub",
    slug: "dockport-7in1-usb-c-hub",
    description: "USB-C hub with HDMI, USB-A, SD card and passthrough charging.",
    category: "usb-hubs",
    priceInPaise: 329900,
    inventoryQuantity: 160,
    metadata: { relatedSlugs: ["pixelview-27-qhd-monitor", "chargecore-65w-gan-charger"] },
  },
  {
    name: "DockPort 10-in-1 USB-C Hub",
    slug: "dockport-10in1-usb-c-hub",
    description: "Expanded hub with dual display support and gigabit ethernet.",
    category: "usb-hubs",
    priceInPaise: 489900,
    inventoryQuantity: 100,
    metadata: { relatedSlugs: ["pixelview-32-4k-monitor", "posturelift-vertical-laptop-stand"] },
  },
  {
    name: "DockPort Travel USB Hub",
    slug: "dockport-travel-usb-hub",
    description: "Ultra-compact hub for everyday charging and peripheral access.",
    category: "usb-hubs",
    priceInPaise: 189900,
    inventoryQuantity: 220,
    metadata: { relatedSlugs: ["chargecore-dual-usb-c-cable", "airmesh-laptop-stand-lite"] },
  },
  {
    name: "PixelView 24 FHD Monitor",
    slug: "pixelview-24-fhd-monitor",
    description: "24-inch FHD IPS monitor with low-blue-light mode and slim bezels.",
    category: "monitors",
    priceInPaise: 1099900,
    inventoryQuantity: 75,
    metadata: { relatedSlugs: ["dockport-7in1-usb-c-hub", "armflex-dual-monitor-arm"] },
  },
  {
    name: "PixelView 27 QHD Monitor",
    slug: "pixelview-27-qhd-monitor",
    description: "27-inch QHD monitor with 95% DCI-P3 color and USB-C input.",
    category: "monitors",
    priceInPaise: 1899900,
    inventoryQuantity: 50,
    metadata: { relatedSlugs: ["dockport-10in1-usb-c-hub", "chargecore-90w-gan-charger"] },
  },
  {
    name: "PixelView 32 4K Monitor",
    slug: "pixelview-32-4k-monitor",
    description: "32-inch 4K productivity monitor with KVM and HDR10.",
    category: "monitors",
    priceInPaise: 3299900,
    inventoryQuantity: 28,
    metadata: { relatedSlugs: ["dockport-10in1-usb-c-hub", "armflex-dual-monitor-arm"] },
  },
  {
    name: "ChargeCore 30W Mini Charger",
    slug: "chargecore-30w-mini-charger",
    description: "Compact GaN wall charger for phones, earbuds and lightweight devices.",
    category: "chargers",
    priceInPaise: 149900,
    inventoryQuantity: 260,
    metadata: { relatedSlugs: ["pulselite-wireless-earbuds", "chargecore-dual-usb-c-cable"] },
  },
  {
    name: "ChargeCore 65W GaN Charger",
    slug: "chargecore-65w-gan-charger",
    description: "65W fast charger for laptops, tablets and accessories.",
    category: "chargers",
    priceInPaise: 299900,
    inventoryQuantity: 170,
    metadata: { relatedSlugs: ["dockport-7in1-usb-c-hub", "novabeat-anc-pro-headphones"] },
  },
  {
    name: "ChargeCore 90W GaN Charger",
    slug: "chargecore-90w-gan-charger",
    description: "High-output multi-port GaN charger for dual-device workstation charging.",
    category: "chargers",
    priceInPaise: 429900,
    inventoryQuantity: 120,
    metadata: { relatedSlugs: ["pixelview-27-qhd-monitor", "dockport-10in1-usb-c-hub"] },
  },
  {
    name: "DeskMat XL Carbon",
    slug: "deskmat-xl-carbon",
    description: "Large anti-slip desk mat designed for keyboard and mouse setups.",
    category: "accessories",
    priceInPaise: 129900,
    inventoryQuantity: 210,
    metadata: { relatedSlugs: ["typeflow-mechanical-keyboard", "swiftglide-wireless-mouse"] },
  },
  {
    name: "WristRest Memory Foam Pair",
    slug: "wristrest-memory-foam-pair",
    description: "Keyboard and mouse wrist support set for long coding sessions.",
    category: "accessories",
    priceInPaise: 109900,
    inventoryQuantity: 180,
    metadata: { relatedSlugs: ["codekey-ergo-split-keyboard", "swiftglide-trackball-mouse"] },
  },
  {
    name: "ArmFlex Boom Arm",
    slug: "armflex-boom-arm",
    description: "Microphone boom arm with internal cable channel and desk clamp.",
    category: "accessories",
    priceInPaise: 219900,
    inventoryQuantity: 95,
    metadata: { relatedSlugs: ["voicecraft-usb-microphone", "focuscam-4k-webcam"] },
  },
  {
    name: "ArmFlex Dual Monitor Arm",
    slug: "armflex-dual-monitor-arm",
    description: "Dual monitor gas-spring arm for ergonomic workstation alignment.",
    category: "accessories",
    priceInPaise: 539900,
    inventoryQuantity: 70,
    metadata: { relatedSlugs: ["pixelview-24-fhd-monitor", "pixelview-32-4k-monitor"] },
  },
  {
    name: "RingLight Mini Desk",
    slug: "ringlight-mini-desk",
    description: "Adjustable desk ring light for video calls and creator lighting.",
    category: "accessories",
    priceInPaise: 179900,
    inventoryQuantity: 125,
    metadata: { relatedSlugs: ["focuscam-1080p-webcam", "deskview-ultrawide-webcam"] },
  },
  {
    name: "MixMate Mini Audio Interface",
    slug: "mixmate-mini-audio-interface",
    description: "2-channel USB audio interface for XLR microphones and instruments.",
    category: "accessories",
    priceInPaise: 699900,
    inventoryQuantity: 52,
    metadata: { relatedSlugs: ["voicecraft-pro-xlr-microphone", "clearcast-pop-filter-kit"] },
  },
  {
    name: "ChargeCore Dual USB-C Cable",
    slug: "chargecore-dual-usb-c-cable",
    description: "Braided dual USB-C cable pack for charging and data sync.",
    category: "accessories",
    priceInPaise: 79900,
    inventoryQuantity: 300,
    metadata: { relatedSlugs: ["chargecore-30w-mini-charger", "dockport-travel-usb-hub"] },
  },
];

const customers = [
  { externalReference: "cust_demo_001", name: "Aarav Sharma", email: "aarav.sharma@example.com" },
  { externalReference: "cust_demo_002", name: "Isha Menon", email: "isha.menon@example.com" },
  { externalReference: "cust_demo_003", name: "Rohan Deshpande", email: "rohan.deshpande@example.com" },
  { externalReference: "cust_demo_004", name: "Neha Batra", email: "neha.batra@example.com" },
  { externalReference: "cust_demo_005", name: "Vikram Sethi", email: "vikram.sethi@example.com" },
  { externalReference: "cust_demo_006", name: "Maya Nair", email: "maya.nair@example.com" },
  { externalReference: "cust_demo_007", name: "Kabir Rao", email: "kabir.rao@example.com" },
  { externalReference: "cust_demo_008", name: "Ananya Verma", email: "ananya.verma@example.com" },
];

async function main() {
  await prisma.merchant.deleteMany({ where: { slug: merchantSeed.slug } });

  const merchant = await prisma.merchant.create({
    data: {
      ...merchantSeed,
      products: {
        create: products.map((product) => ({
          ...product,
          currency: merchantSeed.currency,
        })),
      },
      customers: {
        create: customers,
      },
    },
    include: {
      products: true,
      customers: true,
    },
  });

  console.log(
    JSON.stringify(
      {
        merchant: merchant.name,
        merchantSlug: merchant.slug,
        productsSeeded: merchant.products.length,
        customersSeeded: merchant.customers.length,
      },
      null,
      2,
    ),
  );
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
