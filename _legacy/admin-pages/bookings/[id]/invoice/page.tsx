'use client';
// html2pdf will be imported dynamically to avoid SSR issues


import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { adminFetch } from '@/lib/admin-fetch';
import { formatTime12h } from '@/lib/format-time';
import { downloadDocumentPdf, documentPdfToBase64 } from '@/lib/document-pdf';
import { getReturnRoute } from '@/lib/booking-validation';
import {
    Printer,
    ArrowLeft,
    Mail,
    Phone,
    Globe,
    MapPin,
    Clock,
    Plus,
    Trash2,
    Repeat,
    Landmark,
    Languages,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

type DocLang = 'en' | 'ar';
type NormalizedStatus = 'paid' | 'unpaid' | 'partial';

const INVOICE_TEXT: Record<DocLang, Record<string, string>> = {
    en: {
        invoice: 'INVOICE', no: 'Invoice No.', issueDate: 'Issue Date:', bookingRef: 'Booking Ref:', roundTrip: 'Round Trip',
        billTo: 'Bill To', bookingDetails: 'Booking Details',
        dateLabel: 'Date', timeLabel: 'Time', vehicleLabel: 'Vehicle', passengersLabel: 'Passengers', luggageLabel: 'Luggage', serviceTypeLabel: 'Service Type',
        bookingSummary: 'Booking Summary', serviceDate: 'Service Date', vehiclesLabel: 'Vehicle(s)',
        journeyRoute: 'Journey Route', stop: 'stop', stops: 'stops', fullItinerary: 'Full Itinerary',
        itinDate: 'Date', itinTime: 'Time', itinPickup: 'Pick-up', itinDest: 'Destination', itinVehicle: 'Vehicle',
        pickup: 'Pick-up', dropoff: 'Drop-off', destination: 'Destination', returnDropoff: 'Return Drop-off',
        outbound: 'Outbound', returnLeg: 'Return', sameDay: 'same day', returnNotRecorded: 'Return details not recorded',
        serviceDescription: 'Service Description', description: 'Description', qty: 'Qty', unitPrice: 'Unit Price', amount: 'Amount',
        roundTripService: 'Round Trip Transfer Service', privateService: 'Private Transfer Service',
        multiDayService: 'Multi-Day Private Chauffeur Transportation', completePackage: 'Complete Transportation Package',
        chauffeurService: 'Professional Chauffeur Service',
        specialRequests: 'Special Requests:', totalPayable: 'Total Payable',
        depositPaid: 'Deposit / Advance Paid', balanceDue: 'Balance Due',
        paymentDetails: 'Payment Details', paymentMethodLabel: 'Payment Method', paymentRequired: 'Payment Required', amountReceived: 'Amount Received', remainingBalance: 'Remaining Balance',
        bankDetails: 'Bank Transfer Details', bankName: 'Bank Name', accountName: 'Account Name',
        accountNumber: 'Account Number', swift: 'SWIFT / BIC', iban: 'IBAN', note: 'Note:',
        statusPaid: 'PAID', statusUnpaid: 'UNPAID', statusPartial: 'PARTIALLY PAID',
        confirmedHeading: 'Booking Confirmed', confirmedText: 'Payment received. Your transportation service is fully confirmed.',
        pendingHeading: 'Payment Pending', pendingText: 'Your reservation will be confirmed upon receipt of payment.',
        partialHeading: 'Partial Payment Received', partialText: 'Your reservation is held subject to settlement of the remaining balance.',
        payInstructUnpaid: 'Payment is pending. Please complete payment according to the details below.',
        payInstructCash: 'Payment to be handed to the driver upon journey completion.',
        terms: 'Terms & Conditions',
        term1: 'The quoted price covers the transportation services and itinerary stated on this invoice.',
        term2: 'Fuel and standard chauffeur service are included unless otherwise stated.',
        term3: 'Additional waiting time beyond the standard allowance may incur extra charges.',
        term4: 'Additional stops, route changes, or services requested after confirmation may be charged separately.',
        term5: 'Airport pickups include the company’s standard waiting period.',
        term6: 'Free cancellation up to 24 hours before the first scheduled pickup.',
        term7: 'Any additional charges will be communicated before being applied, wherever reasonably possible.',
        term8: 'The customer is responsible for providing accurate pickup times and locations.',
        term9: 'This invoice serves as the official booking and payment document.',
        authorizedSignature: 'Authorized Signature', director: 'Director', partner: 'Partner',
        thankYou: 'Thank you for choosing Taxi Service KSA', tagline: 'Professional Chauffeur & Private Transportation Services in Saudi Arabia',
        pax: 'Pax', bags: 'Bags', city: 'Jeddah, Saudi Arabia',
        hourlyHire: 'Hourly Hire', hourlyService: 'Hourly Chauffeur Service', durationLabel: 'Duration',
        hours: 'hours', monthlyContract: 'Monthly Contract',
    },
    ar: {
        invoice: 'فاتورة', no: 'رقم الفاتورة', issueDate: 'تاريخ الإصدار:', bookingRef: 'رقم الحجز:', roundTrip: 'ذهاب وعودة',
        billTo: 'فاتورة إلى', bookingDetails: 'تفاصيل الحجز',
        dateLabel: 'التاريخ', timeLabel: 'الوقت', vehicleLabel: 'المركبة', passengersLabel: 'الركاب', luggageLabel: 'الحقائب', serviceTypeLabel: 'نوع الخدمة',
        bookingSummary: 'ملخص الحجز', serviceDate: 'تاريخ الخدمة', vehiclesLabel: 'المركبات',
        journeyRoute: 'مسار الرحلة', stop: 'محطة', stops: 'محطات', fullItinerary: 'برنامج الرحلة الكامل',
        itinDate: 'التاريخ', itinTime: 'الوقت', itinPickup: 'الانطلاق', itinDest: 'الوجهة', itinVehicle: 'المركبة',
        pickup: 'الانطلاق', dropoff: 'الوصول', destination: 'الوجهة', returnDropoff: 'نقطة العودة',
        outbound: 'الذهاب', returnLeg: 'العودة', sameDay: 'نفس اليوم', returnNotRecorded: 'تفاصيل العودة غير مسجلة',
        serviceDescription: 'وصف الخدمة', description: 'الوصف', qty: 'الكمية', unitPrice: 'سعر الوحدة', amount: 'المبلغ',
        roundTripService: 'خدمة نقل ذهاب وعودة', privateService: 'خدمة نقل خاص',
        multiDayService: 'خدمة نقل خاص متعددة الأيام', completePackage: 'باقة نقل كاملة',
        chauffeurService: 'خدمة سائق محترف',
        specialRequests: 'طلبات خاصة:', totalPayable: 'المبلغ الإجمالي المستحق',
        depositPaid: 'العربون / الدفعة المقدمة', balanceDue: 'المبلغ المتبقي',
        paymentDetails: 'تفاصيل الدفع', paymentMethodLabel: 'طريقة الدفع', paymentRequired: 'المبلغ المطلوب', amountReceived: 'المبلغ المستلم', remainingBalance: 'الرصيد المتبقي',
        bankDetails: 'تفاصيل التحويل البنكي', bankName: 'اسم البنك', accountName: 'اسم صاحب الحساب',
        accountNumber: 'رقم الحساب', swift: 'رمز السويفت', iban: 'رقم الآيبان', note: 'ملاحظة:',
        statusPaid: 'مدفوع', statusUnpaid: 'غير مدفوع', statusPartial: 'مدفوع جزئياً',
        confirmedHeading: 'تم تأكيد الحجز', confirmedText: 'تم استلام الدفع. تم تأكيد خدمة النقل الخاصة بكم بالكامل.',
        pendingHeading: 'الدفع معلق', pendingText: 'سيتم تأكيد الحجز عند استلام الدفع.',
        partialHeading: 'تم استلام دفعة جزئية', partialText: 'الحجز محجوز رهناً بانتظار تسوية المبلغ المتبقي.',
        payInstructUnpaid: 'الدفع معلق. يرجى إتمام الدفع وفق التفاصيل أدناه.',
        payInstructCash: 'يتم تسليم المبلغ للسائق عند انتهاء الرحلة.',
        terms: 'الشروط والأحكام',
        term1: 'يغطي السعر المذكور خدمات النقل وبرنامج الرحلة الموضح في هذه الفاتورة.',
        term2: 'الوقود وخدمة السائق الأساسية مشمولة ما لم يُذكر خلاف ذلك.',
        term3: 'قد يؤدي وقت الانتظار الإضافي إلى رسوم إضافية.',
        term4: 'قد تُحتسب المحطات الإضافية أو تغيير المسار المطلوبة بعد التأكيد بشكل منفصل.',
        term5: 'يشمل استلام المطار فترة انتظار الشركة المعتادة.',
        term6: 'إلغاء مجاني حتى 24 ساعة قبل أول موعد انطلاق محدد.',
        term7: 'سيتم إبلاغكم بأي رسوم إضافية قبل تطبيقها كلما أمكن ذلك.',
        term8: 'العميل مسؤول عن تقديم أوقات ومواقع استلام دقيقة.',
        term9: 'تعد هذه الفاتورة المستند الرسمي للحجز والدفع.',
        authorizedSignature: 'التوقيع المعتمد', director: 'المدير', partner: 'الشريك',
        thankYou: 'شكراً لاختياركم تاكسي سيرفس السعودية', tagline: 'خدمات سائق خاص ونقل خاص احترافية في المملكة العربية السعودية',
        pax: 'راكب', bags: 'حقيبة', city: 'جدة، المملكة العربية السعودية',
        hourlyHire: 'إيجار بالساعة', hourlyService: 'خدمة سائق بالساعة', durationLabel: 'المدة',
        hours: 'ساعات', monthlyContract: 'عقد شهري',
    },
};

const STATUS_LABEL_KEY: Record<NormalizedStatus, string> = { paid: 'statusPaid', unpaid: 'statusUnpaid', partial: 'statusPartial' };
const METHOD_AR: Record<string, string> = { 'Cash to Driver': 'نقداً للسائق', 'Online': 'دفع إلكتروني', 'Bank Transfer': 'تحويل بنكي' };

function normalizeStatus(raw: string): NormalizedStatus {
    const v = (raw || '').toLowerCase();
    if (v.includes('partial')) return 'partial';
    if (v === 'paid') return 'paid';
    return 'unpaid';
}

interface Stop {
    time: string;
    location: string;
}
import { Button } from '@/components/ui/button';

interface Booking {
    id: string;
    created_at: string;
    pickup_location: string;
    destination: string;
    pickup_date: string;
    pickup_time: string;
    trip_end_date?: string;
    vehicle_type: string;
    passengers: number;
    luggage: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    status: string;
    special_requests?: string;
    total_price?: number;
    currency?: string;
    payment_status?: string;
    payment_method?: string;
    trip_type?: 'point_to_point' | 'hourly';
    duration_hours?: number;
    contract_id?: string | null;
    invoice_number?: string | null;
    has_return_trip?: boolean;
    return_date?: string | null;
    return_time?: string | null;
    return_pickup_location?: string | null;
    return_destination?: string | null;
    itinerary_legs?: { date: string; time: string; pickup: string; dropoff: string }[] | null;
    additional_stops?: Stop[] | null;
    deposit_amount?: number | null;
}

export default function InvoicePage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState<DocLang>('en');
    const [quickNote, setQuickNote] = useState('');
    const [currency, setCurrency] = useState('SAR');
    const [paymentStatus, setPaymentStatus] = useState('Unpaid');
    const [paymentMethod, setPaymentMethod] = useState('Cash to Driver');
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    const [returnPickupLocation, setReturnPickupLocation] = useState('');
    const [returnDropoffLocation, setReturnDropoffLocation] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [returnTime, setReturnTime] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [stops, setStops] = useState<Stop[]>([]);
    const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
    const [emailInput, setEmailInput] = useState('');
    const [bankDetails, setBankDetails] = useState({
        showOnDocument: false,
        bankName: 'Al Rajhi Bank',
        accountName: 'Taxi Service KSA LLC',
        accountNumber: '123456789012345',
        iban: 'SA8280000000123456789012',
        swiftCode: 'RAJHSARIXXX',
        notes: 'Please send transaction screenshot on WhatsApp once completed.'
    });

    const addEmail = () => {
        const val = emailInput.trim().toLowerCase();
        if (val && val.includes('@') && !additionalEmails.includes(val)) {
            setAdditionalEmails(prev => [...prev, val]);
            setEmailInput('');
        }
    };

    const addStop = () => setStops(prev => [...prev, { time: '', location: '' }]);
    const removeStop = (i: number) => setStops(prev => prev.filter((_, idx) => idx !== i));
    const updateStop = (i: number, field: keyof Stop, value: string) =>
        setStops(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                let bookingData = data;
                // Assign a permanent sequential invoice number the first time
                // this invoice is ever opened — accounting numbers must not
                // change on re-visits, so it's stored back on the booking.
                if (!bookingData.invoice_number) {
                    const { data: assignedNumber, error: rpcError } = await supabase.rpc('assign_invoice_number', { p_booking_id: id });
                    if (!rpcError && assignedNumber) {
                        bookingData = { ...bookingData, invoice_number: assignedNumber };
                    } else if (rpcError) {
                        console.error('Failed to assign invoice number:', rpcError);
                    }
                }
                setBooking(bookingData);
                // Initialize editable fields from booking data if they exist
                if (Array.isArray(data.additional_stops)) setStops(data.additional_stops);
                if (data.currency) setCurrency(data.currency);
                if (data.payment_status) {
                    const s = normalizeStatus(data.payment_status);
                    setPaymentStatus(s === 'paid' ? 'Paid' : s === 'partial' ? 'Partially Paid' : 'Unpaid');
                }
                // Note: payment_method might not be in the DB yet, but we check just in case
                if (data.payment_method) setPaymentMethod(data.payment_method);
                // Auto-detect round trip from booking data. getReturnRoute()
                // prefers explicitly recorded return locations and falls back
                // to the outbound route reversed for legacy bookings that
                // predate return_pickup_location/return_destination.
                if (data.has_return_trip) {
                    setIsRoundTrip(true);
                    const route = getReturnRoute(data);
                    setReturnPickupLocation(route.pickupLocation);
                    setReturnDropoffLocation(route.destination);
                    if (data.return_date) setReturnDate(data.return_date);
                    if (data.return_time) setReturnTime(data.return_time);
                }
            } catch (error) {
                console.error('Error fetching booking:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBooking();
    }, [id]);

    const buildInvoiceFilename = () => {
        if (!booking) return 'Invoice.pdf';
        const customerName = booking.customer_name ? booking.customer_name.replace(/\s+/g, '-') : 'Client';
        const refId = booking.id.slice(0, 8).toUpperCase();
        const dateStr = booking.pickup_date || new Date().toISOString().split('T')[0];
        return `Invoice-${refId}-${customerName}-${dateStr}.pdf`;
    };

    const handlePrint = async () => {
        if (!booking) return;
        await downloadDocumentPdf('invoice-print', buildInvoiceFilename());
    };

    const handleSendEmail = async () => {
        if (!booking) return;
        setSendingEmail(true);
        setEmailSent(false);

        try {
            const filename = buildInvoiceFilename();
            const base64 = await documentPdfToBase64('invoice-print', filename);

            // Persist currency, paymentStatus, paymentMethod, and any extra
            // stops added on this screen back to DB — previously `stops`
            // only lived in local state and was lost on every reload.
            await supabase
                .from('bookings')
                .update({
                    currency,
                    payment_status: paymentStatus,
                    payment_method: paymentMethod,
                    additional_stops: stops.filter(s => s.location.trim()).length > 0 ? stops.filter(s => s.location.trim()) : null,
                })
                .eq('id', booking.id);

            const res = await adminFetch('/api/send-invoice-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking: {
                        ...booking,
                        has_return_trip: isRoundTrip,
                        return_date: isRoundTrip ? (returnDate || booking.return_date || null) : null,
                        return_time: isRoundTrip ? (returnTime || booking.return_time || null) : null,
                        return_pickup_location: isRoundTrip ? (returnPickupLocation || null) : null,
                        return_destination: isRoundTrip ? (returnDropoffLocation || null) : null,
                    },
                    pdfBase64: base64,
                    filename,
                    currency,
                    paymentStatus,
                    paymentMethod,
                    additionalEmails,
                }),
            });

            if (!res.ok) throw new Error('Email API error');
            setEmailSent(true);
            setTimeout(() => setEmailSent(false), 4000);
        } catch (err) {
            console.error('Send Invoice Email Error:', err);
            alert('Failed to send invoice email. Please try again.');
        } finally {
            setSendingEmail(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Booking not found</h1>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const invoiceDate = new Date(booking.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    // Falls back to the old date/id-derived format only in the brief window
    // before the permanent sequential number above finishes assigning.
    const invoiceNumber = booking.invoice_number || `INV-${(booking.pickup_date || booking.created_at.slice(0, 10)).replace(/-/g, '')}-${booking.id.slice(0, 6).toUpperCase()}`;
    const bookingRef = `BOOK-${booking.id.slice(0, 8).toUpperCase()}`;
    const t = INVOICE_TEXT[lang];

    // --- Single source of truth for payment status → every piece of text
    // on the document (badge, confirmation box, payment instructions) is
    // derived from this so they can never contradict each other. ---
    const status = normalizeStatus(paymentStatus);
    const total = booking.total_price || 0;
    const deposit = status === 'partial' ? (booking.deposit_amount || 0) : 0;
    const balance = status === 'paid' ? 0 : status === 'partial' ? Math.max(total - deposit, 0) : total;
    const STATUS_STYLE: Record<NormalizedStatus, { badge: string; box: string; icon: 'ok' | 'warn' }> = {
        paid: { badge: 'bg-green-50 text-green-700 border-green-200', box: 'bg-green-50 border-green-200', icon: 'ok' },
        unpaid: { badge: 'bg-red-50 text-red-700 border-red-200', box: 'bg-red-50 border-red-200', icon: 'warn' },
        partial: { badge: 'bg-amber-50 text-amber-700 border-amber-200', box: 'bg-amber-50 border-amber-200', icon: 'warn' },
    };
    const confirmationHeading = status === 'paid' ? t.confirmedHeading : status === 'partial' ? t.partialHeading : t.pendingHeading;
    const confirmationText = status === 'paid' ? t.confirmedText : status === 'partial' ? t.partialText : t.pendingText;
    const paymentInstructionText = status === 'paid'
        ? t.confirmedText
        : (paymentMethod === 'Cash to Driver' ? t.payInstructCash : t.payInstructUnpaid);

    const hasItinerary = !!(booking.itinerary_legs && booking.itinerary_legs.length > 0);

    // Service date range — computed from the full itinerary when present,
    // otherwise from pickup_date (+ trip_end_date for multi-day packages).
    let serviceDateLabel = booking.pickup_date;
    if (hasItinerary) {
        const dates = [booking.pickup_date, ...booking.itinerary_legs!.map(l => l.date), ...(isRoundTrip && returnDate ? [returnDate] : [])].filter(Boolean).sort();
        const first = dates[0];
        const last = dates[dates.length - 1];
        serviceDateLabel = first === last ? first : `${first} – ${last}`;
    } else if (booking.trip_end_date && booking.trip_end_date !== booking.pickup_date) {
        serviceDateLabel = `${booking.pickup_date} – ${booking.trip_end_date}`;
    }

    const serviceTitle = hasItinerary
        ? t.multiDayService
        : booking.trip_type === 'hourly' ? t.hourlyService
        : isRoundTrip ? t.roundTripService
        : t.privateService;

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 print:bg-white print:py-0 print:px-0 print:min-h-0">
            {/* Header Controls */}
            <div className="max-w-[210mm] mx-auto mb-4 flex flex-wrap gap-4 justify-between items-center print:hidden border-b pb-4">
                <Button variant="outline" onClick={() => router.back()} className="bg-white">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <div className="flex flex-wrap gap-4 items-center">
                    {/* Language Toggle */}
                    <button
                        onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                        className="flex items-center gap-2 rounded-lg border p-1 shadow-sm px-3 h-10 bg-white text-gray-700 border-gray-200 hover:bg-gray-50 transition-all"
                    >
                        <Languages className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
                            {lang === 'en' ? 'English' : 'عربي'}
                        </span>
                    </button>

                    {/* Round Trip Toggle */}
                    <div className="flex flex-col gap-1">
                        <div
                            onClick={() => {
                                const next = !isRoundTrip;
                                setIsRoundTrip(next);
                                if (next && booking) {
                                    const route = getReturnRoute(booking);
                                    setReturnPickupLocation(route.pickupLocation);
                                    setReturnDropoffLocation(route.destination);
                                }
                            }}
                            className={`flex items-center gap-2 rounded-lg border p-1 shadow-sm px-3 cursor-pointer transition-all select-none ${
                                isRoundTrip ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-gray-500 border-gray-200'
                            }`}
                        >
                            <span className="text-lg">🔄</span>
                            <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
                                {isRoundTrip ? 'Round Trip ON' : 'Round Trip'}
                            </span>
                        </div>
                        {isRoundTrip && (
                            <div className="flex flex-col gap-1 bg-blue-50/60 border border-blue-100 rounded-lg p-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-blue-600 uppercase">Return Route</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!booking) return;
                                            setReturnPickupLocation(booking.destination);
                                            setReturnDropoffLocation(booking.pickup_location);
                                        }}
                                        className="text-[9px] font-semibold text-primary hover:underline"
                                    >
                                        Reverse outbound
                                    </button>
                                </div>
                                <input
                                    value={returnPickupLocation}
                                    onChange={(e) => setReturnPickupLocation(e.target.value)}
                                    className="h-7 w-44 text-[11px] font-bold border rounded px-2 outline-none bg-white"
                                    placeholder="Return pickup location..."
                                />
                                <input
                                    value={returnDropoffLocation}
                                    onChange={(e) => setReturnDropoffLocation(e.target.value)}
                                    className="h-7 w-44 text-[11px] font-bold border rounded px-2 outline-none bg-white"
                                    placeholder="Return drop-off location..."
                                />
                                <div className="flex gap-1">
                                    <input
                                        type="date"
                                        value={returnDate}
                                        min={booking?.pickup_date}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        className="h-7 w-[100px] text-[10px] font-bold border rounded px-1.5 outline-none bg-white"
                                    />
                                    <input
                                        type="time"
                                        value={returnTime}
                                        onChange={(e) => setReturnTime(e.target.value)}
                                        className="h-7 w-20 text-[10px] font-bold border rounded px-1.5 outline-none bg-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Status Custom Input */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 bg-white rounded-lg border p-1 shadow-sm px-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 whitespace-nowrap">Status:</span>
                            <input
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                className="h-7 w-24 text-[11px] font-bold outline-none bg-transparent"
                                placeholder="e.g. Paid, Partially Paid"
                            />
                        </div>
                        <div className="flex gap-1 px-1">
                            {['Paid', 'Partially Paid', 'Unpaid'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setPaymentStatus(s)}
                                    className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all ${paymentStatus === s
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Deposit amount — only relevant once Partially Paid is selected */}
                    {status === 'partial' && (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 bg-white rounded-lg border p-1 shadow-sm px-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 whitespace-nowrap">Paid:</span>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={booking.deposit_amount ?? ''}
                                    onChange={(e) => setBooking({ ...booking, deposit_amount: e.target.value ? parseFloat(e.target.value) : null })}
                                    className="h-7 w-20 text-[11px] font-bold outline-none bg-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    )}

                    {/* Payment Method Custom Input */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 bg-white rounded-lg border p-1 shadow-sm px-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 whitespace-nowrap">Method:</span>
                            <input
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="h-7 w-28 text-[11px] font-bold outline-none bg-transparent"
                                placeholder="e.g. Cash, Link"
                            />
                        </div>
                        <div className="flex gap-1 px-1">
                            {['Cash to Driver', 'Online', 'Bank Transfer'].map((method) => (
                                <button
                                    key={method}
                                    onClick={() => {
                                        setPaymentMethod(method);
                                        if (method === 'Bank Transfer') {
                                            setBankDetails(prev => ({ ...prev, showOnDocument: true }));
                                        }
                                    }}
                                    className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all ${paymentMethod === method
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Currency Custom Input */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 bg-white rounded-lg border p-1 shadow-sm px-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 whitespace-nowrap">Curr:</span>
                            <input
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                                className="h-7 w-16 text-[11px] font-bold outline-none bg-transparent uppercase"
                                placeholder="SAR"
                            />
                        </div>
                        <div className="flex gap-1 px-1">
                            {['SAR', 'KWD', 'AED', 'USD'].map((curr) => (
                                <button
                                    key={curr}
                                    onClick={() => setCurrency(curr)}
                                    className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all ${currency === curr
                                            ? 'bg-primary text-black'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button onClick={handlePrint} className="bg-primary text-black hover:bg-black hover:text-white font-bold h-10 px-6">
                        <Printer className="w-4 h-4 mr-2" /> Download PDF
                    </Button>

                    <Button
                        onClick={handleSendEmail}
                        disabled={sendingEmail}
                        className={`font-bold h-10 px-6 ${emailSent ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        {sendingEmail ? 'Sending...' : emailSent ? '✓ Email Sent!' : 'Send Invoice Email'}
                    </Button>
                </div>
            </div>

            {/* Quick Note Input — screen only */}
            <div className="max-w-[210mm] mx-auto mb-3 print:hidden">
                <textarea
                    value={quickNote}
                    onChange={e => setQuickNote(e.target.value)}
                    placeholder="Type a custom message here (e.g. I have 2 checked bags...)"
                    rows={2}
                    className="w-full border-2 border-dashed border-primary/20 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-primary focus:ring-0 resize-none bg-white/50 backdrop-blur-sm shadow-sm transition-all"
                />
            </div>

            {/* Multi-Stop Builder — screen only. Only meaningful when the booking
                has no structured itinerary_legs; a booking with a real multi-day
                itinerary already has its full schedule and doesn't need this. */}
            {!hasItinerary && (
                <div className="max-w-[210mm] mx-auto mb-4 print:hidden">
                    <div className="bg-white border-2 border-dashed border-orange-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs font-black text-orange-600 uppercase tracking-widest">Extra Stops (single trip)</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Add waypoints between pickup and drop-off. For a multi-day/multi-leg itinerary, add legs on the booking itself instead.</p>
                            </div>
                            <button
                                onClick={addStop}
                                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Stop
                            </button>
                        </div>

                        {stops.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic text-center py-2">No extra stops. Click "Add Stop" to add intermediate locations.</p>
                        ) : (
                            <div className="space-y-2">
                                {stops.map((stop, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <span className="text-[10px] font-black text-gray-400 w-14 shrink-0">Stop {i + 1}</span>
                                        <input
                                            type="time"
                                            value={stop.time}
                                            onChange={e => updateStop(i, 'time', e.target.value)}
                                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-orange-400 w-28 shrink-0"
                                        />
                                        <input
                                            type="text"
                                            value={stop.location}
                                            onChange={e => updateStop(i, 'location', e.target.value)}
                                            placeholder="Location / address..."
                                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-400"
                                        />
                                        <button onClick={() => removeStop(i)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Additional Recipients */}
            <div className="max-w-[210mm] mx-auto mb-4 print:hidden">
                <div className="bg-white border-2 border-dashed border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Additional Recipients</p>
                    <p className="text-[10px] text-gray-400 mb-3">Invoice email will also be sent (CC) to these addresses</p>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="email"
                            value={emailInput}
                            onChange={e => setEmailInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addEmail()}
                            placeholder="email@example.com"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400"
                        />
                        <button
                            onClick={addEmail}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                    </div>
                    {additionalEmails.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {additionalEmails.map(email => (
                                <span key={email} className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded-full">
                                    {email}
                                    <button onClick={() => setAdditionalEmails(prev => prev.filter(e => e !== email))} className="text-blue-400 hover:text-red-500 transition-colors ml-0.5">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bank Details Editor Card — screen only */}
            <div className="max-w-[210mm] mx-auto mb-4 print:hidden">
                <div className="bg-white border-2 border-dashed border-blue-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🏦</span>
                            <div>
                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Bank Transfer Details</p>
                                <p className="text-[10px] text-gray-400">Configure bank information shown on the invoice document</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Show On Document</label>
                            <input
                                type="checkbox"
                                checked={bankDetails.showOnDocument}
                                onChange={(e) => setBankDetails({...bankDetails, showOnDocument: e.target.checked})}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                        </div>
                    </div>

                    {bankDetails.showOnDocument && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Bank Name</span>
                                <input
                                    value={bankDetails.bankName}
                                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                                    placeholder="e.g. Al Rajhi Bank"
                                    className="h-8 text-xs font-bold border rounded px-2 outline-none focus:border-blue-400 bg-gray-50/50"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Account Holder</span>
                                <input
                                    value={bankDetails.accountName}
                                    onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                                    placeholder="e.g. Taxi Service KSA"
                                    className="h-8 text-xs font-bold border rounded px-2 outline-none focus:border-blue-400 bg-gray-50/50"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Account Number</span>
                                <input
                                    value={bankDetails.accountNumber}
                                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                                    placeholder="e.g. 123456789012345"
                                    className="h-8 text-xs font-bold border rounded px-2 outline-none focus:border-blue-400 bg-gray-50/50"
                                />
                            </div>
                            <div className="flex flex-col gap-1 md:col-span-2">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">IBAN Number</span>
                                <input
                                    value={bankDetails.iban}
                                    onChange={(e) => setBankDetails({...bankDetails, iban: e.target.value})}
                                    placeholder="e.g. SA8280000000..."
                                    className="h-8 text-xs font-bold border rounded px-2 outline-none focus:border-blue-400 bg-gray-50/50"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">SWIFT / BIC Code (Optional)</span>
                                <input
                                    value={bankDetails.swiftCode}
                                    onChange={(e) => setBankDetails({...bankDetails, swiftCode: e.target.value})}
                                    placeholder="e.g. RAJHSARIXXX"
                                    className="h-8 text-xs font-bold border rounded px-2 outline-none focus:border-blue-400 bg-gray-50/50"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Invoice Container — A4, allowed to flow across multiple pages */}
            <div id="invoice-print" dir={lang === 'ar' ? 'rtl' : 'ltr'} className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none print:max-w-none print:w-[210mm] box-border">
                {/* Decorative Top Bar */}
                <div className="h-1.5 bg-gray-900 w-full"></div>

                <div className="px-10 py-9 print:px-[18mm] print:py-[16mm] flex flex-col bg-white">

                    {/* ============ HEADER ============ */}
                    <div className="flex justify-between items-start mb-7 pb-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-[26px] leading-tight font-bold tracking-tight text-gray-900">
                                Taxi Service <span className="text-lime-600">KSA</span>
                            </h2>
                            <div className="text-[10.5px] text-gray-500 space-y-1 mt-2.5 leading-snug">
                                <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-400" /> {t.city}</p>
                                <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-400" /> info@taxiserviceksa.com</p>
                                <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400" /> <span dir="ltr">+966 57 580 6733</span></p>
                                <p className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-gray-400" /> www.taxiserviceksa.com</p>
                            </div>
                        </div>
                        <div className={lang === 'ar' ? 'text-left' : 'text-right'}>
                            <h1 className="text-[34px] leading-none font-bold text-gray-900 tracking-wide">{t.invoice}</h1>
                            <div className="mt-2 text-[10.5px] text-gray-500 space-y-0.5">
                                <p><span className="text-gray-400">{t.no}</span> <span className="font-mono font-semibold text-gray-800">{invoiceNumber}</span></p>
                                <p>{t.issueDate} <span className="font-semibold text-gray-800">{invoiceDate}</span></p>
                                <p>{t.bookingRef} <span className="font-mono font-semibold text-gray-800">{bookingRef}</span></p>
                            </div>
                            <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded border text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLE[status].badge}`}>
                                {STATUS_STYLE[status].icon === 'ok' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {t[STATUS_LABEL_KEY[status]]}
                            </div>
                            <div className={`flex gap-1.5 mt-2 flex-wrap ${lang === 'ar' ? 'justify-start' : 'justify-end'}`}>
                                {isRoundTrip && (
                                    <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 whitespace-nowrap">
                                        <Repeat className="w-2.5 h-2.5" /> {t.roundTrip}
                                    </span>
                                )}
                                {booking.trip_type === 'hourly' && (
                                    <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 whitespace-nowrap">
                                        <Clock className="w-2.5 h-2.5" /> {t.hourlyHire} · {booking.duration_hours || '?'}{lang === 'ar' ? '' : 'h'}
                                    </span>
                                )}
                                {booking.contract_id && (
                                    <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
                                        {t.monthlyContract}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ============ BILL TO / BOOKING DETAILS ============ */}
                    <div className="grid grid-cols-2 gap-8 mb-7">
                        <div>
                            <h3 className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t.billTo}</h3>
                            <p className="text-[15px] font-semibold text-gray-900">{booking.customer_name}</p>
                            <div className="space-y-1 text-[11px] text-gray-600 mt-1.5">
                                <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400 flex-shrink-0" /> <span dir="ltr">{booking.customer_phone}</span></p>
                                <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-400 flex-shrink-0" /> {booking.customer_email}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t.bookingDetails}</h3>
                            <div className="space-y-1">
                                {[
                                    { label: t.serviceDate, value: serviceDateLabel },
                                    { label: t.timeLabel, value: formatTime12h(booking.pickup_time) },
                                    { label: t.vehicleLabel, value: booking.vehicle_type },
                                    { label: t.passengersLabel, value: `${booking.passengers} ${t.pax} · ${booking.luggage} ${t.bags}` },
                                    { label: t.serviceTypeLabel, value: serviceTitle },
                                    ...(booking.trip_type === 'hourly' ? [{ label: t.durationLabel, value: `${booking.duration_hours || '?'} ${t.hours}` }] : []),
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-baseline gap-3 text-[11px]">
                                        <span className="text-gray-500 shrink-0">{label}</span>
                                        <span className="font-semibold text-gray-900 text-right">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ============ BOOKING SUMMARY STRIP ============ */}
                    <div className="grid grid-cols-4 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden mb-7">
                        {[
                            { label: t.serviceDate, value: serviceDateLabel },
                            { label: t.vehiclesLabel, value: booking.vehicle_type },
                            { label: t.passengersLabel, value: `${booking.passengers} ${t.pax}` },
                            { label: t.serviceTypeLabel, value: serviceTitle },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-gray-50 px-3 py-2.5">
                                <p className="text-[8.5px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                                <p className="text-[11.5px] font-semibold text-gray-900 leading-snug break-words">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* ============ ITINERARY ============ */}
                    {hasItinerary ? (
                        <div className="mb-7" style={{ breakInside: 'avoid' }}>
                            <h3 className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{t.fullItinerary}</h3>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-[9.5px] font-bold text-gray-500 uppercase tracking-wide">
                                        <th className="text-left px-3 py-2 border-b-2 border-gray-200">{t.itinDate}</th>
                                        <th className="text-left px-3 py-2 border-b-2 border-gray-200">{t.itinTime}</th>
                                        <th className="text-left px-3 py-2 border-b-2 border-gray-200">{t.itinPickup}</th>
                                        <th className="text-left px-3 py-2 border-b-2 border-gray-200">{t.itinDest}</th>
                                        <th className="text-left px-3 py-2 border-b-2 border-gray-200">{t.itinVehicle}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[10.5px] text-gray-800">
                                    <tr style={{ breakInside: 'avoid' }} className="border-b border-gray-100">
                                        <td className="px-3 py-2 font-mono whitespace-nowrap">{booking.pickup_date}</td>
                                        <td className="px-3 py-2 font-mono whitespace-nowrap">{formatTime12h(booking.pickup_time)}</td>
                                        <td className="px-3 py-2 font-medium">{booking.pickup_location}</td>
                                        <td className="px-3 py-2 font-medium">{booking.destination}</td>
                                        <td className="px-3 py-2 text-gray-500">{booking.vehicle_type}</td>
                                    </tr>
                                    {booking.itinerary_legs!.map((leg, i) => (
                                        <tr key={i} style={{ breakInside: 'avoid' }} className="border-b border-gray-100">
                                            <td className="px-3 py-2 font-mono whitespace-nowrap">{leg.date}</td>
                                            <td className="px-3 py-2 font-mono whitespace-nowrap">{leg.time ? formatTime12h(leg.time) : '—'}</td>
                                            <td className="px-3 py-2 font-medium">{leg.pickup}</td>
                                            <td className="px-3 py-2 font-medium">{leg.dropoff}</td>
                                            <td className="px-3 py-2 text-gray-500">{booking.vehicle_type}</td>
                                        </tr>
                                    ))}
                                    {isRoundTrip && returnDate && (
                                        <tr style={{ breakInside: 'avoid' }}>
                                            <td className="px-3 py-2 font-mono whitespace-nowrap">{returnDate}</td>
                                            <td className="px-3 py-2 font-mono whitespace-nowrap">{returnTime ? formatTime12h(returnTime) : '—'}</td>
                                            <td className="px-3 py-2 font-medium">{returnPickupLocation || booking.destination}</td>
                                            <td className="px-3 py-2 font-medium">{returnDropoffLocation || booking.pickup_location}</td>
                                            <td className="px-3 py-2 text-gray-500">{booking.vehicle_type}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <>
                            {/* Route Details — Outbound (simple, single-trip bookings) */}
                            <div className="mb-6" style={{ breakInside: 'avoid' }}>
                                <h3 className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                                    {isRoundTrip ? t.outbound : t.journeyRoute}
                                    {booking.pickup_date ? ` · ${booking.pickup_date}${booking.pickup_time ? ` ${formatTime12h(booking.pickup_time)}` : ''}` : ''}
                                    {stops.length > 0 && <span className="text-orange-500 normal-case font-medium mx-1.5">· {stops.length} {stops.length > 1 ? t.stops : t.stop}</span>}
                                </h3>
                                <div className={`relative space-y-3 before:absolute before:top-2 before:bottom-2 before:w-0.5 before:border-dashed before:border-gray-200 ${lang === 'ar' ? 'pr-5 before:right-[7px] before:border-r-2' : 'pl-5 before:left-[7px] before:border-l-2'}`}>
                                    <div className="relative">
                                        <div className={`absolute top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm ${lang === 'ar' ? '-right-[18px]' : '-left-[18px]'}`}></div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase">{t.pickup}</p>
                                        <p className="text-sm font-semibold text-gray-900 leading-snug break-words">{booking.pickup_location}</p>
                                    </div>
                                    {stops.filter(s => s.location.trim()).map((stop, i) => (
                                        <div key={i} className="relative">
                                            <div className={`absolute top-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${lang === 'ar' ? '-right-[18px]' : '-left-[18px]'}`}>
                                                <span className="text-white text-[6px] font-bold">{i + 1}</span>
                                            </div>
                                            <p className="text-[10px] text-orange-500 font-semibold uppercase">
                                                {i + 1}. {stop.time ? ` · ${stop.time}` : ''}
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 leading-snug break-words">{stop.location}</p>
                                        </div>
                                    ))}
                                    <div className="relative">
                                        <div className={`absolute top-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm ${lang === 'ar' ? '-right-[18px]' : '-left-[18px]'}`}></div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase">{isRoundTrip ? t.destination : t.dropoff}</p>
                                        <p className="text-sm font-semibold text-gray-900 leading-snug break-words">{booking.destination}</p>
                                    </div>
                                </div>
                            </div>

                            {isRoundTrip && (
                                <div className="mb-6" style={{ breakInside: 'avoid' }}>
                                    <h3 className="text-[9.5px] font-bold text-blue-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                        <Repeat className="w-2.5 h-2.5" />
                                        {t.returnLeg}
                                        {returnDate ? ` · ${returnDate}${returnDate === booking.pickup_date ? ` (${t.sameDay})` : ''}${returnTime ? ` ${formatTime12h(returnTime)}` : ''}` : ''}
                                    </h3>
                                    <div className={`relative space-y-3 before:absolute before:top-2 before:bottom-2 before:w-0.5 before:border-dashed before:border-blue-200 ${lang === 'ar' ? 'pr-5 before:right-[7px] before:border-r-2' : 'pl-5 before:left-[7px] before:border-l-2'}`}>
                                        <div className="relative">
                                            <div className={`absolute top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm ${lang === 'ar' ? '-right-[18px]' : '-left-[18px]'}`}></div>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase">{t.pickup}</p>
                                            <p className="text-sm font-semibold text-gray-900 leading-snug break-words">{returnPickupLocation || booking.destination}</p>
                                        </div>
                                        <div className="relative">
                                            <div className={`absolute top-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm ${lang === 'ar' ? '-right-[18px]' : '-left-[18px]'}`}></div>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase">{t.dropoff}</p>
                                            <p className="text-sm font-semibold text-gray-900 leading-snug break-words">{returnDropoffLocation || booking.pickup_location}</p>
                                        </div>
                                    </div>
                                    {!returnDate && (
                                        <p className="text-[10px] text-gray-400 italic mt-1.5">{t.returnNotRecorded}</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* ============ SERVICE DESCRIPTION + PRICING ============ */}
                    <div className="mb-7" style={{ breakInside: 'avoid' }}>
                        <h3 className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{t.serviceDescription}</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-[9.5px] font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-2.5">{t.description}</th>
                                        <th className="px-4 py-2.5 text-center w-16">{t.qty}</th>
                                        <th className="px-4 py-2.5 text-right w-32">{t.unitPrice}</th>
                                        <th className="px-4 py-2.5 text-right w-32">{t.amount}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t border-gray-100">
                                        <td className="px-4 py-3.5 align-top">
                                            <p className="font-bold text-gray-900 text-[13px]">
                                                {hasItinerary ? t.completePackage : serviceTitle}
                                            </p>
                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                {booking.vehicle_type} — {t.chauffeurService}
                                            </p>
                                            <p className="text-[10.5px] text-gray-400 mt-1 font-medium">
                                                {hasItinerary
                                                    ? `${serviceTitle} · ${serviceDateLabel}`
                                                    : booking.trip_type === 'hourly'
                                                        ? `${booking.pickup_location.split(',')[0]} — ${booking.duration_hours || '?'} ${t.hours}`
                                                        : isRoundTrip
                                                            ? `${booking.pickup_location.split(',')[0]} ↔ ${booking.destination.split(',')[0]}`
                                                            : `${booking.pickup_location.split(',')[0]} → ${booking.destination.split(',')[0]}`}
                                            </p>
                                            {booking.special_requests && (
                                                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100 text-[10.5px] text-gray-500 whitespace-pre-wrap leading-snug">
                                                    <span className="font-semibold">{t.specialRequests} </span>{booking.special_requests}
                                                </div>
                                            )}
                                            {quickNote.trim() && (
                                                <div className="mt-2 border-l-2 border-primary px-3 py-1.5 bg-primary/5 rounded-r">
                                                    <p className="text-[11px] text-gray-700 whitespace-pre-wrap leading-snug">{quickNote.trim()}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center align-top text-[12px] text-gray-700">1</td>
                                        <td className="px-4 py-3.5 text-right align-top text-[12px] text-gray-700">{currency} {total.toFixed(2)}</td>
                                        <td className="px-4 py-3.5 text-right align-top">
                                            <span className="text-[13px] font-bold text-gray-900">{currency} {total.toFixed(2)}</span>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    {status === 'partial' && (
                                        <>
                                            <tr className="border-t border-gray-100">
                                                <td colSpan={3} className="px-4 py-2 text-right text-[10.5px] font-semibold text-amber-600">{t.depositPaid}</td>
                                                <td className="px-4 py-2 text-right border-l border-gray-100">
                                                    <span className="text-[12.5px] font-bold text-amber-700">{currency} {deposit.toFixed(2)}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan={3} className="px-4 py-2 text-right text-[10.5px] font-semibold text-gray-500">{t.balanceDue}</td>
                                                <td className="px-4 py-2 text-right border-l border-gray-100">
                                                    <span className="text-[12.5px] font-bold text-gray-900">{currency} {balance.toFixed(2)}</span>
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                    <tr className="bg-gray-900">
                                        <td colSpan={3} className="px-4 py-3.5 text-right text-[12px] font-bold uppercase tracking-wide text-white/60">{t.totalPayable}</td>
                                        <td className="px-4 py-3.5 text-right border-l border-white/10">
                                            <span className="text-[19px] font-bold text-primary">{currency} {total.toFixed(2)}</span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* ============ PAYMENT DETAILS + BOOKING CONFIRMATION ============ */}
                    <div className="grid grid-cols-2 gap-4 mb-7" style={{ breakInside: 'avoid' }}>
                        <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-200">
                            <h3 className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">{t.paymentDetails}</h3>
                            <p className="text-[11px] text-gray-500 mb-1">{t.paymentMethodLabel}: <span className="font-semibold text-gray-800">{lang === 'ar' ? (METHOD_AR[paymentMethod] || paymentMethod) : paymentMethod}</span></p>
                            <p className="text-[11px] text-gray-700 font-medium leading-snug mb-2">
                                {paymentInstructionText}
                            </p>
                            {status === 'paid' && (
                                <p className="text-[11px] font-bold text-green-700">{t.amountReceived}: {currency} {total.toFixed(2)}</p>
                            )}
                            {status === 'partial' && (
                                <>
                                    <p className="text-[11px] font-bold text-amber-700">{t.amountReceived}: {currency} {deposit.toFixed(2)}</p>
                                    <p className="text-[11px] font-bold text-gray-800">{t.remainingBalance}: {currency} {balance.toFixed(2)}</p>
                                </>
                            )}
                            {status === 'unpaid' && (
                                <p className="text-[11px] font-bold text-red-700">{t.paymentRequired}: {currency} {total.toFixed(2)}</p>
                            )}
                        </div>
                        <div className={`rounded-lg p-3.5 border ${STATUS_STYLE[status].box}`}>
                            <h3 className="text-[9.5px] font-bold uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                {STATUS_STYLE[status].icon === 'ok' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {confirmationHeading}
                            </h3>
                            <p className="text-[11px] text-gray-700 leading-snug">
                                {confirmationText}
                            </p>
                        </div>
                    </div>

                    {/* Printed Bank Details Block */}
                    {bankDetails.showOnDocument && (
                        <div className="mb-7 bg-blue-50/40 rounded-lg p-4 border border-blue-100" style={{ breakInside: 'avoid' }}>
                            <h3 className="text-[10.5px] font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5 mb-3 pb-2 border-b border-blue-100">
                                <Landmark className="w-3.5 h-3.5" /> {t.bankDetails}
                            </h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
                                {bankDetails.bankName && (
                                    <div className="flex justify-between border-b border-gray-100 pb-1">
                                        <span className="text-gray-500">{t.bankName}</span>
                                        <span className="font-semibold text-gray-900">{bankDetails.bankName}</span>
                                    </div>
                                )}
                                {bankDetails.accountName && (
                                    <div className="flex justify-between border-b border-gray-100 pb-1">
                                        <span className="text-gray-500">{t.accountName}</span>
                                        <span className="font-semibold text-gray-900">{bankDetails.accountName}</span>
                                    </div>
                                )}
                                {bankDetails.accountNumber && (
                                    <div className="flex justify-between border-b border-gray-100 pb-1">
                                        <span className="text-gray-500">{t.accountNumber}</span>
                                        <span className="font-semibold font-mono text-gray-900">{bankDetails.accountNumber}</span>
                                    </div>
                                )}
                                {bankDetails.swiftCode && (
                                    <div className="flex justify-between border-b border-gray-100 pb-1">
                                        <span className="text-gray-500">{t.swift}</span>
                                        <span className="font-semibold font-mono text-gray-900">{bankDetails.swiftCode}</span>
                                    </div>
                                )}
                                {bankDetails.iban && (
                                    <div className="col-span-2 flex justify-between border-b border-gray-100 pb-1">
                                        <span className="text-gray-500">{t.iban}</span>
                                        <span className="font-semibold font-mono text-gray-900 tracking-wide">{bankDetails.iban}</span>
                                    </div>
                                )}
                            </div>
                            {bankDetails.notes && (
                                <p className="text-[10.5px] text-blue-600/80 italic mt-2">{t.note} {bankDetails.notes}</p>
                            )}
                        </div>
                    )}

                    {/* ============ TERMS ============ */}
                    <div className="mb-7" style={{ breakInside: 'avoid' }}>
                        <p className="font-bold text-gray-900 mb-2 uppercase tracking-wide text-[9.5px]">{t.terms}</p>
                        <ol className="list-decimal list-inside space-y-1 text-[9.5px] text-gray-500 leading-relaxed grid grid-cols-2 gap-x-6">
                            <li>{t.term1}</li>
                            <li>{t.term2}</li>
                            <li>{t.term3}</li>
                            <li>{t.term4}</li>
                            <li>{t.term5}</li>
                            <li>{t.term6}</li>
                            <li>{t.term7}</li>
                            <li>{t.term8}</li>
                            <li>{t.term9}</li>
                        </ol>
                    </div>

                    {/* ============ SIGNATURE ============ */}
                    <div className="mt-auto pt-2" style={{ breakInside: 'avoid' }}>
                        <div className={`flex items-end gap-6 ${lang === 'ar' ? 'justify-start' : 'justify-end'}`}>
                            <div className="text-center">
                                <p className="text-[8.5px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t.authorizedSignature}</p>
                                <img src="/ismail-signature.png" alt="Ismail" className="h-7 w-auto object-contain mx-auto" />
                                <p className="text-[9.5px] font-semibold text-gray-700 border-t border-gray-300 pt-1 mt-1 min-w-[70px]">Ismail</p>
                                <p className="text-[8px] text-gray-400">{t.director}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8.5px] font-bold text-gray-400 uppercase tracking-wide mb-2 invisible">{t.authorizedSignature}</p>
                                <img src="/zumer-signature.png" alt="Zumer" className="h-7 w-auto object-contain mx-auto" />
                                <p className="text-[9.5px] font-semibold text-gray-700 border-t border-gray-300 pt-1 mt-1 min-w-[70px]">Zumer</p>
                                <p className="text-[8px] text-gray-400">{t.partner}</p>
                            </div>
                        </div>
                    </div>

                    {/* ============ FOOTER ============ */}
                    <div className="mt-6 pt-4 border-t border-gray-100 text-center" style={{ breakInside: 'avoid' }}>
                        <p className="text-[9px] font-semibold text-gray-500">{t.thankYou}</p>
                        <p className="text-[8.5px] text-gray-400 mt-1">{t.tagline}</p>
                        <p className="text-[8.5px] text-gray-400 mt-1">info@taxiserviceksa.com · +966 57 580 6733 · www.taxiserviceksa.com</p>
                    </div>
                </div>
            </div>

            {/* Print Styling */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    html, body {
                        width: 210mm;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        overflow: visible !important;
                    }
                    #invoice-print {
                        width: 210mm !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 auto !important;
                        overflow: visible !important;
                    }
                    h1, h2, h3 {
                        break-after: avoid;
                    }
                    table, tr {
                        break-inside: avoid;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
