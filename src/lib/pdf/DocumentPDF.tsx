import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#17351F" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, alignItems: "flex-start" },
  brand: { fontSize: 18, fontWeight: 700, color: "#B5913D" },
  brandSub: { fontSize: 9, color: "#5C6B5A", marginTop: 2 },
  docTitle: { fontSize: 16, fontWeight: 700, textAlign: "right" },
  docNumber: { fontSize: 10, color: "#5C6B5A", textAlign: "right", marginTop: 2 },
  section: { marginBottom: 20 },
  label: { fontSize: 8, color: "#5C6B5A", textTransform: "uppercase", marginBottom: 2 },
  value: { fontSize: 10, marginBottom: 8 },
  table: { borderTopWidth: 1, borderTopColor: "#E4DEC6", borderBottomWidth: 1, borderBottomColor: "#E4DEC6" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E4DEC6", paddingVertical: 8 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#F4F1C6", paddingVertical: 8 },
  headerCell: { fontWeight: 700 },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  totalsRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  totalsLabel: { fontSize: 11, fontWeight: 700, marginRight: 12 },
  totalsValue: { fontSize: 11, fontWeight: 700 },
  extraFieldsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  extraField: { marginRight: 32, marginBottom: 8 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#5C6B5A", textAlign: "center" },
});

export type PDFLineItem = { description: string; quantity: number; unitPrice: number };

export type DocumentPDFProps = {
  kind: "Quotation" | "Invoice" | "Receipt";
  number: string;
  date: string;
  customer: { name: string; phone: string; email: string };
  lineItems: PDFLineItem[];
  total: number;
  notes?: string | null;
  extraFields?: { label: string; value: string }[];
};

export function DocumentPDF({ kind, number, date, customer, lineItems, total, notes, extraFields }: DocumentPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Saudia Cabs</Text>
            <Text style={styles.brandSub}>Umrah Transportation — Makkah, Madinah & Jeddah</Text>
            <Text style={styles.brandSub}>+966 59 894 7503</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>{kind.toUpperCase()}</Text>
            <Text style={styles.docNumber}>{number}</Text>
            <Text style={styles.docNumber}>{date}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bill To</Text>
          <Text style={styles.value}>{customer.name}</Text>
          <Text style={styles.value}>{customer.phone}</Text>
          <Text style={styles.value}>{customer.email}</Text>
        </View>

        {extraFields && extraFields.length > 0 && (
          <View style={styles.extraFieldsRow}>
            {extraFields.map((f) => (
              <View key={f.label} style={styles.extraField}>
                <Text style={styles.label}>{f.label}</Text>
                <Text style={styles.value}>{f.value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDesc, styles.headerCell]}>Description</Text>
            <Text style={[styles.colQty, styles.headerCell]}>Qty</Text>
            <Text style={[styles.colPrice, styles.headerCell]}>Unit Price</Text>
            <Text style={[styles.colTotal, styles.headerCell]}>Total</Text>
          </View>
          {lineItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>SAR {item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.colTotal}>SAR {(item.quantity * item.unitPrice).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Total</Text>
          <Text style={styles.totalsValue}>SAR {total.toFixed(2)}</Text>
        </View>

        {notes && (
          <View style={[styles.section, { marginTop: 24 }]}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.value}>{notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>Saudia Cabs · saudiacabs.com · +966 59 894 7503</Text>
      </Page>
    </Document>
  );
}
