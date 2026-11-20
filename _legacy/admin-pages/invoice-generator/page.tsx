'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
// html2pdf will be imported dynamically to avoid SSR issues

import { 
    Printer, 
    Plus, 
    Trash2, 
    Building, 
    User, 
    FileText, 
    Settings, 
    Layout, 
    RotateCcw,
    Share2,
    Copy,
    Phone,
    Mail,
    Globe,
    MapPin,
    Hash,
    Calendar,
    ChevronDown,
    Car
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
}

interface CompanyProfile {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logoUrl?: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    iban?: string;
    swiftCode?: string;
}

const DEFAULT_PROFILES: Record<string, CompanyProfile> = {
    'taxi-ksa': {
        name: 'Taxi Service KSA',
        address: 'Jeddah, Saudi Arabia',
        phone: 'taxiserviceksa9988@gmail.com',
        email: 'taxiserviceksa9988@gmail.com',
        website: 'www.taxiserviceksa.com',
        logoUrl: '/logo.svg',
        bankName: 'Al Rajhi Bank',
        accountName: 'Taxi Service KSA LLC',
        accountNumber: '123456789012345',
        iban: 'SA8280000000123456789012',
        swiftCode: 'RAJHSARIXXX'
    },
    'airport-travel': {
        name: 'Airport Travel Taxis',
        address: 'Heathrow Airport, London, UK',
        phone: '+44 20 8123 4567',
        email: 'booking@airporttraveltaxis.com',
        website: 'www.airporttraveltaxis.com',
        bankName: 'Barclays Bank',
        accountName: 'Airport Travel Taxis Ltd',
        accountNumber: '98765432',
        iban: 'GB29BARC20123498765432',
        swiftCode: 'BARCGB22XXX'
    },
    'car-ride-arabia': {
        name: 'Car Ride Arabia',
        address: 'Dubai, UAE',
        phone: '+971 4 123 4567',
        email: 'info@carridearabia.com',
        website: 'www.carridearabia.com',
        bankName: 'Emirates NBD',
        accountName: 'Car Ride Arabia FZ-LLC',
        accountNumber: '1012345678901',
        iban: 'AE1200300001012345678901',
        swiftCode: 'EIBNDAEADXXX'
    }
};

const PRESET_VEHICLES = [
    'Camry',
    'GMC Yukon',
    'Hyundai Staria',
    'Hiace',
    'Fortuner'
];


