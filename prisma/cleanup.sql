-- Cleanup script for fast database reset
TRUNCATE TABLE "booked_tickets" CASCADE;
TRUNCATE TABLE "bookings" CASCADE;
TRUNCATE TABLE "event_faqs" CASCADE;
TRUNCATE TABLE "seats" CASCADE;
TRUNCATE TABLE "venue_sections" CASCADE;
TRUNCATE TABLE "ticket_types" CASCADE;
TRUNCATE TABLE "event_schedules" CASCADE;
TRUNCATE TABLE "events" CASCADE;
TRUNCATE TABLE "customer_profiles" CASCADE;
TRUNCATE TABLE "organizer_profiles" CASCADE;
TRUNCATE TABLE "users" CASCADE;
TRUNCATE TABLE "venues" CASCADE;
TRUNCATE TABLE "categories" CASCADE;
TRUNCATE TABLE "tax_rates" CASCADE;
TRUNCATE TABLE "commission_settings" CASCADE;
