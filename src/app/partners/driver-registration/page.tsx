import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import GeneralInquiryForm from "@/components/GeneralInquiryForm";
import { BreadcrumbSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Driver Registration — Drive With Saudia Cabs",
  description:
    "Professional driver or vehicle owner in Saudi Arabia? Register your interest in driving with Saudia Cabs and we'll contact you on WhatsApp.",
  path: "/partners/driver-registration/",
});

export default function DriverRegistrationPage() {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Partners", url: "/partners/" },
        { name: "Driver Registration", url: "/partners/driver-registration/" },
      ]} />
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        <PageHero
          title="Drive With Saudia Cabs"
          intro="Experienced driver or vehicle owner? Tell us a little about yourself and we'll get in touch on WhatsApp to talk through the next steps."
          crumbs={[{ label: "Partners", href: "/partners/" }, { label: "Driver Registration" }]}
        />
        <section className="section-padding" style={{ paddingBottom: 0 }}>
          <div className="container" style={{ maxWidth: "820px" }}>
            <p style={{ fontSize: "15.5px" }}>
              This form is an expression of interest only. <strong>Please don&apos;t send ID, licence or vehicle documents here.</strong>{" "}
              If we take things further, we&apos;ll ask for the documents we need privately on WhatsApp.
            </p>
          </div>
        </section>
        <GeneralInquiryForm
          serviceType="Driver Application"
          heading="Register Your Interest"
          messageLabel="About you and your vehicle"
          messagePlaceholder="Your city, years of driving experience, languages you speak, and your vehicle (make, model, year, seats), if you have one"
        />
      </main>
      <Footer />
    </>
  );
}
