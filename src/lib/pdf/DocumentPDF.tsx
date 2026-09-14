import fs from "fs";
import path from "path";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const BRAND_GREEN = "#184A27";
const BRAND_GREEN_DARK = "#0F2A18";
const BRAND_GOLD = "#B5913D";
const BRAND_GOLD_LIGHT = "#D1B969";
const CREAM = "#FCFBEA";
const SURFACE = "#F4F1C6";
const BORDER = "#E4DEC6";
const TEXT = "#17351F";
const MUTED = "#5C6B5A";

// react-pdf's Image doesn't reliably resolve a bare local file-path string
// in every runtime - reading it into a buffer up front is the reliable way
// to embed a local asset server-side.
const LOGO_SRC = { data: fs.readFileSync(path.join(process.cwd(), "public", "logo.jpeg")), format: "jpg" as const };

const styles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: "Helvetica", color: TEXT, backgroundColor: "#FFFFFF" },

  // Header band
  headerBand: {
    backgroundColor: BRAND_GREEN,
    paddingHorizontal: 40,
    paddingVertical: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: { width: 42, height: 42, borderRadius: 21 },
  brandBlock: { marginLeft: 12 },
  brand: { fontSize: 17, fontWeight: 700, color: BRAND_GOLD_LIGHT, letterSpacing: 0.5 },
  brandSub: { fontSize: 8, color: CREAM, marginTop: 3, opacity: 0.9 },
  headerRight: { alignItems: "flex-end" },
  docTitle: { fontSize: 20, fontWeight: 700, color: "#FFFFFF", letterSpacing: 1 },
  docNumber: { fontSize: 9, color: BRAND_GOLD_LIGHT, marginTop: 4 },
  docDate: { fontSize: 8, color: CREAM, marginTop: 2, opacity: 0.85 },
  goldRule: { height: 3, backgroundColor: BRAND_GOLD },

  body: { padding: 40, paddingTop: 24 },

  // Status badge
  statusRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 16, marginTop: -6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 8, fontWeight: 700, letterSpacing: 0.5 },

  // Bill-to / details cards
  cardsRow: { flexDirection: "row", gap: 16, marginBottom: 22 },
  card: { flex: 1, backgroundColor: SURFACE, borderRadius: 6, padding: 14, borderWidth: 1, borderColor: BORDER },
  cardLabel: { fontSize: 7.5, color: BRAND_GOLD, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, fontWeight: 700 },
  cardValue: { fontSize: 10.5, color: TEXT, marginBottom: 3, fontWeight: 700 },
  cardLine: { fontSize: 9, color: MUTED, marginBottom: 2 },

  extraFieldsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  extraField: { marginBottom: 4 },
  extraFieldLabel: { fontSize: 7.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4 },
  extraFieldValue: { fontSize: 9.5, color: TEXT, fontWeight: 700, marginTop: 1 },

  // Table
  table: { borderRadius: 4, overflow: "hidden", borderWidth: 1, borderColor: BORDER, marginBottom: 4 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: BRAND_GREEN, paddingVertical: 9, paddingHorizontal: 12 },
  headerCell: { fontWeight: 700, fontSize: 8.5, color: BRAND_GOLD_LIGHT, textTransform: "uppercase", letterSpacing: 0.4 },
  tableRow: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: BORDER },
  tableRowAlt: { backgroundColor: CREAM },
  cellText: { fontSize: 9.5, color: TEXT },
  colDesc: { flex: 3 },
  colQty: { flex: 0.7, textAlign: "right" },
  colPrice: { flex: 1.1, textAlign: "right" },
  colTotal: { flex: 1.1, textAlign: "right", fontWeight: 700 },

  // Totals
  totalsWrap: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16, marginBottom: 24 },
  totalsBox: {
    backgroundColor: BRAND_GREEN,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  totalsLabel: { fontSize: 10, fontWeight: 700, color: CREAM, textTransform: "uppercase", letterSpacing: 0.6, marginRight: 24 },
  totalsValue: { fontSize: 14, fontWeight: 700, color: BRAND_GOLD_LIGHT },

  notesBox: { backgroundColor: SURFACE, borderRadius: 6, padding: 14, marginBottom: 8 },
  notesLabel: { fontSize: 7.5, color: BRAND_GOLD, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, fontWeight: 700 },
  notesText: { fontSize: 9.5, color: TEXT, lineHeight: 1.5 },

  thankYou: { fontSize: 10, color: BRAND_GREEN, fontWeight: 700, textAlign: "center", marginTop: 28, marginBottom: 4 },
  thankYouSub: { fontSize: 8.5, color: MUTED, textAlign: "center" },

  // Footer band
  footerBand: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BRAND_GREEN_DARK,
    paddingVertical: 14,
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: CREAM, opacity: 0.9 },
  footerBold: { fontSize: 7.5, color: BRAND_GOLD_LIGHT, fontWeight: 700 },
});

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  paid: { bg: "#E4F3E7", color: "#1F7A3D" },
  accepted: { bg: "#E4F3E7", color: "#1F7A3D" },
  sent: { bg: "#F3E9D2", color: "#8F6F25" },
  draft: { bg: "#EDEDED", color: "#666666" },
  declined: { bg: "#FBE2E2", color: "#B23434" },
  cancelled: { bg: "#FBE2E2", color: "#B23434" },
  expired: { bg: "#EDEDED", color: "#666666" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status.toLowerCase()] ?? STATUS_STYLES.draft;
  return (
    <View style={styles.statusRow}>
      <View style={[styles.badge, { backgroundColor: s.bg }]}>
        <Text style={[styles.badgeText, { color: s.color }]}>{status.toUpperCase()}</Text>
      </View>
    </View>
  );
}

