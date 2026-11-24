import type { Metadata } from "next";
import LegalDoc, { type LegalSection } from "@/components/LegalDoc";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Saudia Cabs collects, uses and protects the personal information you share when you request a quote or book a transfer.",
  path: "/privacy-policy/",
});

const sections: LegalSection[] = [
  {
    heading: "Who we are",
    paragraphs: [
      "Saudia Cabs provides private taxi and chauffeur transport, mainly for Umrah travellers, in Makkah, Madinah, Jeddah and other cities in Saudi Arabia. This policy explains what personal information we collect through saudiacabs.com and our messaging channels, and how we use it.",
    ],
  },
  {
    heading: "Information we collect",
    bullets: [
      "Details you give us in our booking, contact, partner and driver-interest forms: name, phone number, email address, number of passengers, service type, travel date and any message you write.",
      "Details you send us on WhatsApp, by phone or by email, such as flight numbers, pickup and drop-off addresses and passport details for cross-border trips.",
      "For quotations, invoices and receipts we issue: your name, contact details and the amount and description of the service.",
      "Basic technical data processed by our hosting provider to deliver the website, such as IP address and browser type.",
    ],
  },
  {
    heading: "How we use your information",
    bullets: [
      "To reply to your enquiry, prepare a quote and confirm and carry out your booking.",
      "To send booking confirmations and the quotations, invoices and receipts you request.",
      "To pass the trip details a driver needs (such as your name, phone number and pickup point) to the driver assigned to your journey.",
      "To keep records of our services, handle payments and meet legal and accounting obligations.",
      "To improve our services and respond to feedback.",
    ],
  },
  {
    heading: "Who we share it with",
    paragraphs: [
      "We do not sell your personal information. We share it only with the service providers we need to run the business, and only as far as necessary:",
    ],
    bullets: [
      "Website hosting and database providers that store the information you submit.",
      "Our email provider, which delivers booking confirmations and documents.",
      "Messaging services such as WhatsApp when you contact us or we reply to you.",
      "Drivers and partners carrying out your trip.",
      "Authorities, when we are required to by law.",
    ],
  },
  {
    heading: "Cookies and tracking",
    paragraphs: [
      "The public pages of our website do not currently use advertising or analytics cookies. Cookies are used only to keep staff signed in to our private admin area. If we add analytics or advertising tools in the future, we will update this policy first.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "We keep your information for as long as we need it to provide the service, resolve disputes, keep accounting records and meet legal requirements, and then delete or anonymise it.",
    ],
  },
  {
    heading: "Security",
    paragraphs: [
      "We use reasonable technical and organisational measures to protect your information, including restricting access to our admin area to authorised staff. No online service can be completely secure, so please avoid sending sensitive documents through our website forms. We will ask for any documents we need privately on WhatsApp.",
    ],
  },
  {
    heading: "Your choices and rights",
    paragraphs: [
      "You can ask us to tell you what information we hold about you, correct it, or delete it, subject to any records we must keep by law. Contact us using the details below and we will respond as soon as we reasonably can. We aim to handle personal data in line with the laws that apply in Saudi Arabia.",
    ],
  },
  {
    heading: "Children",
    paragraphs: [
      "Our website is intended for adults. If you book for a family that includes children, please provide only the details needed for the trip.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "We may update this policy from time to time. The date at the top shows when it was last changed.",
    ],
  },
  {
    heading: "Contact us",
    paragraphs: [
      "For any privacy question or request, message us on WhatsApp or call +966 59 894 7503, or use the contact page on our website.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      intro="How we collect, use and protect the information you share with Saudia Cabs."
      updated="24 November 2026"
      sections={sections}
    />
  );
}
