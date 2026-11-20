
export type VehicleType =
    | "Mercedes S-Class"
    | "BMW 7 Series"
    | "Cadillac Escalade"
    | "GMC Yukon XL / Denali"
    | "Genesis G80 VIP"
    | "Mercedes Vito"
    | "Ford Taurus 2025"
    | "Mercedes Sprinter"
    | "Hyundai Staria VIP"
    | "Toyota Hiace"
    | "Toyota Coaster"
    | "Toyota Camry"
    | "Hyundai Starex"
    | "Luxurious Bus";

export interface RoutePricing {
    [key: string]: { // key is vehicle name
        price: number;
    }
}

// Normalized Locations
export const LOCATIONS = ['Jeddah', 'Makkah', 'Madinah', 'Taif', 'Riyadh', 'Yanbu'];

export const PRICING_RULES: { [route: string]: RoutePricing } = {
    // Jeddah <-> Makkah
    'jeddah-makkah': {
        'Toyota Camry': { price: 300 },
        'GMC Yukon XL / Denali': { price: 600 },
        'Hyundai Staria VIP': { price: 350 },
        'Hyundai Starex': { price: 300 },
        'Toyota Hiace': { price: 450 },
        'Toyota Coaster': { price: 800 },
    },
    // Jeddah <-> Madinah
    'jeddah-madinah': {
        'Toyota Camry': { price: 600 },
        'GMC Yukon XL / Denali': { price: 1200 },
        'Hyundai Staria VIP': { price: 850 },
        'Hyundai Starex': { price: 750 },
        'Toyota Hiace': { price: 950 },
        'Toyota Coaster': { price: 1500 },
    },
    // Makkah <-> Madinah
    'makkah-madinah': {
        'Toyota Camry': { price: 550 },
        'GMC Yukon XL / Denali': { price: 1000 },
        'Hyundai Staria VIP': { price: 750 },
        'Hyundai Starex': { price: 650 },
        'Toyota Hiace': { price: 850 },
        'Toyota Coaster': { price: 1400 },
    },
    // Taif <-> Makkah
    'makkah-taif': {
        'Toyota Camry': { price: 350 },
        'GMC Yukon XL / Denali': { price: 700 },
        'Hyundai Staria VIP': { price: 500 },
        'Hyundai Starex': { price: 450 },
        'Toyota Hiace': { price: 600 },
        'Toyota Coaster': { price: 1000 },
    },
};

export function normalizeLocation(loc: string): string | null {
    if (!loc) return null;
    const lower = loc.toLowerCase();
    for (const city of LOCATIONS) {
        if (lower.includes(city.toLowerCase())) {
            return city;
        }
    }
    return null;
}

export function getPrice(from: string, to: string, vehicle: string, isRoundTrip: boolean = false): number | null {
    const loc1 = normalizeLocation(from);
    const loc2 = normalizeLocation(to);

    if (!loc1 || !loc2 || !vehicle) return null;

    // Create route key (alphabetical order to handle bidirectional)
    const routeKey = [loc1.toLowerCase(), loc2.toLowerCase()].sort().join('-');
    const routeKeyDirect = `${loc1.toLowerCase()}-${loc2.toLowerCase()}`;

    // Check rules
    const rules = PRICING_RULES[routeKey] || PRICING_RULES[routeKeyDirect];

    if (rules) {
        // Find vehicle with flexible matching
        const vehicleKey = Object.keys(rules).find(key => 
            key.toLowerCase().includes(vehicle.toLowerCase()) || 
            vehicle.toLowerCase().includes(key.toLowerCase())
        );

        if (vehicleKey && rules[vehicleKey]) {
            let basePrice = rules[vehicleKey].price;
            return isRoundTrip ? basePrice * 2 : basePrice;
        }
    }

    return null;
}
