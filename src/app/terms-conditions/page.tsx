import type { Metadata } from "next";
import LegalDoc, { type LegalSection } from "@/components/LegalDoc";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "The terms that apply when you request a quote or book a private transfer, tour or group package with Saudia Cabs.",
  path: "/terms-conditions/",
});

const sections: LegalSection[] = [
  {
    heading: "About these terms",
    paragraphs: [
      "These terms apply when you use saudiacabs.com or book a service with Saudia Cabs. By requesting a quote or confirming a booking you agree to them.",
    ],
  },
  {
    heading: "Our services",
    paragraphs: [
      "We provide private, pre-arranged transport: airport transfers, intercity journeys, Ziyarat tours, Miqat stops, group packages and other trips we agree with you. We do not operate metered street taxis.",
    ],
  },
  {
    heading: "Quotes and bookings",
    paragraphs: [
      "A quote is not a booking. Your booking is confirmed when we confirm it to you in writing, for example on WhatsApp or by email, with the date, route, vehicle and fare. Quotes are based on the details you give us; if those change, the fare may change.",
    ],
  },
  {
    heading: "Prices and payment",
    paragraphs: [
      "The fare is agreed with you before your booking is confirmed and does not change for the agreed trip. Payment method and timing are agreed when your booking is confirmed. Prices and distances shown on our website are guides only and the confirmed quote applies.",
    ],
  },
  {
    heading: "Changes and cancellations",
    paragraphs: [
      "Please contact us as early as you can if your plans change. Change and cancellation terms, including any charges, are confirmed with your booking. We will always try to be fair, especially where the change is caused by something outside your control.",
    ],
  },
  {
    heading: "What we need from you",
    bullets: [
      "Give accurate trip details, including pickup point, passenger numbers and luggage, so we can send the right vehicle.",
      "Be ready at the agreed time and place, and tell us promptly if you are delayed.",
      "Carry your own travel documents. Visas, passports, residency papers and entry permissions are your responsibility.",
      "Treat the vehicle and driver with respect, and follow reasonable safety instructions such as wearing seat belts.",
    ],
  },
  {
    heading: "Flights, delays and waiting time",
    paragraphs: [
      "For airport pickups, we track your flight if you give us the flight number. Waiting arrangements are agreed with your booking. We are not responsible for delays caused by things outside our control, such as traffic, weather, road closures, border queues or airport procedures, but we will keep you informed and do our best to adjust.",
    ],
  },
  {
    heading: "Cross-border trips",
    paragraphs: [
      "Cross-border journeys are arranged on request. Entry requirements are set by each country and can change, so you must check them for your own nationality before you travel. We cannot guarantee entry, and border waiting times are outside our control.",
    ],
  },
  {
    heading: "Our responsibility",
    paragraphs: [
      "We will provide the service with reasonable care and skill. To the extent allowed by law, we are not liable for indirect or consequential losses, such as missed flights or events caused by circumstances outside our control. Nothing in these terms limits any right you have that cannot be limited by law.",
    ],
  },
  {
    heading: "Website information",
    paragraphs: [
      "We work to keep the information on this website accurate, but distances, travel times and descriptions are approximate and may change without notice.",
    ],
  },
  {
    heading: "Privacy",
    paragraphs: [
      "How we handle your personal information is described in our Privacy Policy.",
    ],
  },
  {
    heading: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of the Kingdom of Saudi Arabia.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. The version on this page when you confirm your booking applies to that booking.",
    ],
  },
  {
    heading: "Contact us",
    paragraphs: [
      "Questions about these terms? Message us on WhatsApp or call +966 59 894 7503.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms & Conditions"
      intro="The terms that apply when you book with Saudia Cabs."
      updated="24 November 2026"
      sections={sections}
    />
  );
}
