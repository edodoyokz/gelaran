-- Cleanup script for fast database reset (Development use only!)
-- Note: Order matters due to foreign key constraints

-- ============================================
-- CHILD TABLES FIRST (with CASCADE)
-- ============================================

-- Delete in correct order to avoid FK violations
DELETE FROM "booked_tickets" CASCADE;
DELETE FROM "bookings" CASCADE;
DELETE FROM "event_faqs" CASCADE;
DELETE FROM "event_schedules" CASCADE;
DELETE FROM "event_tags" CASCADE;
DELETE FROM "event_media" CASCADE;
DELETE FROM "event_performers" CASCADE;
DELETE FROM "event_sponsors" CASCADE;
DELETE FROM "attendee_answers" CASCADE;
DELETE FROM "attendee_questions" CASCADE;
DELETE FROM "check_in_logs" CASCADE;
DELETE FROM "scanner_sessions" CASCADE;
DELETE FROM "check_in_points" CASCADE;
DELETE FROM "ticket_price_tiers" CASCADE;
DELETE FROM "ticket_types" CASCADE;
DELETE FROM "seats" CASCADE;
DELETE FROM "venue_rows" CASCADE;
DELETE FROM "venue_sections" CASCADE;
DELETE FROM "venue_layouts" CASCADE;
DELETE FROM "event_device_sessions" CASCADE;
DELETE FROM "device_accesses" CASCADE;

-- ============================================
-- PARENT TABLES
-- ============================================

DELETE FROM "events" CASCADE;
DELETE FROM "promo_code_usages" CASCADE;
DELETE FROM "promo_codes" CASCADE;
DELETE FROM "transactions" CASCADE;
DELETE FROM "refunds" CASCADE;
DELETE FROM "payouts" CASCADE;
DELETE FROM "reviews" CASCADE;
DELETE FROM "wishlists" CASCADE;
DELETE FROM "notifications" CASCADE;
DELETE FROM "ticket_transfers" CASCADE;
DELETE FROM "waitlist_entries" CASCADE;
DELETE FROM "organizer_team_members" CASCADE;
DELETE FROM "organizer_followers" CASCADE;
DELETE FROM "organizer_bank_accounts" CASCADE;
DELETE FROM "organizer_profiles" CASCADE;
DELETE FROM "customer_profiles" CASCADE;
DELETE FROM "customer_profiles" CASCADE;
DELETE FROM "users" CASCADE;
DELETE FROM "venues" CASCADE;
DELETE FROM "categories" CASCADE;
DELETE FROM "tax_rates" CASCADE;
DELETE FROM "commission_settings" CASCADE;
DELETE FROM "site_contents" CASCADE;
DELETE FROM "audit_logs" CASCADE;
DELETE FROM "tags" CASCADE;
DELETE FROM "performers" CASCADE;
DELETE FROM "sponsors" CASCADE;
DELETE FROM "recurring_patterns" CASCADE;

SELECT 'Database cleanup completed successfully!' as status;
