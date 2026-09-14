'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { adminFetch } from '@/lib/admin-fetch';
import { formatTime12h } from '@/lib/format-time';
import { downloadDocumentPdf, documentPdfToBase64 } from '@/lib/document-pdf';
import { getReturnRoute } from '@/lib/booking-validation';
import { ArrowLeft, Mail, Printer, Languages, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DocLang = 'en' | 'ar';

const RECEIPT_TEXT: Record<DocLang, Record<string, string>> = {
    en: {
        officialReceipt: 'Official Payment Receipt', no: 'No.', date: 'Date:',
        certifyPrefix: 'This is to certify that we have received from',
        sumOf: 'the sum of',
        paymentFor: 'being payment for private transport services rendered on',
        particulars: 'Particulars', details: 'Details', amount: 'Amount',
        service: 'Service', privateChauffeurTransfer: 'Private Chauffeur Transfer',
        hourlyChauffeurService: 'Hourly Chauffeur Service', durationLabel: 'Duration', hours: 'hours',
        route: 'Route', to: 'to', outboundRoute: 'Outbound Route', returnRoute: 'Return Route',
        returnDateTime: 'Return Date & Time', sameDay: 'same day',
        dateTime: 'Date & Time', vehicle: 'Vehicle', passengers: 'Passengers',
        paymentMethod: 'Payment Method', remarks: 'Remarks',
        totalReceived: 'Total Amount Received',
        payeeInfo: 'Payee Information', fullName: 'Full Name', phone: 'Phone', email: 'Email',
        director: 'Director', partner: 'Partner',
        issued: 'Issued', officialNote: 'This is an official receipt — Please retain for your records',
        companyTagline: 'Premium Private Transport — Kingdom of Saudi Arabia',
        city: 'Jeddah',
    },
    ar: {
        officialReceipt: 'إيصال دفع رسمي', no: 'الرقم', date: 'التاريخ:',
        certifyPrefix: 'نشهد بأننا استلمنا من',
        sumOf: 'مبلغاً وقدره',
        paymentFor: 'كدفعة مقابل خدمات النقل الخاص المقدمة بتاريخ',
        particulars: 'البيان', details: 'التفاصيل', amount: 'المبلغ',
        service: 'الخدمة', privateChauffeurTransfer: 'نقل خاص بسائق',
        hourlyChauffeurService: 'خدمة سائق بالساعة', durationLabel: 'المدة', hours: 'ساعات',
        route: 'المسار', to: 'إلى', outboundRoute: 'مسار الذهاب', returnRoute: 'مسار العودة',
        returnDateTime: 'تاريخ ووقت العودة', sameDay: 'نفس اليوم',
        dateTime: 'التاريخ والوقت', vehicle: 'المركبة', passengers: 'الركاب',
        paymentMethod: 'طريقة الدفع', remarks: 'ملاحظات',
        totalReceived: 'إجمالي المبلغ المستلم',
        payeeInfo: 'معلومات المستلم', fullName: 'الاسم الكامل', phone: 'الهاتف', email: 'البريد الإلكتروني',
        director: 'المدير', partner: 'الشريك',
        issued: 'تاريخ الإصدار', officialNote: 'هذا إيصال رسمي — يرجى الاحتفاظ به لسجلاتكم',
        companyTagline: 'خدمة نقل خاصة فاخرة — المملكة العربية السعودية',
        city: 'جدة',
    },
};

const METHOD_AR: Record<string, string> = { 'Cash to Driver': 'نقداً للسائق', Online: 'دفع إلكتروني', 'Bank Transfer': 'تحويل بنكي' };

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
    has_return_trip?: boolean;
    return_date?: string | null;
    return_time?: string | null;
    return_pickup_location?: string | null;
    return_destination?: string | null;
}

