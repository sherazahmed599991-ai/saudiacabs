import { Resend } from "resend";

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  return new Resend(apiKey);
}

type BookingNotification = {
  fullName: string;
  phone: string;
  passengers: string | null;
  serviceType: string;
  travelDate: string | null;
  message: string | null;
};

export async function sendBookingNotificationEmail(booking: BookingNotification) {
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.RESEND_TO_EMAIL;

  if (!from || !to) {
    throw new Error("Missing RESEND_FROM_EMAIL or RESEND_TO_EMAIL environment variable");
  }

  const resend = getResendClient();

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

  await resend.emails.send({
    from,
    to,
    subject: `New Booking Request from ${booking.fullName}`,
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

export async function sendCustomerDocumentEmail({ to, customerName, kind, number, pdf, intro }: CustomerDocumentEmail) {
  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error("Missing RESEND_FROM_EMAIL environment variable");
  }

  const resend = getResendClient();

  const html = `
    <p>Assalamu Alaikum ${customerName},</p>
    <p>${intro}</p>
    <p>Please find your ${kind.toLowerCase()} <strong>${number}</strong> attached as a PDF.</p>
    <p>If you have any questions, reply here or WhatsApp us at +966 59 894 7503.</p>
    <p>— Saudia Cabs</p>
  `;

  await resend.emails.send({
    from,
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
