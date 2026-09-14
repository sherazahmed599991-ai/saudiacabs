import nodemailer from "nodemailer";

/**
 * Sends via ImprovMX SMTP instead of Resend. ImprovMX ties SMTP
 * credentials to a specific alias, so there are two separate transports:
 * the "booking" alias for internal new-booking notifications, and the
 * "info" alias as the outgoing identity for customer-facing documents.
 */

const SMTP_HOST = process.env.SMTP_HOST || "smtp.improvmx.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);

function createTransport(user: string | undefined, pass: string | undefined) {
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user, pass },
  });
}

const bookingTransport = createTransport(process.env.BOOKING_SMTP_USER, process.env.BOOKING_SMTP_PASS);
const infoTransport = createTransport(process.env.INFO_SMTP_USER, process.env.INFO_SMTP_PASS);

type BookingNotification = {
  fullName: string;
  phone: string;
  passengers: string | null;
  serviceType: string;
  travelDate: string | null;
  message: string | null;
};

export async function sendBookingNotificationEmail(booking: BookingNotification) {
  const user = process.env.BOOKING_SMTP_USER;
  const to = process.env.BOOKING_NOTIFY_TO || user;

  if (!bookingTransport || !user || !to) {
    throw new Error("Missing BOOKING_SMTP_USER/BOOKING_SMTP_PASS environment variables");
  }

  const rows = [
    ["Name", booking.fullName],
    ["Phone", booking.phone],
    ["Service", booking.serviceType],
    ["Passengers", booking.passengers ?? "—"],
    ["Travel Date", booking.travelDate ?? "—"],
    ["Message", booking.message ?? "—"],
  ];

  const html = `
    <h2>New Booking Request — Saudia Cabs</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="font-weight:600;border:1px solid #E4DEC6">${label}</td><td style="border:1px solid #E4DEC6">${value}</td></tr>`
        )
        .join("")}
    </table>
  `;

  await bookingTransport.sendMail({
    from: `Saudia Cabs <${user}>`,
    to,
    subject: `New Booking Request from ${booking.fullName}`,
    html,
  });
}

type BookingConfirmation = {
  to: string;
  fullName: string;
  serviceType: string;
  travelDate: string | null;
};

export async function sendBookingConfirmationEmail({ to, fullName, serviceType, travelDate }: BookingConfirmation) {
  const user = process.env.INFO_SMTP_USER;

  if (!infoTransport || !user) {
    throw new Error("Missing INFO_SMTP_USER/INFO_SMTP_PASS environment variables");
  }

  const html = `
    <p>Assalamu Alaikum ${fullName},</p>
    <p>Thank you for your booking request with Saudia Cabs. We've received the details below and will confirm your trip on WhatsApp within minutes:</p>
    <table cellpadding="6" style="border-collapse:collapse">
      <tr><td style="font-weight:600;border:1px solid #E4DEC6">Service</td><td style="border:1px solid #E4DEC6">${serviceType}</td></tr>
      <tr><td style="font-weight:600;border:1px solid #E4DEC6">Travel Date</td><td style="border:1px solid #E4DEC6">${travelDate ?? "To be confirmed"}</td></tr>
    </table>
    <p>If you need to reach us sooner, WhatsApp us anytime at +966 59 894 7503.</p>
    <p>— Saudia Cabs</p>
  `;

  await infoTransport.sendMail({
    from: `Saudia Cabs <${user}>`,
    to,
    subject: `We've received your booking request — Saudia Cabs`,
    html,
  });
}

type CustomerDocumentEmail = {
  to: string;
  customerName: string;
  kind: "Quotation" | "Invoice" | "Receipt";
  number: string;
  pdf: Buffer;
  intro: string;
};

async function sendCustomerDocumentEmail({ to, customerName, kind, number, pdf, intro }: CustomerDocumentEmail) {
  const user = process.env.INFO_SMTP_USER;

  if (!infoTransport || !user) {
    throw new Error("Missing INFO_SMTP_USER/INFO_SMTP_PASS environment variables");
  }

  const html = `
    <p>Assalamu Alaikum ${customerName},</p>
    <p>${intro}</p>
    <p>Please find your ${kind.toLowerCase()} <strong>${number}</strong> attached as a PDF.</p>
    <p>If you have any questions, reply here or WhatsApp us at +966 59 894 7503.</p>
    <p>— Saudia Cabs</p>
  `;

  await infoTransport.sendMail({
    from: `Saudia Cabs <${user}>`,
    to,
    subject: `${kind} ${number} — Saudia Cabs`,
    html,
    attachments: [{ filename: `${number}.pdf`, content: pdf }],
  });
}

export function sendQuotationEmail(args: { to: string; customerName: string; number: string; pdf: Buffer }) {
  return sendCustomerDocumentEmail({
    ...args,
    kind: "Quotation",
    intro: "Thank you for your interest in Saudia Cabs. Here is your price quotation for the requested service.",
  });
}

export function sendInvoiceEmail(args: { to: string; customerName: string; number: string; pdf: Buffer }) {
  return sendCustomerDocumentEmail({
    ...args,
    kind: "Invoice",
    intro: "Here is your invoice for your Saudia Cabs booking.",
  });
}

export function sendReceiptEmail(args: { to: string; customerName: string; number: string; pdf: Buffer }) {
  return sendCustomerDocumentEmail({
    ...args,
    kind: "Receipt",
    intro: "Thank you for your payment. Here is your receipt.",
  });
}
