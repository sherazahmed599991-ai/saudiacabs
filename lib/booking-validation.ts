import { z } from 'zod';

/**
 * Single source of truth for booking validation — used by every booking form
 * (public multi-step form, homepage hero widgets, admin create/edit) AND by
 * the API routes that persist bookings. There must never be a second copy of
 * these rules anywhere else in the codebase.
 *
 * Date/time comparisons are ALWAYS done as plain string comparisons on
 * 'yyyy-MM-dd' / 'HH:mm[:ss]' values — never via `new Date(dateString)`
 * diffing. Constructing `new Date('2026-08-15')` parses as UTC midnight,
 * while calendar UI libraries (react-day-picker) build day cells at LOCAL
 * midnight — in Saudi Arabia (UTC+3) that mismatch silently disabled the
 * pickup day itself in a round-trip return-date picker. yyyy-MM-dd and
 * zero-padded HH:mm[:ss] are lexicographically ordered, so string comparison
 * is both correct and immune to that whole bug class.
 */

// ---------------------------------------------------------------------------
// String-based date/time helpers
// ---------------------------------------------------------------------------

export function isDateBefore(a: string, b: string): boolean {
    return a < b;
}

export function isSameDate(a: string, b: string): boolean {
    return a === b;
}

function normalizeTime(t: string): string {
    const [h = '00', m = '00', s = '00'] = t.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`;
}

/** Tolerant of 'HH:mm' (native <input type="time">) and 'HH:mm:ss' (Postgres TIME). */
export function compareTimes(a: string, b: string): number {
    const na = normalizeTime(a);
    const nb = normalizeTime(b);
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
}

// ---------------------------------------------------------------------------
// Round-trip validation
// ---------------------------------------------------------------------------

export interface RoundTripInput {
    pickup_date?: string | null;
    pickup_time?: string | null;
    has_return_trip?: boolean | null;
    return_date?: string | null;
    return_time?: string | null;
    return_pickup_location?: string | null;
    return_destination?: string | null;
}

export interface ValidationResult {
    valid: boolean;
    fieldErrors: Record<string, string>;
}

/**
 * Rules:
 * - Not a round trip -> always valid, nothing to check.
 * - Round trip requires a return date, a return time, AND its own return
 *   pickup + drop-off locations — the return leg is never assumed to be the
 *   outbound route reversed at the validation level (see getReturnRoute()
 *   for the display-only fallback used on legacy bookings that predate
 *   these fields).
 * - Return date may never be before the pickup date.
 * - Same-day round trip: return time must be strictly after pickup time.
 * - Multi-day round trip (return date after pickup date): any return time is valid.
 */
export function validateRoundTrip(input: RoundTripInput): ValidationResult {
    const fieldErrors: Record<string, string> = {};

    if (!input.has_return_trip) {
        return { valid: true, fieldErrors };
    }

    if (!input.return_date) {
        fieldErrors.return_date = 'Please select a return date.';
    }
    if (!input.return_time) {
        fieldErrors.return_time = 'Please select a return time.';
    }
    if (!input.return_pickup_location || !input.return_pickup_location.trim()) {
        fieldErrors.return_pickup_location = 'Please enter the return pickup location.';
    }
    if (!input.return_destination || !input.return_destination.trim()) {
        fieldErrors.return_destination = 'Please enter the return drop-off location.';
    }

    if (input.return_date && input.pickup_date && isDateBefore(input.return_date, input.pickup_date)) {
        fieldErrors.return_date = 'Return date cannot be before the pickup date.';
    }

    if (
        !fieldErrors.return_date &&
        input.return_date &&
        input.return_time &&
        input.pickup_date &&
        input.pickup_time &&
        isSameDate(input.return_date, input.pickup_date) &&
        compareTimes(input.return_time, input.pickup_time) <= 0
    ) {
        fieldErrors.return_time = 'Return time must be after the pickup time for a same-day round trip.';
    }

    return { valid: Object.keys(fieldErrors).length === 0, fieldErrors };
}

// ---------------------------------------------------------------------------
// Full booking-form validation (contact + trip + round-trip)
// ---------------------------------------------------------------------------

export interface BookingFormInput extends RoundTripInput {
    customer_name?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
    pickup_location?: string | null;
    destination?: string | null;
    trip_type?: 'point_to_point' | 'hourly' | null;
    duration_hours?: number | null;
    vehicle_type?: string | null;
    passengers?: number | null;
    luggage?: number | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateBookingForm(input: BookingFormInput): ValidationResult {
    const fieldErrors: Record<string, string> = {};

    if (!input.customer_name || !input.customer_name.trim()) {
        fieldErrors.customer_name = 'Please enter your full name.';
    }
    if (!input.customer_email || !EMAIL_RE.test(input.customer_email)) {
        fieldErrors.customer_email = 'Please enter a valid email address.';
    }
    if (!input.customer_phone || input.customer_phone.replace(/\D/g, '').length < 6) {
        fieldErrors.customer_phone = 'Please enter a valid phone number.';
    }
    if (!input.pickup_location || !input.pickup_location.trim()) {
        fieldErrors.pickup_location = 'Pickup location is required.';
    }
    if (!input.pickup_date) {
        fieldErrors.pickup_date = 'Pickup date is required.';
    }
    if (!input.pickup_time) {
        fieldErrors.pickup_time = 'Pickup time is required.';
    }
    if (!input.vehicle_type || !input.vehicle_type.trim()) {
        fieldErrors.vehicle_type = 'Please select a vehicle.';
    }

    if (input.trip_type === 'hourly') {
        if (!input.duration_hours || input.duration_hours <= 0) {
            fieldErrors.duration_hours = 'Please enter the hire duration in hours.';
        }
    } else if (!input.destination || !input.destination.trim()) {
        fieldErrors.destination = 'Destination is required.';
    }

    if (input.passengers != null && input.passengers < 1) {
        fieldErrors.passengers = 'At least 1 passenger is required.';
    }
    if (input.luggage != null && input.luggage < 0) {
        fieldErrors.luggage = 'Luggage count cannot be negative.';
    }

    const roundTrip = validateRoundTrip(input);
    Object.assign(fieldErrors, roundTrip.fieldErrors);

    return { valid: Object.keys(fieldErrors).length === 0, fieldErrors };
}

// ---------------------------------------------------------------------------
// Backward-compatibility choke point
// ---------------------------------------------------------------------------

/**
 * True only when a booking has BOTH the round-trip flag AND a structured
 * return_date on record. Every document/admin/customer view that wants to
 * render an outbound/return split must gate on this — bookings created
 * before the return_date/return_time columns existed will have
 * has_return_trip = true but return_date = null, and must fall back to a
 * plain one-way-shaped view (or a generic "round trip, details not
 * recorded" note) instead of crashing or fabricating a date.
 */
export function hasStructuredReturnLeg(booking?: {
    has_return_trip?: boolean | null;
    return_date?: string | null;
} | null): boolean {
    return Boolean(booking?.has_return_trip && booking?.return_date);
}

/**
 * Resolves the return leg's actual pickup/drop-off. Prefers the explicitly
 * recorded return_pickup_location/return_destination; falls back to the
 * outbound route reversed for bookings that predate these columns (or where
 * an admin left them blank) — every document/admin/customer view that shows
 * a return route must go through this instead of hand-rolling the same
 * "assume it's reversed" fallback independently.
 */
export function getReturnRoute(booking?: {
    pickup_location?: string | null;
    destination?: string | null;
    return_pickup_location?: string | null;
    return_destination?: string | null;
} | null): { pickupLocation: string; destination: string } {
    return {
        pickupLocation: booking?.return_pickup_location?.trim() || booking?.destination || '',
        destination: booking?.return_destination?.trim() || booking?.pickup_location || '',
    };
}

// ---------------------------------------------------------------------------
// Zod schema — the API layer's source of truth. Calls validateRoundTrip
// internally via superRefine so there is exactly one implementation of the
// round-trip rules, not a second hand-encoded copy.
// ---------------------------------------------------------------------------

const bookingFieldsShape = {
        pickup_location: z.string().min(1, 'Pickup location is required.'),
        destination: z.string().optional().nullable(),
        pickup_date: z.string().min(1, 'Pickup date is required.'),
        pickup_time: z.string().min(1, 'Pickup time is required.'),
        trip_type: z.enum(['point_to_point', 'hourly']).optional().nullable(),
        duration_hours: z.number().positive().optional().nullable(),
        vehicle_type: z.string().min(1, 'Please select a vehicle.'),
        vehicle_image: z.string().optional().nullable(),
        passengers: z.number().int().min(1, 'At least 1 passenger is required.'),
        luggage: z.number().int().min(0, 'Luggage count cannot be negative.'),
        has_return_trip: z.boolean().optional(),
        return_date: z.string().nullable().optional(),
        return_time: z.string().nullable().optional(),
        return_pickup_location: z.string().nullable().optional(),
        return_destination: z.string().nullable().optional(),
        special_requests: z.string().optional().nullable(),
        // Matches the full admin lifecycle (app/(main)/admin/bookings/page.tsx's
        // Booking['status']) — narrower enums here would silently strip
        // 'quote_sent'/'in_progress' bookings when routed through this schema.
        status: z.enum(['pending', 'quote_sent', 'confirmed', 'in_progress', 'cancelled', 'completed']).optional(),
        child_seats: z.number().int().min(0).optional().nullable(),
        flight_number: z.string().optional().nullable(),
        total_price: z.union([z.number(), z.string()]).optional().nullable(),
        deposit_amount: z.union([z.number(), z.string()]).optional().nullable(),
        currency: z.string().optional().nullable(),
        payment_method: z.string().optional().nullable(),
        payment_status: z.string().optional().nullable(),
        driver_name: z.string().optional().nullable(),
        driver_phone: z.string().optional().nullable(),
        driver_plate: z.string().optional().nullable(),
        driver_arrived_at: z.string().optional().nullable(),
        trip_started_at: z.string().optional().nullable(),
        actual_vehicle: z.string().optional().nullable(),
        // Comma-separated string in the admin UI ("VIP, Priority"), not an array.
        tags: z.string().optional().nullable(),
        internal_notes: z.string().optional().nullable(),
        trip_end_date: z.string().optional().nullable(),
        distance_km: z.union([z.number(), z.string()]).optional().nullable(),
        duration_estimate: z.string().optional().nullable(),
        commission_rate: z.union([z.number(), z.string()]).optional().nullable(),
        contract_id: z.string().optional().nullable(),
        // Extra pickup/drop-off legs beyond the primary pickup_location/
        // destination and the single return leg — for multi-day/multi-stop
        // bookings (e.g. an event or retreat with several trips over several
        // dates). Each leg is independent; there is no ordering guarantee
        // beyond array order.
        itinerary_legs: z.array(z.object({
            date: z.string(),
            time: z.string(),
            pickup: z.string(),
            dropoff: z.string(),
        })).optional().nullable(),
        // Named intermediate waypoints for a single-trip booking (e.g.
        // Ziyarat sites: "Masjid Quba", "Jabal Uhud") — distinct from
        // itinerary_legs, which models separate date+time+pickup+dropoff
        // transport legs for multi-day bookings, not a list of named stops
        // visited during one outing.
        additional_stops: z.array(z.object({
            time: z.string().optional().nullable(),
            location: z.string(),
        })).optional().nullable(),
};

/** Shared by both schemas below so round-trip/trip-type rules can never drift
 *  between the public and admin validation paths — there is exactly one
 *  implementation, referenced twice. */
function refineTripRules(data: RoundTripInput & { trip_type?: string | null; duration_hours?: number | null; destination?: string | null }, ctx: z.RefinementCtx) {
    if (data.trip_type === 'hourly') {
        if (!data.duration_hours || data.duration_hours <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['duration_hours'],
                message: 'Please enter the hire duration in hours.',
            });
        }
    } else if (!data.destination || !data.destination.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['destination'],
            message: 'Destination is required.',
        });
    }

    const { valid, fieldErrors } = validateRoundTrip(data);
    if (!valid) {
        for (const [field, message] of Object.entries(fieldErrors)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
        }
    }
}

// Public-facing schema — used by POST /api/booking/create for unauthenticated
// (customer) requests. Contact fields are strictly required since this is
// the customer's only channel for us to reach them.
export const bookingSchema = z
    .object({
        customer_name: z.string().min(2, 'Please enter your full name.'),
        customer_email: z.string().email('Please enter a valid email address.'),
        customer_phone: z.string().min(6, 'Please enter a valid phone number.'),
        ...bookingFieldsShape,
    })
    .superRefine(refineTripRules);

export type BookingSchemaInput = z.infer<typeof bookingSchema>;

// Admin schema — used by the authenticated admin create/edit routes. The
// admin panel's "quick create" form has always allowed saving a booking with
// contact details filled in later (walk-in/phone bookings), so contact
// fields are optional here (still validated for format when present) rather
// than required — everything else, including the round-trip rules, is
// identical to `bookingSchema` via the shared `refineTripRules`.
export const adminBookingSchema = z
    .object({
        customer_name: z.string().optional().nullable(),
        customer_email: z
            .string()
            .optional()
            .nullable()
            .refine((v) => !v || EMAIL_RE.test(v), { message: 'Please enter a valid email address.' }),
        customer_phone: z.string().optional().nullable(),
        ...bookingFieldsShape,
    })
    .superRefine(refineTripRules);

export type AdminBookingSchemaInput = z.infer<typeof adminBookingSchema>;

/** Flattens a caught ZodError into the same { field: message } shape used by
 *  validateBookingForm/validateRoundTrip, so client-side and server-side
 *  errors render identically. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.issues) {
        const field = String(issue.path[0] ?? 'form');
        if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
        }
    }
    return fieldErrors;
}