export default function UniversalInvoiceGenerator() {
    const router = useRouter();
    const [mode, setMode] = useState<'invoice' | 'letterhead'>('invoice');
    const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILES['taxi-ksa']);
    const [recipient, setRecipient] = useState({
        name: '',
        details: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) router.push('/admin/login');
        });
    }, [router]);

    const [vehicle, setVehicle] = useState({
        name: 'Toyota Camry',
        showOnDocument: true
    });

    const [bankDetails, setBankDetails] = useState({
        showOnDocument: false,
        bankName: DEFAULT_PROFILES['taxi-ksa'].bankName || '',
        accountName: DEFAULT_PROFILES['taxi-ksa'].accountName || '',
        accountNumber: DEFAULT_PROFILES['taxi-ksa'].accountNumber || '',
        iban: DEFAULT_PROFILES['taxi-ksa'].iban || '',
        swiftCode: DEFAULT_PROFILES['taxi-ksa'].swiftCode || '',
        notes: 'Please send transaction screenshot on WhatsApp once completed.'
    });


    const [isMounted, setIsMounted] = useState(false);
    const [meta, setMeta] = useState({
        number: '',
        date: '',
        currency: 'SAR',
        taxRate: 0,
        status: 'Unpaid',
        paymentMethod: 'Cash to Driver',
        subject: 'Official Confirmation of Transport Services',
        letterBody: 'Dear Client,\n\nWe are pleased to confirm your upcoming transport arrangements. Our professional chauffeur will be prepared at your designated location. \n\nPlease ensure your booking details are correct. Thank you for choosing our services.',
        notes: 'Terms & Conditions:\n• Price includes fuel and toll fees.\n• Cancellation is free up to 24 hours before pickup.',
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: 'Airport Transfer Service', quantity: 1, price: 350 }
    ]);

    useEffect(() => {
        setIsMounted(true);
        setMeta(prev => ({
            ...prev,
            number: 'INV-' + Math.floor(Math.random() * 90000 + 10000),
            date: new Date().toISOString().split('T')[0],
        }));
    }, []);

    if (!isMounted) return null;

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const taxAmount = (subtotal * meta.taxRate) / 100;
    const total = subtotal + taxAmount;

    return (
        <div className="max-w-[1400px] mx-auto min-h-screen bg-gray-50 pb-20">
            {/* Simple Top Bar */}
            <div className="sticky top-0 z-30 flex flex-col md:flex-row justify-between items-center gap-4 bg-white border-b px-6 py-4 print:hidden">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Generator</h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-lg mr-4">
                        <button 
                            onClick={() => setMode('invoice')}
                            className={cn(
                                "px-4 py-1 rounded text-xs font-semibold transition-all",
                                mode === 'invoice' ? "bg-white shadow text-gray-900" : "text-gray-500"
                            )}
                        >
                            Invoice
                        </button>
                        <button 
                            onClick={() => setMode('letterhead')}
                            className={cn(
                                "px-4 py-1 rounded text-xs font-semibold transition-all",
                                mode === 'letterhead' ? "bg-white shadow text-gray-900" : "text-gray-500"
                            )}
                        >
                            Letterhead
                        </button>
                    </div>

                    <Button variant="outline" size="sm" onClick={async () => {
                        const clientName = recipient.name ? recipient.name.replace(/\s+/g, '-') : 'Client';
                        const refId = meta.number || 'DRAFT';
                        const dateStr = meta.date || new Date().toISOString().split('T')[0];
                        const filename = `${mode === 'invoice' ? 'Invoice' : 'Letter'}-${refId}-${clientName}-${dateStr}.pdf`;
                        
                        const element = document.getElementById('printable-area');
                        if (!element) return;

                        const opt = {
                            margin: [0, 0, 0, 0] as [number, number, number, number],
                            filename: filename,
                            image: { type: 'jpeg' as const, quality: 0.98 },
                            html2canvas: { 
                                scale: 2, 
                                useCORS: true, 
                                letterRendering: true,
                                windowWidth: 1200,
                                scrollY: 0,
                                scrollX: 0
                            },
                            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
                        };

                        try {
                            // @ts-ignore - dynamic import to avoid SSR 'self is not defined'
                            const html2pdf = (await import('html2pdf.js')).default;
                            await html2pdf().set(opt).from(element).save();
                        } catch (error) {
                            console.error('PDF Generation Error:', error);
                            window.print();
                        }
                    }} className="font-bold border-gray-300">
                        <Printer className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                        const subject = `${mode.toUpperCase()} from ${profile.name}`;
                        const body = `${mode.toUpperCase()} \nFrom: ${profile.name}\nTo: ${recipient.name}\nTotal: ${meta.currency} ${total.toFixed(2)}`;
                        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    }} className="font-bold border-gray-300">
                        <Mail className="w-4 h-4 mr-2" /> Email Info
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 p-6 lg:p-10">
                
                {/* Editor Panel */}
                <div className="w-full lg:w-[400px] space-y-6 print:hidden">
                    
                    {/* Brand */}
                    <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Business Profile</Label>
                        <Select 
                            onValueChange={(val) => {
                                const selected = DEFAULT_PROFILES[val];
                                setProfile({...selected});
                                setBankDetails(prev => ({
                                    ...prev,
                                    bankName: selected.bankName || '',
                                    accountName: selected.accountName || '',
                                    accountNumber: selected.accountNumber || '',
                                    iban: selected.iban || '',
                                    swiftCode: selected.swiftCode || '',
                                }));
                            }} 
                            defaultValue="taxi-ksa"
                        >
                            <SelectTrigger className="font-semibold text-gray-900 rounded-lg">
                                <SelectValue placeholder="Select Business" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {Object.entries(DEFAULT_PROFILES).map(([key, p]) => (
                                    <SelectItem key={key} value={key} className="font-semibold">{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="space-y-3 pt-2 border-t">
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Company Name</Label>
                                <Input placeholder="Company Name" className="h-9 text-sm font-semibold" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Address</Label>
                                <Input placeholder="Address" className="h-9 text-sm" value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Contact Email</Label>
                                <Input placeholder="Contact Email" className="h-9 text-sm" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Email</Label>
                                <Input placeholder="Email" className="h-9 text-sm" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Website</Label>
                                <Input placeholder="Website" className="h-9 text-sm" value={profile.website} onChange={(e) => setProfile({...profile, website: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    {/* Client */}
                    <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest block font-sans">Client Details</Label>
                        <div className="space-y-3 font-sans">
                            <Input placeholder="Client Name" className="font-semibold" value={recipient.name} onChange={(e) => setRecipient({...recipient, name: e.target.value})} />
                            <Textarea placeholder="Client Address / Info" className="text-sm min-h-[80px]" value={recipient.details} onChange={(e) => setRecipient({...recipient, details: e.target.value})} />
                        </div>
                    </div>

                    {/* Content */}
                    {mode === 'invoice' ? (
                        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Items</Label>
                                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50 text-xs px-2 h-7" onClick={addItem}>
                                    <Plus className="w-3 h-3 mr-1" /> Add Row
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div key={item.id} className="space-y-2 border-b pb-3 last:border-0">
                                        <div className="flex gap-2">
                                            <Input placeholder="Description" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="h-8 text-sm" />
                                            <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)} className="h-8 w-8 text-gray-300 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-1/3">
                                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Qty</Label>
                                                <Input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))} className="h-8 text-xs text-center" />
                                            </div>
                                            <div className="flex-1">
                                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Price</Label>
                                                <Input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))} className="h-8 text-xs text-right" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                <div>
                                    <Label className="text-[10px] text-gray-400 uppercase ml-1">Currency</Label>
                                    <Input 
                                        value={meta.currency} 
                                        onChange={(e) => setMeta({...meta, currency: e.target.value.toUpperCase()})}
                                        className="h-8 font-bold text-xs w-full mb-1.5"
                                        placeholder="e.g. SAR"
                                    />
                                    <div className="flex gap-1 flex-wrap">
                                        {['SAR', 'KWD', 'BHD', 'OMR', 'AED', 'USD'].map(c => (
                                            <span 
                                                key={c}
                                                onClick={() => setMeta({...meta, currency: c})}
                                                className="text-[9px] px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded cursor-pointer font-bold"
                                            >
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase">Subtotal</p>
                                    <p className="font-bold text-gray-900">{meta.currency} {subtotal.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4 font-sans">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest block font-sans">Letter Content</Label>
                            <Input placeholder="Subject" value={meta.subject} onChange={(e) => setMeta({...meta, subject: e.target.value})} className="font-semibold text-sm h-10" />
                            <Textarea placeholder="Message..." className="text-sm min-h-[200px]" value={meta.letterBody} onChange={(e) => setMeta({...meta, letterBody: e.target.value})} />
                        </div>
                    )}

                    {/* Vehicle */}
                    <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest block font-sans">Vehicle Details</Label>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={vehicle.showOnDocument} 
                                    onChange={(e) => setVehicle({...vehicle, showOnDocument: e.target.checked})} 
                                />
                                SHOW ON DOC
                            </label>
                        </div>
                        <div className="space-y-3 font-sans">
                            <Input 
                                placeholder="Type Vehicle Name (e.g. Camry, GMC Yukon)" 
                                value={vehicle.name} 
                                onChange={(e) => setVehicle({...vehicle, name: e.target.value})}
                                className="font-semibold text-gray-900 h-10"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {PRESET_VEHICLES.map((v) => (
                                    <span 
                                        key={v} 
                                        onClick={() => setVehicle({...vehicle, name: v})}
                                        className="text-[10px] px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded cursor-pointer font-semibold transition-colors"
                                    >
                                        {v}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest block font-sans">Bank Details</Label>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={bankDetails.showOnDocument} 
                                    onChange={(e) => setBankDetails({...bankDetails, showOnDocument: e.target.checked})} 
                                    className="accent-blue-600 rounded animate-pulse"
                                />
                                SHOW ON DOC
                            </label>
                        </div>
                        <div className="space-y-3 font-sans">
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Bank Name</Label>
                                <Input 
                                    placeholder="e.g. Al Rajhi Bank, SNB, Riyadh Bank" 
                                    value={bankDetails.bankName} 
                                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})} 
                                    className="h-9 text-xs font-semibold focus-visible:ring-blue-500" 
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Account Holder Name</Label>
                                <Input 
                                    placeholder="e.g. Taxi Service KSA" 
                                    value={bankDetails.accountName} 
                                    onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})} 
                                    className="h-9 text-xs font-semibold focus-visible:ring-blue-500" 
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Account Number</Label>
                                <Input 
                                    placeholder="e.g. 123456789012345" 
                                    value={bankDetails.accountNumber} 
                                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})} 
                                    className="h-9 text-xs font-semibold focus-visible:ring-blue-500" 
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">IBAN</Label>
                                <Input 
                                    placeholder="e.g. SA8280000000123456789012" 
                                    value={bankDetails.iban} 
                                    onChange={(e) => setBankDetails({...bankDetails, iban: e.target.value})} 
                                    className="h-9 text-xs font-semibold tracking-wider focus-visible:ring-blue-500" 
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">SWIFT / BIC (Optional)</Label>
                                <Input 
                                    placeholder="e.g. RAJHSARIXXX" 
                                    value={bankDetails.swiftCode} 
                                    onChange={(e) => setBankDetails({...bankDetails, swiftCode: e.target.value})} 
                                    className="h-9 text-xs font-semibold focus-visible:ring-blue-500" 
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Transfer Instructions</Label>
                                <Input 
                                    placeholder="e.g. Send receipt on WhatsApp" 
                                    value={bankDetails.notes} 
                                    onChange={(e) => setBankDetails({...bankDetails, notes: e.target.value})} 
                                    className="h-9 text-xs italic text-gray-500 focus-visible:ring-blue-500" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest block font-sans">Payment Details</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Status</Label>
                                <Input 
                                    value={meta.status} 
                                    onChange={(e) => setMeta({...meta, status: e.target.value})} 
                                    className="h-9 text-xs font-semibold" 
                                    placeholder="e.g. Paid, Unpaid"
                                />
                                <div className="flex gap-1 mt-1.5 text-[9px] flex-wrap">
                                    <span onClick={()=>setMeta({...meta, status: 'Paid'})} className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded cursor-pointer hover:bg-green-100 font-bold uppercase tracking-wider">Paid</span>
                                    <span onClick={()=>setMeta({...meta, status: 'Unpaid'})} className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded cursor-pointer hover:bg-red-100 font-bold uppercase tracking-wider">Unpaid</span>
                                    <span onClick={()=>setMeta({...meta, status: 'Pending'})} className="px-1.5 py-0.5 bg-yellow-50 text-yellow-600 rounded cursor-pointer hover:bg-yellow-100 font-bold uppercase tracking-wider">Pending</span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Method</Label>
                                <Input 
                                    value={meta.paymentMethod} 
                                    onChange={(e) => setMeta({...meta, paymentMethod: e.target.value})} 
                                    className="h-9 text-xs font-semibold" 
                                    placeholder="e.g. Cash, Card"
                                />
                                <div className="flex gap-1 mt-1.5 flex-wrap text-[9px]">
                                    <span onClick={()=>setMeta({...meta, paymentMethod: 'Cash to Driver'})} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded cursor-pointer hover:bg-gray-200 font-bold uppercase tracking-wider">Cash</span>
                                    <span onClick={()=>setMeta({...meta, paymentMethod: 'Online Payment'})} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded cursor-pointer hover:bg-gray-200 font-bold uppercase tracking-wider">Online</span>
                                    <span onClick={()=>{
                                        setMeta({...meta, paymentMethod: 'Bank Transfer'});
                                        setBankDetails(prev => ({...prev, showOnDocument: true}));
                                    }} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded cursor-pointer hover:bg-blue-100 font-bold uppercase tracking-wider">Bank Transfer</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Ref ID</Label>
                                <Input value={meta.number} onChange={(e) => setMeta({...meta, number: e.target.value})} className="h-9 text-xs" />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-400 uppercase ml-1">Date</Label>
                                <Input type="date" value={meta.date} onChange={(e) => setMeta({...meta, date: e.target.value})} className="h-9 text-xs" />
                            </div>
                        </div>
                        <div>
                            <Label className="text-[10px] text-gray-400 uppercase ml-1 block mt-2">Footer Notes</Label>
                            <Textarea value={meta.notes} onChange={(e) => setMeta({...meta, notes: e.target.value})} className="text-xs italic min-h-[60px]" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex justify-center">
                    <div id="printable-area" className="w-full max-w-[210mm] h-[296mm] overflow-hidden bg-white shadow-xl border border-gray-100 print:shadow-none print:border-none print:m-0">
                        <div className="h-full flex flex-col p-12 md:p-16 relative font-sans text-gray-900 justify-between overflow-hidden">
                            
                            {/* Company Header */}
                            <div className="flex justify-between items-start mb-12 border-b-2 border-gray-100 pb-8">
                                <div className="space-y-4">
                                    <div className="h-14 w-auto relative">
                                        {profile.logoUrl && <img src={profile.logoUrl} alt="Logo" className="h-full object-contain" />}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">{profile.name}</h2>
                                        <div className="text-[11px] text-gray-500 space-y-0.5 max-w-[250px] leading-tight font-medium">
                                            <p className="flex items-center gap-1.5"><MapPin className="w-2.5 h-2.5" /> {profile.address}</p>
                                            <p className="flex items-center gap-1.5"><Phone className="w-2.5 h-2.5" /> {profile.phone}</p>
                                            <p className="flex items-center gap-1.5"><Globe className="w-2.5 h-2.5" /> {profile.website}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <h1 className="text-3xl font-black text-gray-100 uppercase tracking-[0.2em] leading-none mb-4">{mode}</h1>
                                    <div className="flex gap-2 justify-end mb-4 antialiased">
                                        <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                            meta.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {meta.status}
                                        </div>
                                        <div className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest">
                                            {meta.paymentMethod}
                                        </div>
                                    </div>
                                    <div className="text-xs space-y-0.5 pt-2">
                                        <p className="font-bold text-gray-400 text-[10px] uppercase">Reference ID</p>
                                        <p className="font-bold text-gray-900 text-sm">#{meta.number}</p>
                                        <p className="font-bold text-gray-400 text-[10px] uppercase mt-4 block">Document Date</p>
                                        <p className="font-bold text-gray-900">{new Date(meta.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Details (shown if enabled) */}
                            {vehicle.showOnDocument && (
                                <div className="mb-8 flex items-center gap-4 bg-gray-50/50 border border-gray-100 p-4 rounded-lg">
                                    <div className="bg-white p-2.5 rounded-full shadow-sm">
                                        <Car className="w-5 h-5 text-gray-700" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confirmed Vehicle</p>
                                        <p className="font-bold text-gray-900">{vehicle.name || 'NOT SPECIFIED'}</p>
                                    </div>
                                </div>
                            )}

                            {/* Recipient */}
                            <div className="mb-12">
                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">Recipient Info</p>
                                <div className="bg-gray-50 border-l-2 border-gray-200 p-6 rounded-r-lg">
                                    <p className="font-bold text-lg text-gray-900">{recipient.name || 'CLIENT NAME'}</p>
                                    <pre className="text-xs font-semibold text-gray-500 leading-relaxed font-sans mt-2">
                                        {recipient.details || 'Recipient details not specified.'}
                                    </pre>
                                </div>
                            </div>

                            {/* Main Table or Body */}
                            {mode === 'invoice' ? (
                                <div className="flex-1">
                                    <div className="border rounded-lg overflow-hidden mb-10 shadow-sm border-gray-100">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                                                    <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest w-24">QTY</th>
                                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest w-40">Amount ({meta.currency})</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-[13px]">
                                                {items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-8 py-6 font-black text-gray-900 uppercase tracking-tight">{item.description || 'SERVICE DESCRIPTION'}</td>
                                                        <td className="px-8 py-6 text-center font-bold text-gray-500">{item.quantity}</td>
                                                        <td className="px-8 py-6 text-right font-black text-gray-900">{(item.quantity * item.price).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="bg-gray-50/50 border-t border-gray-100 p-6 flex flex-col items-end space-y-2">
                                            <div className="flex justify-between w-48 text-[10px] font-bold text-gray-400 uppercase">
                                                <span>Subtotal</span>
                                                <span className="text-gray-900">{subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between w-48 pt-4 items-center">
                                                <span className="text-xs font-bold text-gray-900 uppercase">Total Payable</span>
                                                <span className="text-2xl font-black text-gray-900 underline decoration-blue-500 underline-offset-8">
                                                    {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bank Transfer Details on Document */}
                                    {bankDetails.showOnDocument && (
                                        <div className="border border-blue-100 bg-blue-50/10 p-5 rounded-lg mb-6">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em] mb-3">Bank Transfer Details</p>
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                                                {bankDetails.bankName && (
                                                    <div className="flex justify-between border-b border-gray-100 pb-1.5">
                                                        <span className="text-[10px] text-gray-400 font-medium">Bank Name</span>
                                                        <span className="font-bold text-gray-900">{bankDetails.bankName}</span>
                                                    </div>
                                                )}
                                                {bankDetails.accountName && (
                                                    <div className="flex justify-between border-b border-gray-100 pb-1.5">
                                                        <span className="text-[10px] text-gray-400 font-medium">Account Name</span>
                                                        <span className="font-semibold text-gray-800">{bankDetails.accountName}</span>
                                                    </div>
                                                )}
                                                {bankDetails.accountNumber && (
                                                    <div className="flex justify-between border-b border-gray-100 pb-1.5">
                                                        <span className="text-[10px] text-gray-400 font-medium">Account No.</span>
                                                        <span className="font-semibold text-gray-800 break-all">{bankDetails.accountNumber}</span>
                                                    </div>
                                                )}
                                                {bankDetails.iban && (
                                                    <div className="flex justify-between border-b border-gray-100 pb-1.5 col-span-2">
                                                        <span className="text-[10px] text-gray-400 font-medium">IBAN</span>
                                                        <span className="font-bold text-blue-700 tracking-wider break-all">{bankDetails.iban}</span>
                                                    </div>
                                                )}
                                                {bankDetails.swiftCode && (
                                                    <div className="flex justify-between border-b border-gray-100 pb-1.5">
                                                        <span className="text-[10px] text-gray-400 font-medium">SWIFT / BIC</span>
                                                        <span className="font-semibold text-gray-800">{bankDetails.swiftCode}</span>
                                                    </div>
                                                )}
                                                {bankDetails.notes && (
                                                    <div className="col-span-2 text-[9px] text-gray-500 italic mt-1 leading-snug">
                                                        * {bankDetails.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 space-y-6">
                                    <h3 className="font-bold text-gray-900 uppercase text-sm border-b pb-2 inline-block">Sub: {meta.subject}</h3>
                                    <p className="text-sm font-semibold text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {meta.letterBody}
                                    </p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="mt-auto pt-10 border-t-2 border-gray-100 flex justify-between items-end gap-12">
                                <div className="max-w-md">
                                    <p className="text-[10px] font-black text-gray-300 uppercase mb-4 tracking-[0.2em]">Important Notes</p>
                                    {meta.paymentMethod === 'Cash to Driver' && (
                                        <p className="text-[10px] font-black text-gray-900 uppercase italic mb-2 tracking-tight">
                                            Hand over the payment to the driver upon journey completion.
                                        </p>
                                    )}
                                    <p className="text-xs font-semibold text-gray-500 italic leading-relaxed whitespace-pre-wrap opacity-80">
                                        {meta.notes}
                                    </p>
                                </div>
                                <div className="text-right min-w-[200px]">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Authorized Partners</p>
                                    <div className="flex items-end justify-end gap-6 h-12">
                                        <div className="text-center">
                                            <img src="/zumer-signature.png" alt="Zumer" className="h-full w-auto object-contain select-none" />
                                            <p className="text-[7px] font-bold text-gray-300 mt-1 uppercase italic tracking-widest">Zumer</p>
                                        </div>
                                        <div className="text-center">
                                            <img src="/ismail-signature.png" alt="Ismail" className="h-full w-auto object-contain select-none" />
                                            <p className="text-[7px] font-bold text-gray-300 mt-1 uppercase italic tracking-widest">Ismail</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            <style jsx global>{`
                @media print {
                    html, body { 
                        background: white !important; 
                        margin: 0 !important; 
                        padding: 0 !important;
                    }
                    #printable-area {
                        width: 210mm !important;
                        height: 296mm !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 auto !important;
                        position: relative !important;
                        page-break-after: avoid !important;
                        page-break-before: avoid !important;
                        page-break-inside: avoid !important;
                        overflow: hidden !important;
                    }
                    * {
                        page-break-inside: avoid !important;
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

