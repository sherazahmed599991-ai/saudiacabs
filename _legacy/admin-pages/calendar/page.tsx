'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Car, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Booking {
    id: string;
    pickup_date: string;
    pickup_time: string;
    customer_name: string;
    pickup_location: string;
    destination: string;
    vehicle_type: string;
    passengers: number;
    status: string;
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    confirmed: 'bg-green-100 text-green-800 border-green-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const STATUS_DOT: Record<string, string> = {
    pending: 'bg-amber-500',
    confirmed: 'bg-green-500',
    completed: 'bg-blue-500',
    cancelled: 'bg-red-400',
};

export default function AdminCalendarPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/admin/login');
            } else {
                fetchBookings();
            }
        };
        checkSession();
    }, [router]);

    const fetchBookings = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('id, pickup_date, pickup_time, customer_name, pickup_location, destination, vehicle_type, passengers, status')
                .order('pickup_date', { ascending: true });
            if (error) throw error;
            setBookings(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const today = new Date().toLocaleDateString('en-CA');

    const bookingsByDate: Record<string, Booking[]> = {};
    bookings.forEach(b => {
        if (!bookingsByDate[b.pickup_date]) bookingsByDate[b.pickup_date] = [];
        bookingsByDate[b.pickup_date].push(b);
    });

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    const dateKey = (d: number) => {
        const m = String(month + 1).padStart(2, '0');
        const day = String(d).padStart(2, '0');
        return `${year}-${m}-${day}`;
    };

    const selectedBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : [];

    const totalThisMonth = Object.entries(bookingsByDate)
        .filter(([d]) => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
        .reduce((sum, [, arr]) => sum + arr.length, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Booking Calendar</h1>
                    <p className="text-gray-500 text-sm mt-1">{totalThisMonth} booking{totalThisMonth !== 1 ? 's' : ''} this month</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={goToday} className="font-bold">Today</Button>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
                        <span className="text-sm font-black w-40 text-center">{monthName}</span>
                        <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-[11px] font-black text-gray-400 uppercase py-3 tracking-wider">{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7">
                        {/* Prev month filler */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`prev-${i}`} className="min-h-[80px] md:min-h-[100px] p-1 bg-gray-50/50 border-b border-r border-gray-100">
                                <span className="text-xs text-gray-300">{prevMonthDays - firstDay + i + 1}</span>
                            </div>
                        ))}

                        {/* Current month days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const key = dateKey(day);
                            const dayBookings = bookingsByDate[key] || [];
                            const isToday = key === today;
                            const isSelected = key === selectedDate;

                            return (
                                <div
                                    key={day}
                                    onClick={() => setSelectedDate(isSelected ? null : key)}
                                    className={`min-h-[80px] md:min-h-[100px] p-1.5 border-b border-r border-gray-100 cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border-primary/30' : 'hover:bg-gray-50'} ${isToday ? 'ring-2 ring-inset ring-primary/40' : ''}`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black mb-1 ${isToday ? 'bg-black text-primary' : 'text-gray-700'}`}>
                                        {day}
                                    </div>
                                    <div className="space-y-0.5">
                                        {dayBookings.slice(0, 3).map(b => (
                                            <div key={b.id} className={`text-[9px] font-bold px-1 py-0.5 rounded truncate border ${STATUS_COLORS[b.status] || STATUS_COLORS.pending}`}>
                                                {b.pickup_time} {b.customer_name.split(' ')[0]}
                                            </div>
                                        ))}
                                        {dayBookings.length > 3 && (
                                            <div className="text-[9px] text-gray-400 font-bold pl-1">+{dayBookings.length - 3} more</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Next month filler */}
                        {(() => {
                            const totalCells = firstDay + daysInMonth;
                            const remainder = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                            return Array.from({ length: remainder }).map((_, i) => (
                                <div key={`next-${i}`} className="min-h-[80px] md:min-h-[100px] p-1 bg-gray-50/50 border-b border-r border-gray-100">
                                    <span className="text-xs text-gray-300">{i + 1}</span>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                    {/* Legend */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Status Legend</p>
                        <div className="space-y-2">
                            {Object.entries(STATUS_DOT).map(([status, color]) => (
                                <div key={status} className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                                    <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected Date Bookings */}
                    {selectedDate ? (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-black px-4 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-primary font-black text-sm">
                                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-gray-400 text-xs">{selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''}</p>
                                </div>
                                <button onClick={() => setSelectedDate(null)} className="text-gray-500 hover:text-white text-lg leading-none">×</button>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                                {selectedBookings.length === 0 ? (
                                    <p className="p-4 text-sm text-gray-400 text-center">No bookings this day</p>
                                ) : (
                                    selectedBookings
                                        .sort((a, b) => a.pickup_time.localeCompare(b.pickup_time))
                                        .map(b => (
                                        <div key={b.id} className="p-3 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900">{b.customer_name}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {b.pickup_time}</p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[b.status] || STATUS_COLORS.pending}`}>
                                                    {b.status}
                                                </span>
                                            </div>
                                            <div className="space-y-1 text-xs text-gray-500">
                                                <div className="flex items-start gap-1"><MapPin className="w-3 h-3 shrink-0 mt-0.5 text-green-500" /><span className="truncate">{b.pickup_location}</span></div>
                                                <div className="flex items-start gap-1"><MapPin className="w-3 h-3 shrink-0 mt-0.5 text-red-500" /><span className="truncate">{b.destination}</span></div>
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1"><Car className="w-3 h-3" />{b.vehicle_type}</span>
                                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{b.passengers}</span>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/admin/bookings`}
                                                className="mt-2 text-[10px] text-primary font-bold flex items-center gap-1 hover:underline"
                                            >
                                                <ExternalLink className="w-3 h-3" /> View in Bookings
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Click a date to see bookings</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