function money(n: number) {
  return `SAR ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export type PDFLineItem = { description: string; quantity: number; unitPrice: number };

export type DocumentPDFProps = {
  kind: "Quotation" | "Invoice" | "Receipt";
  number: string;
  date: string;
  status?: string;
  customer: { name: string; phone: string; email: string };
  lineItems: PDFLineItem[];
  total: number;
  notes?: string | null;
  extraFields?: { label: string; value: string }[];
};

export function DocumentPDF({ kind, number, date, status, customer, lineItems, total, notes, extraFields }: DocumentPDFProps) {
  const isReceipt = kind === "Receipt";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <View style={styles.headerLeft}>
            <Image src={LOGO_SRC} style={styles.logo} />
            <View style={styles.brandBlock}>
              <Text style={styles.brand}>SAUDIA CABS</Text>
              <Text style={styles.brandSub}>Umrah Transportation · Makkah, Madinah & Jeddah</Text>
              <Text style={styles.brandSub}>+966 59 894 7503 · saudiacabs.com</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>{kind.toUpperCase()}</Text>
            <Text style={styles.docNumber}>{number}</Text>
            <Text style={styles.docDate}>{date}</Text>
          </View>
        </View>
        <View style={styles.goldRule} />
        <View style={styles.body}>
          {status && <StatusBadge status={status} />}

          <View style={styles.cardsRow}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Bill To</Text>
              <Text style={styles.cardValue}>{customer.name}</Text>
              <Text style={styles.cardLine}>{customer.phone}</Text>
              <Text style={styles.cardLine}>{customer.email}</Text>
            </View>

            {extraFields && extraFields.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Details</Text>
                <View style={styles.extraFieldsRow}>
                  {extraFields.map((f) => (
                    <View key={f.label} style={[styles.extraField, { width: "50%" }]}>
                      <Text style={styles.extraFieldLabel}>{f.label}</Text>
                      <Text style={styles.extraFieldValue}>{f.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colDesc, styles.headerCell]}>Description</Text>
              <Text style={[styles.colQty, styles.headerCell]}>Qty</Text>
              <Text style={[styles.colPrice, styles.headerCell]}>Unit Price</Text>
              <Text style={[styles.colTotal, styles.headerCell]}>Total</Text>
            </View>
            {lineItems.map((item, i) => (
              <View key={i} style={[styles.tableRow, ...(i % 2 === 1 ? [styles.tableRowAlt] : [])]}>
                <Text style={[styles.colDesc, styles.cellText]}>{item.description}</Text>
                <Text style={[styles.colQty, styles.cellText]}>{item.quantity}</Text>
                <Text style={[styles.colPrice, styles.cellText]}>{money(item.unitPrice)}</Text>
                <Text style={[styles.colTotal, styles.cellText]}>{money(item.quantity * item.unitPrice)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsWrap}>
            <View style={styles.totalsBox}>
              <Text style={styles.totalsLabel}>{isReceipt ? "Amount Paid" : "Total Due"}</Text>
              <Text style={styles.totalsValue}>{money(total)}</Text>
            </View>
          </View>

          {notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{notes}</Text>
            </View>
          )}

          <Text style={styles.thankYou}>Thank you for choosing Saudia Cabs</Text>
          <Text style={styles.thankYouSub}>For questions about this {kind.toLowerCase()}, contact us on WhatsApp or call +966 59 894 7503</Text>
        </View>

        <View style={styles.footerBand} fixed>
          <Text style={styles.footerText}>Saudia Cabs · Umrah Transportation</Text>
          <Text style={styles.footerBold}>saudiacabs.com · +966 59 894 7503</Text>
        </View>
      </Page>
    </Document>
  );
}
