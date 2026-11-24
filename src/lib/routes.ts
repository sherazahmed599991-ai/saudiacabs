// Route data drives /routes/, /routes/[slug]/, the header menu, the homepage
// route cards and the sitemap. Distances and times are approximate road
// figures and are labelled as such on the pages. Only prices Saudia Cabs has
// already published are shown; everything else is "get a quote".

export type RouteGroup = "Umrah" | "Intercity" | "Long-distance" | "GCC";

export type Route = {
  slug: string;
  from: string;
  to: string;
  group: RouteGroup;
  distance: string;
  duration: string;
  /** Only set where a price is already published on the site. */
  fromPrice?: string;
  summary: string;
  tips: string[];
  vehicleAdvice: string;
  faqs: { q: string; a: string }[];
  locationSlugs: string[];
  /** Existing in-depth article or service page, if any. */
  related?: { label: string; href: string }[];
};

export const routes: Route[] = [
  {
    slug: "jeddah-airport-to-makkah",
    from: "Jeddah Airport (KAIA)",
    to: "Makkah",
    group: "Umrah",
    distance: "≈ 80–95 km",
    duration: "≈ 60–90 min",
    summary:
      "The most common Umrah arrival transfer: a private car from King Abdulaziz International Airport straight to your Makkah hotel, with no shared shuttle stops.",
    tips: [
      "Allow extra time at immigration and baggage claim, especially in Ramadan and the Hajj season.",
      "Share your flight number so your driver can track arrival time.",
      "If you want to enter Ihram on the way, tell us when booking so we can plan the stop.",
    ],
    vehicleAdvice: "A sedan suits 1–3 passengers. Families choose a Staria or Yukon, and larger groups a Hiace or Coaster.",
    faqs: [
      { q: "How long is the drive from Jeddah Airport to Makkah?", a: "Normally about 60 to 90 minutes, depending on traffic and where your hotel is relative to the Haram. It can take longer in Ramadan or Hajj season." },
      { q: "Can I book a return transfer from Makkah to the airport?", a: "Yes. Tell us your departure flight time and we'll schedule the pickup so you reach the airport with time to spare." },
    ],
    locationSlugs: ["jeddah", "makkah"],
    related: [
      { label: "Jeddah Airport to Makkah guide", href: "/blog/jeddah-airport-to-makkah-transfer-guide/" },
      { label: "Jeddah Airport transfer service", href: "/services/airport-transfer/jeddah/" },
    ],
  },
  {
    slug: "jeddah-airport-to-madinah",
    from: "Jeddah Airport (KAIA)",
    to: "Madinah",
    group: "Umrah",
    distance: "≈ 400–430 km",
    duration: "≈ 4–5 hours",
    summary:
      "A direct private transfer from Jeddah Airport to your Madinah hotel, for pilgrims who visit the Prophet's Mosque first or who arrive by Jeddah and continue north.",
    tips: [
      "Plan for a full half-day, including a prayer or rest stop on the way.",
      "If you arrive late at night, tell us so the driver is rested and ready.",
      "Travelling with elderly passengers? Mention it so we can plan comfortable stops.",
    ],
    vehicleAdvice: "For a journey of this length choose space over price: a Yukon or Staria for families, a Hiace or Coaster for groups.",
    faqs: [
      { q: "How far is Madinah from Jeddah Airport?", a: "Roughly 400 to 430 km by road, which takes about four to five hours depending on traffic and stops." },
      { q: "Can we stop for prayers on the way?", a: "Yes. Tell your driver and they will stop at a suitable place along the route." },
    ],
    locationSlugs: ["jeddah", "madinah"],
    related: [{ label: "Madinah Airport transfer", href: "/services/airport-transfer/madinah/" }],
  },
  {
    slug: "makkah-to-madinah",
    from: "Makkah",
    to: "Madinah",
    group: "Umrah",
    distance: "≈ 450 km",
    duration: "≈ 4–5 hours",
    fromPrice: "SAR 450 (private sedan)",
    summary:
      "The classic Umrah intercity journey: a private, air-conditioned transfer between the two holy cities, door to door between your hotels.",
    tips: [
      "Leave after Fajr or after Dhuhr to avoid the hottest hours.",
      "Keep valuables and documents in your hand luggage, not the boot.",
      "Book the return in the opposite direction at the same time if you plan to come back.",
    ],
    vehicleAdvice: "A sedan carries up to 3 passengers with luggage; families and groups should choose a larger vehicle so everyone has room.",
    faqs: [
      { q: "How much does a private taxi from Makkah to Madinah cost?", a: "Fares for a private sedan start from around SAR 450. The final price depends on the vehicle and group size, so WhatsApp us for an exact quote." },
      { q: "Is the road journey safe and comfortable?", a: "It is a well-used highway. We recommend an early start and a comfortable vehicle sized for your group and luggage." },
    ],
    locationSlugs: ["makkah", "madinah"],
    related: [
      { label: "Makkah to Madinah transfer service", href: "/services/makkah-madinah-transfer/" },
      { label: "Makkah to Madinah by road guide", href: "/blog/makkah-to-madinah-by-road-guide/" },
    ],
  },
  {
    slug: "madinah-to-makkah",
    from: "Madinah",
    to: "Makkah",
    group: "Umrah",
    distance: "≈ 450 km",
    duration: "≈ 4–5 hours",
    summary:
      "Heading from Madinah to Makkah for Umrah? A private transfer with a stop at the Miqat so you can enter Ihram, then straight on to your Makkah hotel.",
    tips: [
      "Tell us you will enter Ihram at Dhul Hulaifah (Abyar Ali) so we plan the stop.",
      "Change into Ihram at your hotel if you prefer, to save time at the Miqat.",
      "Allow time for the stop in your schedule.",
    ],
    vehicleAdvice: "Pick a vehicle with enough room for Ihram clothing and luggage: a Staria or Yukon for families, a Hiace or Coaster for groups.",
    faqs: [
      { q: "Can the driver stop at the Miqat?", a: "Yes. Dhul Hulaifah (Abyar Ali) is the Miqat for pilgrims travelling from Madinah, and we can make that stop on the way." },
      { q: "How long does the trip take?", a: "About four to five hours on the road, plus the time you spend at the Miqat." },
    ],
    locationSlugs: ["madinah", "makkah"],
    related: [
      { label: "Miqat transfer service", href: "/services/miqat-transfer/" },
      { label: "Dhul Hulaifah Miqat guide", href: "/blog/dhul-hulaifah-miqat-guide/" },
    ],
  },
  {
    slug: "makkah-to-jeddah-airport",
    from: "Makkah",
    to: "Jeddah Airport (KAIA)",
    group: "Umrah",
    distance: "≈ 80–95 km",
    duration: "≈ 60–90 min",
    summary:
      "A departure transfer timed to get you to King Abdulaziz International Airport on time, with luggage handled by your driver.",
    tips: [
      "Plan to leave at least four hours before an international flight.",
      "Leave extra time during Ramadan, Hajj season and Friday afternoons.",
      "Send us your flight time and terminal when you book.",
    ],
    vehicleAdvice: "Choose a vehicle with room for return luggage, which is usually heavier because of Zamzam and gifts.",
    faqs: [
      { q: "How early should I leave Makkah for my flight?", a: "For international flights we suggest leaving about four hours before departure, and earlier in busy seasons." },
      { q: "Can you pick up from my hotel near the Haram?", a: "Yes. We pick up from your hotel or the nearest accessible point if vehicles can't reach the door." },
    ],
    locationSlugs: ["makkah", "jeddah"],
    related: [{ label: "Jeddah Airport transfer service", href: "/services/airport-transfer/jeddah/" }],
  },
  {
    slug: "makkah-to-taif",
    from: "Makkah",
    to: "Taif",
    group: "Intercity",
    distance: "≈ 85–95 km",
    duration: "≈ 1.5–2 hours",
    summary:
      "A scenic mountain road from Makkah up to Taif, popular for cooler weather, rose farms and a break from the summer heat.",
    tips: [
      "The route climbs through the Al Hada mountains, so expect some winding road.",
      "Taif is much cooler than Makkah, so bring a light layer.",
      "Ask about a return the same day if you only want to visit for the day.",
    ],
    vehicleAdvice: "Any of our vehicles works; families usually prefer a Staria or Yukon for comfort on the climb.",
    faqs: [
      { q: "Can I do Makkah to Taif and back in one day?", a: "Yes. A day trip works well. Tell us your timings and how long you want in Taif." },
      { q: "Is there an airport transfer to Taif?", a: "Yes, see our Taif Airport transfer page." },
    ],
    locationSlugs: ["makkah", "taif"],
    related: [{ label: "Taif Airport taxi", href: "/services/airport-transfer/taif/" }],
  },
  {
    slug: "jeddah-to-taif",
    from: "Jeddah",
    to: "Taif",
    group: "Intercity",
    distance: "≈ 160–170 km",
    duration: "≈ 2–2.5 hours",
    summary:
      "A private transfer from Jeddah up to Taif, for visitors who want mountain air, markets and rose-season trips.",
    tips: [
      "Combine it with a stop in Makkah if you are on Umrah.",
      "Check the weather in the mountains before you travel in winter.",
      "Tell us if you need child seats or extra luggage space.",
    ],
    vehicleAdvice: "A sedan for couples or small families; a Staria, Yukon or Hiace for larger parties.",
    faqs: [
      { q: "How far is Taif from Jeddah?", a: "Roughly 160 to 170 km by road, around two to two and a half hours." },
      { q: "Can you collect me from Jeddah Airport for Taif?", a: "Yes. Send your flight number and we'll plan the pickup." },
    ],
    locationSlugs: ["jeddah", "taif"],
    related: [{ label: "Taif Airport taxi", href: "/services/airport-transfer/taif/" }],
  },
  {
    slug: "madinah-to-alula",
    from: "Madinah",
    to: "AlUla",
    group: "Long-distance",
    distance: "≈ 350–400 km",
    duration: "≈ 4–5 hours",
    summary:
      "A long-distance transfer north from Madinah to AlUla, for visitors combining the holy city with Hegra, Elephant Rock and the Old Town.",
    tips: [
      "Start early to arrive with daylight for sightseeing.",
      "AlUla attractions often need advance tickets; check opening times before you go.",
      "Stay overnight to see Hegra and the Old Town properly.",
    ],
    vehicleAdvice: "A comfortable SUV or van is best for a drive of this length.",
    faqs: [
      { q: "How long does Madinah to AlUla take?", a: "Roughly four to five hours on the road, depending on your starting point and stops." },
      { q: "Do you also cover AlUla Airport?", a: "Yes. See our AlUla Airport taxi page for arrivals and departures." },
    ],
    locationSlugs: ["madinah", "alula"],
    related: [{ label: "AlUla Airport taxi", href: "/services/airport-transfer/alula/" }],
  },
  {
    slug: "riyadh-to-makkah",
    from: "Riyadh",
    to: "Makkah",
    group: "Long-distance",
    distance: "≈ 870 km",
    duration: "≈ 8–9 hours",
    summary:
      "A long private road transfer from the capital to Makkah, for travellers who prefer one overland journey to a connecting flight.",
    tips: [
      "Plan for a full travel day with several rest stops.",
      "Choose a larger, comfortable vehicle for the legroom.",
      "Compare with a short domestic flight to Jeddah plus a transfer.",
    ],
    vehicleAdvice: "On a journey this long, comfort matters most: a Yukon or Staria for families, a Hiace or Coaster for groups.",
    faqs: [
      { q: "How far is Riyadh from Makkah?", a: "Roughly 870 km by road, about eight to nine hours of driving." },
      { q: "Is it better to fly?", a: "A domestic flight to Jeddah is faster, but a road transfer can suit groups and heavy luggage." },
    ],
    locationSlugs: ["riyadh", "makkah"],
    related: [{ label: "Riyadh to Makkah guide", href: "/blog/riyadh-to-makkah-transfer-guide/" }],
  },
  {
    slug: "riyadh-to-jeddah",
    from: "Riyadh",
    to: "Jeddah",
    group: "Long-distance",
    distance: "≈ 950 km",
    duration: "≈ 9–10 hours",
    summary:
      "A cross-country private transfer between Riyadh and Jeddah for groups, families and business travellers who prefer the road.",
    tips: [
      "Plan the day around prayer and rest stops.",
      "Share your itinerary and luggage so we choose the right vehicle.",
      "Consider an overnight stop if you don't want one long day.",
    ],
    vehicleAdvice: "Pick comfort and luggage space over the lowest price.",
    faqs: [
      { q: "How long is the road from Riyadh to Jeddah?", a: "Roughly 950 km, about nine to ten hours of driving." },
      { q: "Can you quote a one-way trip?", a: "Yes. WhatsApp us your date and passenger count for a fixed quote." },
    ],
    locationSlugs: ["riyadh", "jeddah"],
    related: [{ label: "Riyadh Airport taxi", href: "/services/airport-transfer/riyadh/" }],
  },
  {
    slug: "riyadh-to-dubai",
    from: "Riyadh",
    to: "Dubai",
    group: "GCC",
    distance: "≈ 1,000 km",
    duration: "≈ 10–12 hours plus border",
    summary:
      "A cross-border private chauffeur transfer to the UAE via the Batha–Ghuwaifat crossing, arranged on request.",
    tips: [
      "Check UAE entry requirements for your nationality before you travel.",
      "Send passport details in advance so the paperwork can be arranged.",
      "Leave early and avoid public holidays when the border is busiest.",
    ],
    vehicleAdvice: "Choose a vehicle with plenty of space for a full day on the road.",
    faqs: [
      { q: "Is this a regular service?", a: "Cross-border trips are arranged on request. Contact us on WhatsApp with your dates and passenger details." },
      { q: "Where can I read more?", a: "See our full Riyadh to Dubai chauffeur transfer guide." },
    ],
    locationSlugs: ["riyadh"],
    related: [{ label: "Riyadh to Dubai guide", href: "/blog/riyadh-to-dubai-chauffeur-transfer-guide/" }],
  },
  {
    slug: "riyadh-to-doha",
    from: "Riyadh",
    to: "Doha, Qatar",
    group: "GCC",
    distance: "≈ 700–800 km",
    duration: "≈ 7–9 hours plus border",
    summary:
      "A cross-border private chauffeur transfer to Qatar via the Salwa crossing, arranged on request.",
    tips: [
      "Check Qatar entry requirements for your nationality before you travel.",
      "Send passport details in advance so the paperwork can be arranged.",
      "Keep documents in your hand luggage, not the boot.",
    ],
    vehicleAdvice: "Choose a comfortable vehicle with enough room for your group and luggage.",
    faqs: [
      { q: "Is this a regular service?", a: "Cross-border trips are arranged on request. Contact us on WhatsApp with your dates and passenger details." },
      { q: "Where can I read more?", a: "See our full Riyadh to Qatar chauffeur service guide." },
    ],
    locationSlugs: ["riyadh"],
    related: [{ label: "Riyadh to Qatar guide", href: "/blog/riyadh-to-qatar-chauffeur-service-guide/" }],
  },
];

export const routeGroups: RouteGroup[] = ["Umrah", "Intercity", "Long-distance", "GCC"];

export function getRoute(slug: string): Route | undefined {
  return routes.find((r) => r.slug === slug);
}

export function routeTitle(r: Route): string {
  return `${r.from} to ${r.to}`;
}

export function getRoutesForLocation(locationSlug: string): Route[] {
  return routes.filter((r) => r.locationSlugs.includes(locationSlug));
}
