// Sitewide FAQ. Answers only restate things the site already says; anything
// that depends on a policy you haven't published is phrased as "agreed when
// you book" instead of inventing terms.

export type FaqGroup = { title: string; items: { q: string; a: string }[] };

export const faqGroups: FaqGroup[] = [
  {
    title: "Booking & quotes",
    items: [
      { q: "How do I book a taxi?", a: "Message us on WhatsApp at +966 59 894 7503 or use the online booking form. Share your pickup, destination, date, passenger count and preferred vehicle, and we confirm within minutes. No credit card is needed to request a quote." },
      { q: "Are your prices fixed?", a: "Yes. We agree the fare with you on WhatsApp before you confirm, so there are no meters and no surprises. The final price depends on the route, vehicle and group size." },
      { q: "How far in advance should I book?", a: "As early as you can, especially for Ramadan, Hajj season, school holidays and cross-border trips. We also handle short-notice requests when a vehicle is available." },
      { q: "Can I book a return or multi-stop trip?", a: "Yes. Tell us all the legs of your journey when you ask for a quote and we'll price them together." },
    ],
  },
  {
    title: "Airport pickups",
    items: [
      { q: "How do I meet my driver at the airport?", a: "Your driver waits at the arrivals area and coordinates with you on WhatsApp as soon as you land." },
      { q: "Do you track my flight?", a: "Yes. Share your flight number when you book so your driver can follow your arrival time." },
      { q: "Which airports do you serve?", a: "Jeddah (KAIA), Madinah (AMAA), Riyadh, AlUla and Taif have dedicated pages, and we can arrange pickups from other airports such as Abha and Tabuk on request." },
    ],
  },
  {
    title: "Umrah services",
    items: [
      { q: "Do you offer Ziyarat tours?", a: "Yes. We provide private Ziyarat tours to the major holy sites in Makkah and Madinah." },
      { q: "Can we stop at the Miqat to enter Ihram?", a: "Yes. We can stop at the correct Miqat for your route so you can enter Ihram, then continue to Makkah." },
      { q: "Do you provide Makkah to Madinah transfers?", a: "Yes. It is roughly 450 km and four to five hours by road. Fares for a private sedan start from around SAR 450; WhatsApp us for an exact quote." },
    ],
  },
  {
    title: "Vehicles",
    items: [
      { q: "Which vehicles do you have?", a: "Toyota Camry (4 seats), Hyundai Staria (7), GMC Yukon (7), Toyota Hiace (11) and Toyota Coaster (17), all air-conditioned." },
      { q: "Can I choose my vehicle?", a: "Yes. Tell us your group size and luggage and we'll confirm availability, or ask us to recommend the best fit." },
      { q: "What if my group is larger than 17?", a: "We can arrange more than one vehicle. See our group packages." },
    ],
  },
  {
    title: "Coverage, payment & changes",
    items: [
      { q: "Which cities do you cover?", a: "Our focus is Umrah transport in Makkah, Madinah and Jeddah, and we also provide private taxi service across Saudi Arabia, including Riyadh, Abha, Tabuk, AlUla and Taif." },
      { q: "Do you do cross-border trips?", a: "Cross-border trips, for example to the UAE or Qatar, are arranged on request. Entry rules depend on your nationality, so check them before you travel." },
      { q: "How does payment work?", a: "Payment terms are agreed with you when your booking is confirmed on WhatsApp." },
      { q: "Can I change or cancel a booking?", a: "Contact us as early as possible. Change and cancellation terms are confirmed with your booking; see our terms for details." },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((g) => g.items);
