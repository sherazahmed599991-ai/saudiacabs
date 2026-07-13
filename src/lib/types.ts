export type BookingRequest = {
  id: string;
  full_name: string;
  phone: string;
  passengers: string | null;
  service_type: string;
  travel_date: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

export type QuotationStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

export type Quotation = {
  id: string;
  number: string;
  booking_request_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_description: string;
  amount: number;
  status: QuotationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type LineItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";

export type Invoice = {
  id: string;
  number: string;
  quotation_id: string | null;
  booking_request_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  line_items: LineItem[];
  total: number;
  status: InvoiceStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "other";

export type Receipt = {
  id: string;
  number: string;
  invoice_id: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  paid_at: string;
  created_at: string;
};

export type ReceiptWithInvoice = Receipt & { invoice: Invoice };
