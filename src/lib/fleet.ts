// Vehicle data drives /fleet/, /fleet/[slug]/, the quote prefill and the
// sitemap. Only specs the site already states (seats, AC, clean) are used;
// add luggage capacity etc. here once you have confirmed figures.

export type Vehicle = {
  slug: string;
  name: string;
  src: string;
  seats: number;
  tag: string;
  /** Heading used on the fleet index card. */
  h2: string;
  desc: string;
  idealFor: string[];
  /** Route slugs (src/lib/routes.ts) this vehicle is commonly booked for. */
  routeSlugs: string[];
  faqs: { q: string; a: string }[];
};

export const fleet: Vehicle[] = [
  {
    slug: "toyota-camry",
    name: "Toyota Camry",
    src: "/camry.webp",
    seats: 4,
    tag: "Economy",
    h2: "Book 4-seater Camry for Umrah Taxi Service in Saudi Arabia",
    desc: "Perfect for individuals or couples. Comfortable, fuel-efficient, and easy to navigate through the holy city.",
    idealFor: ["Solo travellers and couples", "Small families with light luggage", "Airport pickups and hotel transfers", "Short city and intercity trips"],
    routeSlugs: ["jeddah-airport-to-makkah", "makkah-to-jeddah-airport", "makkah-to-madinah"],
    faqs: [
      { q: "How many passengers fit in a Toyota Camry?", a: "It seats four. If you are travelling with a lot of luggage, tell us when you ask for a quote and we'll suggest a larger vehicle." },
      { q: "Is the Camry suitable for Makkah to Madinah?", a: "Yes, it is a comfortable choice for up to three passengers on the intercity journey. Larger groups should choose a bigger vehicle." },
    ],
  },
  {
    slug: "hyundai-staria",
    name: "Hyundai Staria",
    src: "/staria.webp",
    seats: 7,
    tag: "Premium",
    h2: "Book 7-seater Staria for Umrah Taxi Service in Saudi Arabia",
    desc: "Spacious premium MPV ideal for small families. Modern interior with wide seats and ample legroom.",
    idealFor: ["Families of up to seven", "Longer intercity journeys where legroom matters", "Travellers with several suitcases", "Ziyarat tours with a family group"],
    routeSlugs: ["jeddah-airport-to-makkah", "jeddah-airport-to-madinah", "makkah-to-madinah", "madinah-to-makkah"],
    faqs: [
      { q: "How many passengers fit in a Hyundai Staria?", a: "It seats seven passengers in a spacious layout. Tell us your luggage so we can confirm it suits your group." },
      { q: "Is the Staria good for long journeys?", a: "Yes. Its wide seats and legroom make it a popular choice for the Makkah to Madinah route and other longer transfers." },
    ],
  },
  {
    slug: "gmc-yukon",
    name: "GMC Yukon",
    src: "/Gmc.webp",
    seats: 7,
    tag: "Luxury",
    h2: "Book 7-seater GMC for Umrah Taxi Service in Saudi Arabia",
    desc: "Full-size luxury SUV for those who want a premium experience with extra comfort and style.",
    idealFor: ["Guests who want a premium, high-comfort ride", "Families with lots of luggage", "Long-distance and cross-city transfers", "VIP and executive travel"],
    routeSlugs: ["makkah-to-madinah", "riyadh-to-makkah", "riyadh-to-jeddah", "madinah-to-alula"],
    faqs: [
      { q: "How many passengers fit in a GMC Yukon?", a: "It seats seven in a full-size SUV. Tell us your group size and luggage when you ask for a quote." },
      { q: "Is the Yukon a good choice for long distances?", a: "Yes. The extra space and comfort make it a popular pick for journeys like Riyadh to Makkah." },
    ],
  },
  {
    slug: "toyota-hiace",
    name: "Toyota Hiace",
    src: "/hiace-11-seater.webp",
    seats: 11,
    tag: "Group",
    h2: "Book 11-seater Hiace for Umrah Taxi Service in Saudi Arabia",
    desc: "Popular choice for medium-sized groups. Reliable, spacious, and great for Ziyarat tours.",
    idealFor: ["Groups of eight to eleven", "Extended families", "Ziyarat tours in Makkah and Madinah", "Airport pickups for groups with luggage"],
    routeSlugs: ["jeddah-airport-to-makkah", "jeddah-airport-to-madinah", "makkah-to-madinah"],
    faqs: [
      { q: "How many passengers fit in a Toyota Hiace?", a: "It seats eleven. For a full group with a lot of luggage, ask us whether a Coaster would be more comfortable." },
      { q: "Is the Hiace good for Ziyarat tours?", a: "Yes, it is a popular choice for medium-sized groups visiting several sites in one day." },
    ],
  },
  {
    slug: "toyota-coaster",
    name: "Toyota Coaster",
    src: "/coaster-17-seater.webp",
    seats: 17,
    tag: "Large Group",
    h2: "Book 17-seater Coaster for Umrah Taxi Service in Saudi Arabia",
    desc: "Best for large families or group packages. Comfortable bus-style seating with AC throughout.",
    idealFor: ["Groups of twelve to seventeen", "Umrah group packages", "Large families travelling together", "Travel agents and group organisers"],
    routeSlugs: ["jeddah-airport-to-makkah", "makkah-to-madinah", "madinah-to-makkah"],
    faqs: [
      { q: "How many passengers fit in a Toyota Coaster?", a: "It seats seventeen with air conditioning throughout. For groups larger than that, we can arrange more than one vehicle." },
      { q: "Do you offer group packages with the Coaster?", a: "Yes. See our group packages page, or WhatsApp us your dates and group size for a quote." },
    ],
  },
];

export function getVehicle(slug: string): Vehicle | undefined {
  return fleet.find((v) => v.slug === slug);
}

export function getVehicleByName(name: string): Vehicle | undefined {
  return fleet.find((v) => v.name.toLowerCase() === name.toLowerCase());
}