export default function ReceiptPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState<DocLang>('en');
    const [currency, setCurrency] = useState('SAR');
    const [paymentMethod, setPaymentMethod] = useState('Cash to Driver');
    const [amountPaid, setAmountPaid] = useState('');
    const [receiptNote, setReceiptNote] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const { data, error } = await supabase
                    .from('bookings').select('*').eq('id', id).single();
                if (error) throw error;
                setBooking(data);
                if (data.currency) setCurrency(data.currency);
                if (data.payment_method) setPaymentMethod(data.payment_method);
                if (data.total_price) setAmountPaid(data.total_price.toFixed(2));
            } catch (err) {
                console.error('Error fetching booking:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchBooking();
    }, [id]);

    const receiptNumber = booking ? `RCP-${booking.id.slice(0, 8).toUpperCase()}` : '';
    const receiptDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    const handlePrint = async () => {
        if (!booking) return;
        await downloadDocumentPdf('receipt-print', `Receipt-${receiptNumber}.pdf`);
    };

    const handleSendEmail = async () => {
        if (!booking) return;
        setSendingEmail(true);
        setEmailSent(false);
        try {
            const filename = `Receipt-${receiptNumber}.pdf`;
            const base64 = await documentPdfToBase64('receipt-print', filename);

            await supabase.from('bookings')
                .update({ currency, payment_status: 'paid', payment_method: paymentMethod })
                .eq('id', booking.id);

            const res = await adminFetch('/api/send-receipt-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking, pdfBase64: base64,
                    filename,
                    currency, paymentMethod,
                    amountPaid: amountPaid || booking.total_price?.toFixed(2),
                }),
            });
            if (!res.ok) throw new Error('failed');
            setEmailSent(true);
            setTimeout(() => setEmailSent(false), 4000);
        } catch (err) {
            alert('Failed to send receipt. Please try again.');
        } finally {
            setSendingEmail(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
        </div>
    );
    if (!booking) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <p className="text-xl font-bold">Booking not found</p>
            <Button onClick={() => router.back()}>Go Back</Button>
        </div>
    );

    const amount = amountPaid || booking.total_price?.toFixed(2) || '0.00';
    const t = RECEIPT_TEXT[lang];

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 print:bg-white print:py-0 print:px-0">

            {/* Controls */}
            <div className="max-w-[210mm] mx-auto mb-4 print:hidden">
                <div className="flex flex-wrap gap-3 items-center justify-between bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <Button variant="outline" onClick={() => router.back()} className="h-9 text-sm">
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                    </Button>

                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Language Toggle */}
                        <button
                            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                            className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 h-9 bg-gray-50 hover:bg-gray-100 transition-all text-xs font-bold"
                        >
                            <Languages className="w-3.5 h-3.5" /> {lang === 'en' ? 'English' : 'عربي'}
                        </button>

                        {/* Amount */}
                        <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Amt:</span>
                            <input value={amountPaid} onChange={e => setAmountPaid(e.target.value)}
                                className="w-20 text-xs font-bold outline-none bg-transparent" placeholder="0.00" />
                        </div>

                        {/* Currency */}
                        <div className="flex gap-1">
                            {['SAR','KWD','AED','USD'].map(c => (
                                <button key={c} onClick={() => setCurrency(c)}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${currency === c ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                    {c}
                                </button>
                            ))}
                        </div>

                        {/* Method */}
                        <div className="flex gap-1">
                            {['Cash to Driver','Online','Bank Transfer'].map(m => (
                                <button key={m} onClick={() => setPaymentMethod(m)}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${paymentMethod === m ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>

                        <Button onClick={handlePrint} className="bg-gray-900 text-white hover:bg-black font-bold h-9 px-4 text-sm">
                            <Printer className="w-4 h-4 mr-1.5" /> PDF
                        </Button>
                        <Button onClick={handleSendEmail} disabled={sendingEmail}
                            className={`font-bold h-9 px-4 text-sm ${emailSent ? 'bg-green-500 text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                            <Mail className="w-4 h-4 mr-1.5" />
                            {sendingEmail ? 'Sending...' : emailSent ? '✓ Sent!' : 'Email Receipt'}
                        </Button>
                    </div>
                </div>

                {/* Note */}
                <div className="mt-3">
                    <textarea value={receiptNote} onChange={e => setReceiptNote(e.target.value)}
                        placeholder="Add a note (optional)..." rows={2}
                        className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-green-400 resize-none bg-white shadow-sm" />
                </div>
            </div>

            {/* ── A4 RECEIPT ── */}
            <div id="receipt-print" dir={lang === 'ar' ? 'rtl' : 'ltr'}
                className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none print:max-w-none print:w-[210mm] print:h-[296mm] print:overflow-hidden">

                {/* Top green stripe */}
                <div className="h-1.5 bg-green-500 w-full" />

                <div className="px-12 py-10 print:px-[14mm] print:py-[12mm] flex flex-col min-h-[calc(296mm-6px)] print:h-[calc(296mm-6px)] print:justify-between">

                    {/* ── HEADER ── */}
                    <div>

                        {/* Company letterhead */}
                        <div className="text-center pb-5 border-b-2 border-gray-900">
                            <p className="text-2xl font-black text-gray-900 uppercase tracking-[0.15em]">Taxi Service KSA</p>
                            <p className="text-xs text-gray-500 mt-1">{t.companyTagline}</p>
                            <p className="text-xs text-gray-400">{t.city} · info@taxiserviceksa.com · <span dir="ltr">+966 57 580 6733</span> · www.taxiserviceksa.com</p>
                        </div>

                        {/* OFFICIAL RECEIPT title */}
                        <div className="text-center py-4 border-b border-gray-200">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">{t.officialReceipt}</p>
                            <div className="flex items-center justify-center gap-6 mt-1">
                                <p className="text-xs text-gray-500 font-mono">{t.no} {receiptNumber}</p>
                                <span className="text-gray-300">·</span>
                                <p className="text-xs text-gray-500">{t.date} {receiptDate}</p>
                            </div>
                        </div>

                        {/* Received from statement */}
                        <div className="mt-6 mb-5 px-2">
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {t.certifyPrefix}{' '}
                                <strong className="text-gray-900 border-b border-gray-400">&nbsp;{booking.customer_name}&nbsp;</strong>
                                {' '}{t.sumOf}{' '}
                                <strong className="text-gray-900 border-b border-gray-400">&nbsp;{currency} {amount}&nbsp;</strong>
                                {' '}{t.paymentFor}{' '}
                                <strong className="text-gray-900 border-b border-gray-400">&nbsp;{booking.pickup_date}&nbsp;</strong>.
                            </p>
                        </div>

                        {/* Details table */}
                        <table className="w-full text-sm mb-5 border border-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left px-4 py-2.5 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">{t.particulars}</th>
                                    <th className="text-left px-4 py-2.5 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">{t.details}</th>
                                    <th className="text-right px-4 py-2.5 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">{t.amount}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 text-gray-700 font-medium align-top">{t.service}</td>
                                    <td className="px-4 py-3 text-gray-600 align-top">{booking.trip_type === 'hourly' ? t.hourlyChauffeurService : t.privateChauffeurTransfer}</td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900 align-top">{currency} {amount}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 text-gray-700 font-medium align-top">{booking.has_return_trip ? t.outboundRoute : t.route}</td>
                                    <td className="px-4 py-3 text-gray-600 align-top">
                                        {booking.pickup_location}<br />
                                        <span className="text-gray-400 text-xs">↓ {t.to}</span><br />
                                        {booking.destination}
                                    </td>
                                    <td className="px-4 py-3"></td>
                                </tr>
                                {booking.has_return_trip && (
                                    <>
                                        <tr className="border-b border-gray-100">
                                            <td className="px-4 py-3 text-gray-700 font-medium align-top flex items-center gap-1.5"><Repeat className="w-3 h-3 text-blue-500" /> {t.returnRoute}</td>
                                            <td className="px-4 py-3 text-gray-600 align-top">
                                                {getReturnRoute(booking).pickupLocation}<br />
                                                <span className="text-gray-400 text-xs">↓ {t.to}</span><br />
                                                {getReturnRoute(booking).destination}
                                            </td>
                                            <td className="px-4 py-3"></td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="px-4 py-3 text-gray-700 font-medium">{t.returnDateTime}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {booking.return_date
                                                    ? `${booking.return_date}${booking.return_date === booking.pickup_date ? ` (${t.sameDay})` : ''} — ${formatTime12h(booking.return_time)}`
                                                    : <span className="italic text-gray-400">—</span>}
                                            </td>
                                            <td className="px-4 py-3"></td>
                                        </tr>
                                    </>
                                )}
                                {booking.trip_type === 'hourly' && (
                                    <tr className="border-b border-gray-100">
                                        <td className="px-4 py-3 text-gray-700 font-medium">{t.durationLabel}</td>
                                        <td className="px-4 py-3 text-gray-600">{booking.duration_hours || '?'} {t.hours}</td>
                                        <td className="px-4 py-3"></td>
                                    </tr>
                                )}
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 text-gray-700 font-medium">{t.dateTime}</td>
                                    <td className="px-4 py-3 text-gray-600">{booking.trip_end_date && booking.trip_end_date !== booking.pickup_date ? `${booking.pickup_date} → ${booking.trip_end_date}` : `${booking.pickup_date} — ${formatTime12h(booking.pickup_time)}`}</td>
                                    <td className="px-4 py-3"></td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 text-gray-700 font-medium">{t.vehicle}</td>
                                    <td className="px-4 py-3 text-gray-600">{booking.vehicle_type} · {booking.passengers} {t.passengers}</td>
                                    <td className="px-4 py-3"></td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 text-gray-700 font-medium">{t.paymentMethod}</td>
                                    <td className="px-4 py-3 text-gray-600">{lang === 'ar' ? (METHOD_AR[paymentMethod] || paymentMethod) : paymentMethod}</td>
                                    <td className="px-4 py-3"></td>
                                </tr>
                                {receiptNote.trim() && (
                                    <tr className="border-b border-gray-100">
                                        <td className="px-4 py-3 text-gray-700 font-medium">{t.remarks}</td>
                                        <td className="px-4 py-3 text-gray-600 italic">{receiptNote.trim()}</td>
                                        <td className="px-4 py-3"></td>
                                    </tr>
                                )}
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-3 font-black text-gray-900 uppercase tracking-wide text-sm" colSpan={2}>{t.totalReceived}</td>
                                    <td className="px-4 py-3 text-right font-black text-gray-900 text-lg">{currency} {amount}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Customer details */}
                        <div className="border border-gray-200 rounded p-4 mb-5 bg-gray-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.payeeInfo}</p>
                            <div className="flex gap-12 text-sm">
                                <div>
                                    <span className="text-gray-400 text-xs">{t.fullName}</span>
                                    <p className="font-bold text-gray-900">{booking.customer_name}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-xs">{t.phone}</span>
                                    <p className="font-bold text-gray-900" dir="ltr">{booking.customer_phone}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-xs">{t.email}</span>
                                    <p className="font-bold text-gray-900">{booking.customer_email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── FOOTER: Signatures + Stamp ── */}
                    <div className="mt-auto">
                        <div className="flex justify-between items-end pt-5 border-t-2 border-gray-900">

                            {/* Signatures */}
                            <div className="flex gap-10">
                                <div className="text-center">
                                    <img src="/ismail-signature.png" alt="Ismail" className="h-10 w-auto max-w-[90px] object-contain select-none mx-auto" />
                                    <div className="border-t border-gray-800 mt-1 pt-1 w-28">
                                        <p className="text-xs font-black text-gray-700">Ismail</p>
                                        <p className="text-[10px] text-gray-400">{t.director}</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <img src="/zumer-signature.png" alt="Zumer" className="h-10 w-auto max-w-[90px] object-contain select-none mx-auto" />
                                    <div className="border-t border-gray-800 mt-1 pt-1 w-28">
                                        <p className="text-xs font-black text-gray-700">Zumer</p>
                                        <p className="text-[10px] text-gray-400">{t.partner}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Official round stamp */}
                            <div className="stamp-circle flex-shrink-0">
                                <div className="stamp-outer">
                                    <svg viewBox="0 0 120 120" className="stamp-svg">
                                        <defs>
                                            <path id="topArc" d="M 15,60 a 45,45 0 1,1 90,0" />
                                            <path id="botArc" d="M 105,60 a 45,45 0 1,1 -90,0" />
                                        </defs>
                                        {/* Outer ring */}
                                        <circle cx="60" cy="60" r="56" fill="none" stroke="#15803d" strokeWidth="2.5" />
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#15803d" strokeWidth="1" />
                                        {/* Curved top text */}
                                        <text fill="#15803d" fontSize="9" fontWeight="900" letterSpacing="2" fontFamily="Arial, sans-serif">
                                            <textPath href="#topArc" startOffset="10%">TAXI SERVICE KSA</textPath>
                                        </text>
                                        {/* Curved bottom text */}
                                        <text fill="#15803d" fontSize="8" fontWeight="700" letterSpacing="1.5" fontFamily="Arial, sans-serif">
                                            <textPath href="#botArc" startOffset="18%">JEDDAH · SAUDI ARABIA</textPath>
                                        </text>
                                        {/* Center checkmark */}
                                        <circle cx="60" cy="60" r="18" fill="#15803d" />
                                        <path d="M 50,60 L 57,68 L 72,52" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        {/* Star decorators */}
                                        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                                            const rad = (angle * Math.PI) / 180;
                                            const x = 60 + 44 * Math.cos(rad);
                                            const y = 60 + 44 * Math.sin(rad);
                                            return <circle key={i} cx={x} cy={y} r="2" fill="#15803d" />;
                                        })}
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 py-2.5 border-t-2 border-gray-900 flex justify-between items-center">
                            <p className="text-[10px] text-gray-400 font-mono">{receiptNumber} · {t.issued} {receiptDate}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">{t.officialNote}</p>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx global>{`
                .stamp-svg { width: 110px; height: 110px; }
                @media print {
                    @page { size: A4; margin: 0; }
                    html, body {
                        width: 210mm; height: 297mm;
                        margin: 0 !important; padding: 0 !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    #receipt-print {
                        width: 210mm !important; height: 296mm !important;
                        box-shadow: none !important;
                        overflow: hidden !important;
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
