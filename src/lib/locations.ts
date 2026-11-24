// City data drives /locations/, /locations/[slug]/, the header menu, the
// homepage city cards and the sitemap.

export type Region = "Western" | "Central" | "Southern" | "Northern";

export type Location = {
  slug: string;
  name: string;
  region: Region;
  /** Short line for cards. */
  tagline: string;
  summary: string;
  airport?: { name: string; code: string };
  /** Existing dedicated airport-transfer page, if there is one. */
  airportPage?: string;
  highlights: string[];
  faqs: { q: string; a: string }[];
  /** Note for cities where the main purpose isn't Umrah. */
  umrahFocus: boolean;
};

export const locations: Location[] = [
  {
    slug: "makkah",
    name: "Makkah",
    region: "Western",
    tagline: "Umrah, Haram hotels and Ziyarat",
    summary:
      "Makkah is the heart of Umrah. We provide private transfers between your hotel and the Haram area, airport pickups from Jeddah and intercity journeys to Madinah, Taif and beyond.",
    airport: { name: "Jeddah King Abdulaziz International Airport", code: "JED" },
    airportPage: "/services/airport-transfer/jeddah/",
    highlights: ["Masjid al-Haram hotels", "Jabal Noor and Jabal Thawr Ziyarat", "Miqat stops on the way in", "Mina, Arafat and Muzdalifah visits"],
    faqs: [
      { q: "Which airport do I use for Makkah?", a: "Most pilgrims fly into Jeddah (KAIA), about 80 to 95 km from Makkah. We can meet you there and drive you straight to your hotel." },
      { q: "Can you take us on Ziyarat in Makkah?", a: "Yes. We offer private Ziyarat tours to the main sites in Makkah. See our Ziyarat tours page." },
    ],
    umrahFocus: true,
  },
  {
    slug: "madinah",
    name: "Madinah",
    region: "Western",
    tagline: "Prophet's Mosque, Ziyarat and airport",
    summary:
      "We provide private airport transfers from Madinah's Prince Mohammad Bin Abdulaziz Airport, hotel transfers near the Prophet's Mosque, Ziyarat tours and onward journeys to Makkah.",
    airport: { name: "Prince Mohammad Bin Abdulaziz Airport", code: "MED" },
    airportPage: "/services/airport-transfer/madinah/",
    highlights: ["Masjid an-Nabawi hotels", "Quba Mosque and Masjid al-Qiblatayn", "Jabal Uhud", "Dhul Hulaifah Miqat on the way to Makkah"],
    faqs: [
      { q: "Do you pick up from Madinah Airport?", a: "Yes. Send your flight number and we'll arrange a private transfer to your hotel." },
      { q: "Can you take us from Madinah to Makkah with a Miqat stop?", a: "Yes, we can stop at Dhul Hulaifah so you can enter Ihram, then continue to Makkah." },
    ],
    umrahFocus: true,
  },
  {
    slug: "jeddah",
    name: "Jeddah",
    region: "Western",
    tagline: "KAIA airport and Red Sea gateway",
    summary:
      "Jeddah is where most Umrah travellers land. We provide airport pickups from King Abdulaziz International Airport, transfers to Makkah and Madinah, and private rides around the city.",
    airport: { name: "King Abdulaziz International Airport", code: "JED" },
    airportPage: "/services/airport-transfer/jeddah/",
    highlights: ["KAIA airport pickups", "Direct transfers to Makkah and Madinah", "Al-Balad historic district", "Corniche and Red Sea waterfront"],
    faqs: [
      { q: "How do I book a pickup at Jeddah Airport?", a: "WhatsApp us your flight number, arrival date and passenger count and we'll confirm a fixed quote." },
      { q: "Can you take us from Jeddah to Taif?", a: "Yes. See our Jeddah to Taif route page for distance and timing." },
    ],
    umrahFocus: true,
  },
  {
    slug: "riyadh",
    name: "Riyadh",
    region: "Central",
    tagline: "Capital city, airport and long-distance routes",
    summary:
      "We provide private taxi and chauffeur service in Riyadh: airport pickups from King Khalid International, city transfers, and long-distance trips to Makkah, Jeddah and across the Gulf.",
    airport: { name: "King Khalid International Airport", code: "RUH" },
    airportPage: "/services/airport-transfer/riyadh/",
    highlights: ["King Khalid International Airport pickups", "Diriyah (UNESCO site)", "Business and executive transfers", "Cross-border trips on request"],
    faqs: [
      { q: "Do you serve Riyadh Airport?", a: "Yes. We provide private transfers from Riyadh Airport to your hotel or destination in the city." },
      { q: "Can you drive us from Riyadh to Makkah?", a: "Yes. It is about 870 km and eight to nine hours. See our Riyadh to Makkah route page." },
    ],
    umrahFocus: false,
  },
  {
    slug: "taif",
    name: "Taif",
    region: "Western",
    tagline: "Mountain city and rose farms",
    summary:
      "Taif sits in the mountains above Makkah and is popular for cooler weather and rose season. We provide airport transfers and private trips from Makkah and Jeddah.",
    airport: { name: "Taif International Airport", code: "TIF" },
    airportPage: "/services/airport-transfer/taif/",
    highlights: ["Al Hada mountain road", "Rose farms (in season)", "Shubra Palace and old markets", "Cool-weather day trips"],
    faqs: [
      { q: "How far is Taif from Makkah?", a: "Roughly 85 to 95 km, about an hour and a half to two hours by road because of the mountain climb." },
      { q: "Do you provide Taif Airport transfers?", a: "Yes. See our Taif Airport taxi page." },
    ],
    umrahFocus: false,
  },
  {
    slug: "alula",
    name: "AlUla",
    region: "Northern",
    tagline: "Hegra, desert heritage and sightseeing",
    summary:
      "AlUla is known for Hegra, rock formations and its Old Town. We provide airport transfers and private trips from Madinah and nearby cities for sightseeing.",
    airport: { name: "AlUla International Airport", code: "ULH" },
    airportPage: "/services/airport-transfer/alula/",
    highlights: ["Hegra (UNESCO site)", "Elephant Rock", "AlUla Old Town", "Desert and canyon scenery"],
    faqs: [
      { q: "Do you cover AlUla Airport?", a: "Yes. See our AlUla Airport taxi page." },
      { q: "Can you drive from Madinah to AlUla?", a: "Yes. It's roughly four to five hours by road. See our Madinah to AlUla route page." },
    ],
    umrahFocus: false,
  },
  {
    slug: "abha",
    name: "Abha",
    region: "Southern",
    tagline: "Asir mountains and cool summers",
    summary:
      "Abha is the main city of the Asir mountains, known for cooler weather, green highlands and scenic villages. We provide private transfers for visitors and locals on request.",
    airport: { name: "Abha International Airport", code: "AHB" },
    highlights: ["Asir mountain scenery", "Habala and Rijal Almaa villages", "Soudah highlands", "Cool summer weather"],
    faqs: [
      { q: "Do you provide taxi service in Abha?", a: "Yes, on request. WhatsApp us your pickup, destination and date and we'll send a fixed quote." },
      { q: "Can you pick me up from Abha Airport?", a: "Yes. Send your flight details and we'll arrange the pickup." },
    ],
    umrahFocus: false,
  },
  {
    slug: "tabuk",
    name: "Tabuk",
    region: "Northern",
    tagline: "Northern gateway and desert trips",
    summary:
      "Tabuk is the main city of the north-west, a gateway to desert canyons, the Red Sea coast and new developments. We provide private transfers on request.",
    airport: { name: "Tabuk Regional Airport", code: "TUU" },
    highlights: ["Tabuk Castle", "Wadi Disah canyon trips", "Red Sea coast access", "Business and tourism transfers"],
    faqs: [
      { q: "Do you provide taxi service in Tabuk?", a: "Yes, on request. WhatsApp us your pickup, destination and date for a fixed quote." },
      { q: "Can you collect me from Tabuk Airport?", a: "Yes. Send your flight number and arrival time and we'll arrange it." },
    ],
    umrahFocus: false,
  },
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}

export const regions: Region[] = ["Western", "Central", "Southern", "Northern"];
