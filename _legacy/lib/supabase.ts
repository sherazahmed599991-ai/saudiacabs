import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton pattern to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'sb-fdojxnluwuzsqeejslzo-auth-token',
      },
    })
  }
  return supabaseInstance
})()

export type BookingData = {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    pickup_location: string;
    destination: string;
    pickup_date: string;
    pickup_time: string;
    vehicle_type: string;
    vehicle_image?: string;
    passengers: number;
    luggage: number;
    special_requests?: string;
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    has_return_trip?: boolean;
    return_date?: string | null;
    return_time?: string | null;
    return_pickup_location?: string | null;
    return_destination?: string | null;
    child_seats?: number;
    flight_number?: string;
    trip_type?: 'point_to_point' | 'hourly';
    duration_hours?: number;
};

export const vehicles = [
    {
        name: "Mercedes S-Class",
        image: "/fleet/mercedes-s-class-vip-chauffeur-service-saudi.webp",
        passengers: 3,
        luggage: 2,
        description: "Ultimate luxury sedan for VIP executives and couples."
    },
    {
        name: "BMW 7 Series",
        image: "/fleet/bmw-7-series-luxury-chauffeur-saudi.webp",
        passengers: 3,
        luggage: 2,
        description: "Prestige and performance for high-end business travel."
    },
    {
        name: "Cadillac Escalade",
        image: "/fleet/cadillac-escalade-chauffeur-service-ksa.webp",
        passengers: 7,
        luggage: 4,
        description: "Commanding presence with spacious VIP seating."
    },
    {
        name: "GMC Yukon XL / Denali",
        image: "/fleet/gmc-yukon-xl-premium-chauffeur-saudi.webp",
        passengers: 7,
        luggage: 5,
        description: "The gold standard for family Umrah and group transfers."
    },
    {
        name: "Genesis G80 VIP",
        image: "/fleet/genesis-g80-luxury-transport-ksa.webp",
        passengers: 3,
        luggage: 2,
        description: "Modern elegance and comfort for professional city travel."
    },
    {
        name: "Mercedes Vito",
        image: "/fleet/mercedes-vito-vip-shuttle-service-ksa.webp",
        passengers: 7,
        luggage: 4,
        description: "Elite European shuttle for business groups and families."
    },
    {
        name: "Ford Taurus 2025",
        image: "/fleet/ford-taurus-executive-sedan-saudi-arabia.webp",
        passengers: 3,
        luggage: 2,
        description: "Standard executive sedan for reliable intercity trips."
    },
    {
        name: "Mercedes Sprinter",
        image: "/fleet/mercedes-sprinter-luxury-van-transfer-saudi.webp",
        passengers: 14,
        luggage: 4,
        description: "Corporate van for large groups and delegation transport."
    },
    {
        name: "Hyundai Staria VIP",
        image: "/hyundai-staria.webp",
        passengers: 7,
        luggage: 4,
        description: "Modern VIP van with futuristic design and extra space."
    },
    {
        name: "Toyota Hiace",
        image: "/toyota-hiace.webp",
        passengers: 11,
        luggage: 16,
        description: "The most popular choice for large family Umrah groups."
    },
    {
        name: "Toyota Coaster",
        image: "/toyota-coaster.webp",
        passengers: 17,
        luggage: 20,
        description: "Spacious bus for large delegations and group tours."
    },
    {
        name: "Toyota Camry",
        image: "/toyota-camry.webp",
        passengers: 4,
        luggage: 2,
        description: "Economical and reliable sedan for airport pickups."
    },
    {
        name: "Toyota Veloz 2024",
        image: "/fleet/toyota-veloz-2024-dammam-jubail-bahrain-chauffeur.webp",
        passengers: 7,
        luggage: 4,
        description: "New 2024 model MPV available in Dammam, Jubail, Al Khobar and Bahrain routes."
    },
    {
        name: "Toyota Fortuner",
        image: "/toyota-fortuner.webp",
        passengers: 7,
        luggage: 4,
        description: "Powerful 4x4 SUV perfect for family trips and rough terrain."
    },
    {
        name: "Hyundai Starex",
        image: "/hyundai-starex.webp",
        passengers: 7,
        luggage: 10,
        description: "Standard family van with generous luggage capacity."
    },
    {
        name: "Luxurious Bus",
        image: "/fleet/luxurious-bus.webp",
        passengers: 25,
        luggage: 30,
        description: "VIP Coach for major groups and spiritual delegations."
    }
];
