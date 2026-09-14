'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
    Printer, 
    ArrowLeft, 
    MapPin, 
    Phone, 
    Calendar, 
    Clock, 
    Car,
    User,
    ClipboardCheck,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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
    flight_number?: string;
    driver_name?: string;
    actual_vehicle?: string;
}

export default function HandoverPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setBooking(data);
            } catch (error) {
                console.error('Error fetching booking:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBooking();
    }, [id]);

    const formatTime12h = (timeStr?: string) => {
        if (!timeStr) return '—';
        try {
            const parts = timeStr.split(':');
            if (parts.length < 2) return timeStr;
            let hours = parseInt(parts[0], 10);
            const minutes = parts[1];
            if (isNaN(hours)) return timeStr;
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            return `${hours}:${minutes} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    };

    const handlePrint = () => {
        window.print();
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

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 print:bg-white print:py-0 print:px-0">
            {/* Header Controls */}
            <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <Button variant="outline" onClick={() => router.back()} className="bg-white">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handlePrint} className="bg-slate-900 text-white hover:bg-black font-bold">
                    <Printer className="w-4 h-4 mr-2" /> Print Handover Sheet
                </Button>
            </div>

            {/* Handover Sheet */}
            <div className="max-w-3xl mx-auto bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden print:shadow-none print:border-none print:max-w-none print:w-full">
                {/* Header */}
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center print:text-black print:bg-gray-50 print:border-b">
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                             DRIVER HANDOVER SHEET
                        </h1>
                        <p className="text-xs text-slate-400 font-mono mt-1 print:text-gray-600">REF: #{booking.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                         <div className="relative w-24 h-8">
                            <Image src="/logo.svg" alt="Logo" fill className="object-contain brightness-0 invert print:invert-0" />
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Primary Info Grid */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pickup Information</p>
                                <div className="space-y-2">
                                    <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                        <Calendar className="w-4 h-4 text-slate-400" /> {booking.trip_end_date && booking.trip_end_date !== booking.pickup_date ? `${booking.pickup_date} → ${booking.trip_end_date}` : booking.pickup_date}
                                    </p>
                                    <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                        <Clock className="w-4 h-4 text-slate-400" /> {formatTime12h(booking.pickup_time)}
                                    </p>
                                    {booking.flight_number && (
                                        <p className="flex items-center gap-2 text-sm font-bold text-blue-600">
                                            <AlertCircle className="w-4 h-4" /> Flight: {booking.flight_number}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vehicle Assignment</p>
                                <div className="space-y-2">
                                    <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                        <Car className="w-4 h-4 text-slate-400" /> {booking.actual_vehicle || booking.vehicle_type}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">Standard Class: {booking.vehicle_type}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Details</p>
                                <div className="space-y-2">
                                    <p className="flex items-center gap-2 text-base font-black text-slate-900">
                                        <User className="w-4 h-4 text-slate-400" /> {booking.customer_name}
                                    </p>
                                    <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <Phone className="w-4 h-4 text-slate-400" /> {booking.customer_phone}
                                    </p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                        {booking.passengers} Pax | {booking.luggage} Bags
                                    </p>
                                </div>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Driver Assigned To</p>
                                <p className="text-lg font-black text-slate-900 uppercase">
                                    {booking.driver_name || "__________________"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Route Section */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Trip Route</p>
                        <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 before:border-l before:border-dashed before:border-slate-300">
                            <div className="relative">
                                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm ring-2 ring-emerald-500/20"></div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Pickup Location</p>
                                <p className="text-sm font-bold text-slate-900">{booking.pickup_location}</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white shadow-sm ring-2 ring-rose-500/20"></div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Final Destination</p>
                                <p className="text-sm font-bold text-slate-900">{booking.destination}</p>
                            </div>
                        </div>
                    </div>

                    {/* Instruction Checklist */}
                    <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Driver Instructions</p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                                    <div className="w-4 h-4 border border-slate-300 rounded mt-0.5" />
                                    Arrive 15 minutes before pickup time.
                                </li>
                                <li className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                                    <div className="w-4 h-4 border border-slate-300 rounded mt-0.5" />
                                    Vehicle must be clean (interior & exterior).
                                </li>
                                <li className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                                    <div className="w-4 h-4 border border-slate-300 rounded mt-0.5" />
                                    Assist passenger with luggage.
                                </li>
                                <li className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                                    <div className="w-4 h-4 border border-slate-300 rounded mt-0.5" />
                                    Water and tissues available for client.
                                </li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Special Requirements</p>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 min-h-[100px]">
                                <p className="text-sm text-slate-700 italic font-medium leading-relaxed">
                                    {booking.special_requests || "No special requests mentioned for this trip."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Completion Sign-off */}
                    <div className="grid grid-cols-3 gap-8 border-t border-slate-200 pt-12 pb-4">
                        <div className="text-center space-y-2">
                            <div className="h-12 border-b border-slate-300 mx-auto w-4/5 pt-8"></div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Driver Signature</p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="h-12 border-b border-slate-300 mx-auto w-4/5 pt-8"></div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Client Signature</p>
                        </div>
                        <div className="text-center space-y-2">
                             <div className="flex gap-4 items-center justify-center h-12">
                                <div className="h-full relative w-16">
                                    <Image src="/zumer-signature.png" alt="Zumer" fill className="object-contain grayscale" />
                                </div>
                                <div className="h-full relative w-16">
                                    <Image src="/ismail-signature.png" alt="Ismail" fill className="object-contain grayscale" />
                                </div>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Partner Approvals</p>
                        </div>
                    </div>
                </div>

                {/* Footer Bar */}
                <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] print:bg-white print:border-t-2">
                    <p>© TAXI SERVICE KSA OPERATIONS</p>
                    <p>OFFICIAL DOCUMENT — S-TRN-HDO</p>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 15mm; size: A4; }
                    body { background: white !important; margin: 0 !important; font-size: 12pt; }
                    .print\\:hidden { display: none !important; }
                    main { margin: 0 !important; padding: 0 !important; }
                    .md\\:ml-64, header, nav, aside { display: none !important; }
                }
            `}</style>
        </div>
    );
}
