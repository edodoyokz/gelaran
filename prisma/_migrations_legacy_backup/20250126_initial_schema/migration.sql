-- ============================================
-- Initial Schema Migration for BSC Event Platform
-- Created: 2025-01-26
-- Purpose: Create all tables for the event ticketing platform
-- ============================================

-- Create Enums first (in dependency order)
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'ORGANIZER', 'CUSTOMER', 'SCANNER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EventType" AS ENUM ('OFFLINE', 'ONLINE', 'HYBRID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'CANCELLED', 'ENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'PASSWORD_PROTECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'AWAITING_PAYMENT', 'PAID', 'CONFIRMED', 'CANCELLED', 'REFUNDED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'PARTIAL_REFUND', 'FULL_REFUND');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SalesChannel" AS ENUM ('ONLINE', 'ON_SITE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BookedTicketStatus" AS ENUM ('ACTIVE', 'TRANSFERRED', 'CANCELLED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'EXPIRED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CheckInResult" AS ENUM ('SUCCESS', 'ALREADY_CHECKED_IN', 'INVALID', 'EXPIRED', 'WRONG_EVENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RefundType" AS ENUM ('FULL', 'PARTIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PayoutStatus" AS ENUM ('REQUESTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'HIDDEN', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMED', 'PAYMENT_RECEIVED', 'EVENT_REMINDER', 'EVENT_CANCELLED', 'PAYOUT_COMPLETED', 'REVIEW_REPLY', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SessionType" AS ENUM ('GATE', 'POS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SiteContentType" AS ENUM ('TEXT', 'IMAGE', 'JSON', 'HTML');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TeamMemberRole" AS ENUM ('MANAGER', 'SCANNER', 'FINANCE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TicketTransferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'CANCELLED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "WaitlistStatus" AS ENUM ('WAITING', 'NOTIFIED', 'CONVERTED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EventMediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PerformerRole" AS ENUM ('HEADLINER', 'SUPPORTING', 'GUEST', 'SPEAKER', 'HOST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SponsorTier" AS ENUM ('PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'MEDIA_PARTNER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RecurringFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AttendeeInputType" AS ENUM ('TEXT', 'TEXTAREA', 'SELECT', 'RADIO', 'CHECKBOX', 'DATE', 'EMAIL', 'PHONE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TaxType" AS ENUM ('PERCENTAGE', 'FIXED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CommissionType" AS ENUM ('PERCENTAGE', 'FIXED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'LOCKED', 'BOOKED', 'BLOCKED', 'RESERVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SectionType" AS ENUM ('SEATED', 'STANDING', 'MIXED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- MODULE 1: USER MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phone" TEXT UNIQUE,
    "password_hash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "avatar_url" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'id',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "email_verified_at" TIMESTAMP WITH TIME ZONE,
    "last_login_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "deleted_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS "organizer_profiles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE,
    "organization_name" TEXT NOT NULL,
    "organization_slug" TEXT NOT NULL UNIQUE,
    "organization_logo" TEXT,
    "organization_banner" TEXT,
    "organization_description" TEXT,
    "website_url" TEXT,
    "social_facebook" TEXT,
    "social_instagram" TEXT,
    "social_twitter" TEXT,
    "social_tiktok" TEXT,
    "wallet_balance" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "total_earned" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "total_withdrawn" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verified_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "organizer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "organizer_bank_accounts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizer_profile_id" UUID NOT NULL,
    "bank_name" TEXT NOT NULL,
    "bank_code" TEXT,
    "account_number" TEXT NOT NULL,
    "account_holder_name" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "organizer_bank_accounts_organizer_profile_id_fkey" FOREIGN KEY ("organizer_profile_id") REFERENCES "organizer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "customer_profiles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE,
    "birth_date" DATE,
    "gender" "Gender",
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postal_code" TEXT,
    "id_number" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "customer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- MODULE 2: EVENT MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS "categories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "icon" TEXT,
    "color_hex" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "parent_id" UUID,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "venues" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizer_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postal_code" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Indonesia',
    "latitude" DECIMAL(10, 8),
    "longitude" DECIMAL(11, 8),
    "google_place_id" TEXT,
    "capacity" INTEGER,
    "description" TEXT,
    "amenities" JSONB,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizer_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "venue_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "short_description" VARCHAR(200),
    "description" TEXT,
    "poster_image" TEXT,
    "banner_image" TEXT,
    "trailer_video_url" TEXT,
    "event_type" "EventType" NOT NULL DEFAULT 'OFFLINE',
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "EventVisibility" NOT NULL DEFAULT 'PUBLIC',
    "access_password" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "has_seating_chart" BOOLEAN NOT NULL DEFAULT false,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "min_tickets_per_order" INTEGER NOT NULL DEFAULT 1,
    "max_tickets_per_order" INTEGER NOT NULL DEFAULT 10,
    "online_meeting_url" TEXT,
    "online_meeting_password" TEXT,
    "terms_and_conditions" TEXT,
    "refund_policy" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "publish_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "deleted_at" TIMESTAMP WITH TIME ZONE,
    CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "event_schedules" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "title" TEXT,
    "schedule_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "description" TEXT,
    "location_override" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "event_schedules_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "event_faqs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "event_faqs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- MODULE 3: TICKETING
-- ============================================

CREATE TABLE IF NOT EXISTS "ticket_types" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_price" DECIMAL(15, 2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "total_quantity" INTEGER NOT NULL,
    "sold_quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "min_per_order" INTEGER NOT NULL DEFAULT 1,
    "max_per_order" INTEGER NOT NULL DEFAULT 10,
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "requires_attendee_info" BOOLEAN NOT NULL DEFAULT false,
    "is_transferable" BOOLEAN NOT NULL DEFAULT true,
    "sale_start_at" TIMESTAMP WITH TIME ZONE,
    "sale_end_at" TIMESTAMP WITH TIME ZONE,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "ticket_types_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ticket_price_tiers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ticket_type_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(15, 2) NOT NULL,
    "quantity_limit" INTEGER,
    "sold_quantity" INTEGER NOT NULL DEFAULT 0,
    "start_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "end_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "ticket_price_tiers_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "promo_codes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID,
    "organizer_id" UUID NOT NULL,
    "code" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(15, 2) NOT NULL,
    "max_discount_amount" DECIMAL(15, 2),
    "min_order_amount" DECIMAL(15, 2),
    "usage_limit_total" INTEGER,
    "usage_limit_per_user" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "applicable_ticket_types" JSONB,
    "valid_from" TIMESTAMP WITH TIME ZONE NOT NULL,
    "valid_until" TIMESTAMP WITH TIME ZONE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "promo_codes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "promo_code_usages" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "promo_code_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "discount_amount" DECIMAL(15, 2) NOT NULL,
    "used_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "promo_code_usages_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================
-- MODULE 4: BOOKING & TRANSACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS "bookings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "booking_code" TEXT NOT NULL UNIQUE,
    "user_id" UUID,
    "event_id" UUID NOT NULL,
    "event_schedule_id" UUID,
    "guest_email" TEXT,
    "guest_name" TEXT,
    "guest_phone" TEXT,
    "total_tickets" INTEGER NOT NULL,
    "subtotal" DECIMAL(15, 2) NOT NULL,
    "discount_amount" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "platform_fee" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "payment_gateway_fee" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(15, 2) NOT NULL,
    "organizer_revenue" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "platform_revenue" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "sales_channel" "SalesChannel" NOT NULL DEFAULT 'ONLINE',
    "sold_by_staff" TEXT,
    "sold_by_device" TEXT,
    "cancellation_reason" TEXT,
    "cancelled_by" UUID,
    "cancelled_at" TIMESTAMP WITH TIME ZONE,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "utm_params" JSONB,
    "expires_at" TIMESTAMP WITH TIME ZONE,
    "paid_at" TIMESTAMP WITH TIME ZONE,
    "confirmed_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bookings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_event_schedule_id_fkey" FOREIGN KEY ("event_schedule_id") REFERENCES "event_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE "promo_code_usages"
    DROP CONSTRAINT IF EXISTS "promo_code_usages_booking_id_fkey";

ALTER TABLE "promo_code_usages"
    ADD CONSTRAINT "promo_code_usages_booking_id_fkey"
    FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "booked_tickets" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "ticket_type_id" UUID NOT NULL,
    "ticket_price_tier_id" UUID,
    "seat_id" UUID,
    "unique_code" TEXT NOT NULL UNIQUE,
    "qr_code_url" TEXT,
    "unit_price" DECIMAL(15, 2) NOT NULL,
    "tax_amount" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "final_price" DECIMAL(15, 2) NOT NULL,
    "is_checked_in" BOOLEAN NOT NULL DEFAULT false,
    "checked_in_at" TIMESTAMP WITH TIME ZONE,
    "checked_in_by" UUID,
    "check_in_point_id" UUID,
    "status" "BookedTicketStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "booked_tickets_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "booked_tickets_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booked_tickets_ticket_price_tier_id_fkey" FOREIGN KEY ("ticket_price_tier_id") REFERENCES "ticket_price_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "transactions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL UNIQUE,
    "transaction_code" TEXT NOT NULL UNIQUE,
    "payment_gateway" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_channel" TEXT,
    "amount" DECIMAL(15, 2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "gateway_response" JSONB,
    "gateway_transaction_id" TEXT,
    "failure_reason" TEXT,
    "paid_at" TIMESTAMP WITH TIME ZONE,
    "expires_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "transactions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "refunds" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "transaction_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "requested_by" UUID NOT NULL,
    "processed_by" UUID,
    "refund_type" "RefundType" NOT NULL,
    "refund_amount" DECIMAL(15, 2) NOT NULL,
    "reason" TEXT,
    "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
    "gateway_refund_id" TEXT,
    "gateway_response" JSONB,
    "admin_notes" TEXT,
    "requested_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "processed_at" TIMESTAMP WITH TIME ZONE,
    "completed_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "refunds_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "refunds_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "payouts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizer_id" UUID NOT NULL,
    "bank_account_id" UUID NOT NULL,
    "payout_code" TEXT NOT NULL UNIQUE,
    "amount" DECIMAL(15, 2) NOT NULL,
    "fee" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15, 2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'REQUESTED',
    "notes" TEXT,
    "rejection_reason" TEXT,
    "proof_document_url" TEXT,
    "requested_by" UUID NOT NULL,
    "processed_by" UUID,
    "requested_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "approved_at" TIMESTAMP WITH TIME ZONE,
    "completed_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "payouts_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payouts_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "organizer_bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================
-- MODULE 5: CHECK-IN SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS "check_in_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "booked_ticket_id" UUID NOT NULL,
    "scanned_by" UUID NOT NULL,
    "check_in_point_id" UUID,
    "result" "CheckInResult" NOT NULL,
    "scanned_code" TEXT NOT NULL,
    "device_info" TEXT,
    "ip_address" TEXT,
    "scanned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "check_in_logs_booked_ticket_id_fkey" FOREIGN KEY ("booked_ticket_id") REFERENCES "booked_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "check_in_points" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "location_description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "check_in_points_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "scanner_sessions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "check_in_point_id" UUID NOT NULL,
    "device_info" TEXT,
    "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "ended_at" TIMESTAMP WITH TIME ZONE,
    "total_scans" INTEGER NOT NULL DEFAULT 0,
    "successful_scans" INTEGER NOT NULL DEFAULT 0,
    "failed_scans" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "scanner_sessions_check_in_point_id_fkey" FOREIGN KEY ("check_in_point_id") REFERENCES "check_in_points"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- MODULE 6: FINANCIAL
-- ============================================

-- Already created: refunds, payouts above

-- ============================================
-- MODULE 7: REVIEWS & ENGAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS "reviews" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "review_text" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT true,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "wishlists" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "wishlists_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("user_id", "event_id")
);

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- MODULE 8: GATE & POS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS "event_device_sessions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "session_type" "SessionType" NOT NULL,
    "pin_hash" TEXT NOT NULL,
    "device_limit" INTEGER NOT NULL DEFAULT 5,
    "created_by" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "event_device_sessions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("event_id", "session_type")
);

CREATE TABLE IF NOT EXISTS "device_accesses" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "device_token" TEXT NOT NULL UNIQUE,
    "device_fingerprint" TEXT NOT NULL,
    "staff_name" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_active_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "device_accesses_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "event_device_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- MODULE 9: SITE CONTENT MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS "site_contents" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL UNIQUE,
    "value" JSONB NOT NULL,
    "type" "SiteContentType" NOT NULL DEFAULT 'JSON',
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- MODULE 10: ORGANIZER TEAM MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS "organizer_team_members" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizer_profile_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "TeamMemberRole" NOT NULL,
    "permissions" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "invited_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "accepted_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "organizer_team_members_organizer_profile_id_fkey" FOREIGN KEY ("organizer_profile_id") REFERENCES "organizer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("organizer_profile_id", "user_id")
);

-- ============================================
-- MODULE 11: TICKET TRANSFER
-- ============================================

CREATE TABLE IF NOT EXISTS "ticket_transfers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "booked_ticket_id" UUID NOT NULL,
    "from_user_id" UUID NOT NULL,
    "to_user_id" UUID,
    "recipient_email" TEXT NOT NULL,
    "recipient_name" TEXT,
    "status" "TicketTransferStatus" NOT NULL DEFAULT 'PENDING',
    "old_unique_code" TEXT NOT NULL,
    "new_unique_code" TEXT,
    "initiated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "accepted_at" TIMESTAMP WITH TIME ZONE,
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ============================================
-- MODULE 12: WAITLIST
-- ============================================

CREATE TABLE IF NOT EXISTS "waitlist_entries" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ticket_type_id" UUID NOT NULL,
    "user_id" UUID,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "quantity_requested" INTEGER NOT NULL DEFAULT 1,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'WAITING',
    "notified_at" TIMESTAMP WITH TIME ZONE,
    "expires_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- MODULE 13: TAGS & MEDIA
-- ============================================

CREATE TABLE IF NOT EXISTS "tags" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "event_tags" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    CONSTRAINT "event_tags_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("event_id", "tag_id")
);

CREATE TABLE IF NOT EXISTS "event_media" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "media_type" "EventMediaType" NOT NULL,
    "file_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "title" TEXT,
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "event_media_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- MODULE 14: PERFORMERS & SPONSORS
-- ============================================

CREATE TABLE IF NOT EXISTS "performers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizer_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "title" TEXT,
    "bio" TEXT,
    "photo_url" TEXT,
    "website_url" TEXT,
    "social_instagram" TEXT,
    "social_twitter" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "event_performers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "performer_id" UUID NOT NULL,
    "role" "PerformerRole" NOT NULL DEFAULT 'SUPPORTING',
    "performance_time" TIME,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "event_performers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_performers_performer_id_fkey" FOREIGN KEY ("performer_id") REFERENCES "performers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("event_id", "performer_id")
);

CREATE TABLE IF NOT EXISTS "sponsors" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizer_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "website_url" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "event_sponsors" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "sponsor_id" UUID NOT NULL,
    "tier" "SponsorTier" NOT NULL DEFAULT 'BRONZE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "event_sponsors_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_sponsors_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("event_id", "sponsor_id")
);

-- ============================================
-- MODULE 15: RECURRING EVENTS
-- ============================================

CREATE TABLE IF NOT EXISTS "recurring_patterns" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "frequency" "RecurringFrequency" NOT NULL,
    "interval_value" INTEGER NOT NULL DEFAULT 1,
    "days_of_week" JSONB,
    "day_of_month" INTEGER,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "max_occurrences" INTEGER,
    "skip_dates" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- MODULE 16: ATTENDEE QUESTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS "attendee_questions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "ticket_type_id" UUID,
    "question" TEXT NOT NULL,
    "input_type" "AttendeeInputType" NOT NULL,
    "options" JSONB,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "attendee_questions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attendee_questions_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "attendee_answers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "booked_ticket_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "answer" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "attendee_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "attendee_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("booked_ticket_id", "question_id")
);

-- ============================================
-- MODULE 17: TAX & COMMISSION SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS "tax_rates" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL UNIQUE,
    "tax_type" "TaxType" NOT NULL DEFAULT 'PERCENTAGE',
    "rate" DECIMAL(5, 2) NOT NULL,
    "is_inclusive" BOOLEAN NOT NULL DEFAULT false,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "commission_settings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizer_id" UUID,
    "event_id" UUID,
    "commission_type" "CommissionType" NOT NULL DEFAULT 'PERCENTAGE',
    "commission_value" DECIMAL(5, 2) NOT NULL,
    "min_commission" DECIMAL(15, 2),
    "max_commission" DECIMAL(15, 2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP WITH TIME ZONE,
    "valid_until" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- MODULE 18: AUDIT LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- MODULE 19: CHECK-IN POINTS & SESSIONS
-- ============================================

-- Already created: check_in_points, scanner_sessions above

-- ============================================
-- MODULE 20: SEATING CHART SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS "venue_sections" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color_hex" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "capacity" INTEGER,
    "section_type" "SectionType" NOT NULL DEFAULT 'SEATED',
    "position_x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position_y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "venue_sections_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "venue_rows" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "section_id" UUID NOT NULL,
    "row_label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "venue_rows_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "venue_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "seats" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "row_id" UUID NOT NULL,
    "ticket_type_id" UUID,
    "seat_label" TEXT NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "status" "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "price_override" DECIMAL(15, 2),
    "is_accessible" BOOLEAN NOT NULL DEFAULT false,
    "locked_by_user_id" UUID,
    "locked_until" TIMESTAMP WITH TIME ZONE,
    "booked_ticket_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "seats_row_id_fkey" FOREIGN KEY ("row_id") REFERENCES "venue_rows"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "seats_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    UNIQUE ("row_id", "seat_number")
);

-- ============================================
-- MODULE 21: VENUE LAYOUT
-- ============================================

CREATE TABLE IF NOT EXISTS "venue_layouts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL UNIQUE,
    "image_url" TEXT,
    "image_width" INTEGER,
    "image_height" INTEGER,
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "venue_layouts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- MODULE 22: ORGANIZER FOLLOWERS
-- ============================================

CREATE TABLE IF NOT EXISTS "organizer_followers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizer_profile_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "notify_new_events" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "organizer_followers_organizer_profile_id_fkey" FOREIGN KEY ("organizer_profile_id") REFERENCES "organizer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("organizer_profile_id", "user_id")
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users"("role");

-- Organizer profiles indexes
CREATE INDEX IF NOT EXISTS "idx_organizer_profiles_user_id" ON "organizer_profiles"("user_id");
CREATE INDEX IF NOT EXISTS "idx_organizer_profiles_slug" ON "organizer_profiles"("organization_slug");

-- Categories indexes
CREATE INDEX IF NOT EXISTS "idx_categories_parent_id" ON "categories"("parent_id");
CREATE INDEX IF NOT EXISTS "idx_categories_slug" ON "categories"("slug");

-- Venues indexes
CREATE INDEX IF NOT EXISTS "idx_venues_organizer_id" ON "venues"("organizer_id");
CREATE INDEX IF NOT EXISTS "idx_venues_city" ON "venues"("city");

-- Events indexes
CREATE INDEX IF NOT EXISTS "idx_events_organizer_id" ON "events"("organizer_id");
CREATE INDEX IF NOT EXISTS "idx_events_category_id" ON "events"("category_id");
CREATE INDEX IF NOT EXISTS "idx_events_venue_id" ON "events"("venue_id");
CREATE INDEX IF NOT EXISTS "idx_events_slug" ON "events"("slug");
CREATE INDEX IF NOT EXISTS "idx_events_status" ON "events"("status");
CREATE INDEX IF NOT EXISTS "idx_events_publish_at" ON "events"("publish_at");
CREATE INDEX IF NOT EXISTS "idx_events_created_at" ON "events"("created_at");

-- Event schedules indexes
CREATE INDEX IF NOT EXISTS "idx_event_schedules_event_id" ON "event_schedules"("event_id");

-- Event FAQs indexes
CREATE INDEX IF NOT EXISTS "idx_event_faqs_event_id" ON "event_faqs"("event_id");

-- Ticket types indexes
CREATE INDEX IF NOT EXISTS "idx_ticket_types_event_id" ON "ticket_types"("event_id");

-- Ticket price tiers indexes
CREATE INDEX IF NOT EXISTS "idx_ticket_price_tiers_ticket_type_id" ON "ticket_price_tiers"("ticket_type_id");

-- Promo codes indexes
CREATE INDEX IF NOT EXISTS "idx_promo_codes_event_id" ON "promo_codes"("event_id");
CREATE INDEX IF NOT EXISTS "idx_promo_codes_code" ON "promo_codes"("code");

-- Promo code usages indexes
CREATE INDEX IF NOT EXISTS "idx_promo_code_usages_promo_code_id" ON "promo_code_usages"("promo_code_id");
CREATE INDEX IF NOT EXISTS "idx_promo_code_usages_booking_id" ON "promo_code_usages"("booking_id");

-- Bookings indexes
CREATE INDEX IF NOT EXISTS "idx_bookings_user_id" ON "bookings"("user_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_event_id" ON "bookings"("event_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_event_schedule_id" ON "bookings"("event_schedule_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_booking_code" ON "bookings"("booking_code");
CREATE INDEX IF NOT EXISTS "idx_bookings_status" ON "bookings"("status");
CREATE INDEX IF NOT EXISTS "idx_bookings_payment_status" ON "bookings"("payment_status");
CREATE INDEX IF NOT EXISTS "idx_bookings_created_at" ON "bookings"("created_at");

-- Booked tickets indexes
CREATE INDEX IF NOT EXISTS "idx_booked_tickets_booking_id" ON "booked_tickets"("booking_id");
CREATE INDEX IF NOT EXISTS "idx_booked_tickets_ticket_type_id" ON "booked_tickets"("ticket_type_id");
CREATE INDEX IF NOT EXISTS "idx_booked_tickets_seat_id" ON "booked_tickets"("seat_id");
CREATE INDEX IF NOT EXISTS "idx_booked_tickets_unique_code" ON "booked_tickets"("unique_code");

-- Transactions indexes
CREATE INDEX IF NOT EXISTS "idx_transactions_booking_id" ON "transactions"("booking_id");
CREATE INDEX IF NOT EXISTS "idx_transactions_transaction_code" ON "transactions"("transaction_code");
CREATE INDEX IF NOT EXISTS "idx_transactions_status" ON "transactions"("status");

-- Refunds indexes
CREATE INDEX IF NOT EXISTS "idx_refunds_transaction_id" ON "refunds"("transaction_id");
CREATE INDEX IF NOT EXISTS "idx_refunds_booking_id" ON "refunds"("booking_id");

-- Payouts indexes
CREATE INDEX IF NOT EXISTS "idx_payouts_organizer_id" ON "payouts"("organizer_id");
CREATE INDEX IF NOT EXISTS "idx_payouts_bank_account_id" ON "payouts"("bank_account_id");

-- Check-in logs indexes
CREATE INDEX IF NOT EXISTS "idx_check_in_logs_booked_ticket_id" ON "check_in_logs"("booked_ticket_id");

-- Check-in points indexes
CREATE INDEX IF NOT EXISTS "idx_check_in_points_event_id" ON "check_in_points"("event_id");

-- Reviews indexes
CREATE INDEX IF NOT EXISTS "idx_reviews_user_id" ON "reviews"("user_id");
CREATE INDEX IF NOT EXISTS "idx_reviews_event_id" ON "reviews"("event_id");
CREATE INDEX IF NOT EXISTS "idx_reviews_booking_id" ON "reviews"("booking_id");

-- Wishlists indexes
CREATE INDEX IF NOT EXISTS "idx_wishlists_user_id" ON "wishlists"("user_id");
CREATE INDEX IF NOT EXISTS "idx_wishlists_event_id" ON "wishlists"("event_id");

-- Notifications indexes
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_is_read" ON "notifications"("is_read");

-- Event device sessions indexes
CREATE INDEX IF NOT EXISTS "idx_event_device_sessions_event_id" ON "event_device_sessions"("event_id");

-- Device accesses indexes
CREATE INDEX IF NOT EXISTS "idx_device_accesses_session_id" ON "device_accesses"("session_id");

-- Organizer team members indexes
CREATE INDEX IF NOT EXISTS "idx_organizer_team_members_organizer_profile_id" ON "organizer_team_members"("organizer_profile_id");
CREATE INDEX IF NOT EXISTS "idx_organizer_team_members_user_id" ON "organizer_team_members"("user_id");

-- Ticket transfers indexes
CREATE INDEX IF NOT EXISTS "idx_ticket_transfers_booked_ticket_id" ON "ticket_transfers"("booked_ticket_id");
CREATE INDEX IF NOT EXISTS "idx_ticket_transfers_from_user_id" ON "ticket_transfers"("from_user_id");

-- Waitlist entries indexes
CREATE INDEX IF NOT EXISTS "idx_waitlist_entries_ticket_type_id" ON "waitlist_entries"("ticket_type_id");

-- Tags indexes
CREATE INDEX IF NOT EXISTS "idx_tags_slug" ON "tags"("slug");

-- Event tags indexes
CREATE INDEX IF NOT EXISTS "idx_event_tags_event_id" ON "event_tags"("event_id");
CREATE INDEX IF NOT EXISTS "idx_event_tags_tag_id" ON "event_tags"("tag_id");

-- Event media indexes
CREATE INDEX IF NOT EXISTS "idx_event_media_event_id" ON "event_media"("event_id");

-- Performers indexes
CREATE INDEX IF NOT EXISTS "idx_performers_organizer_id" ON "performers"("organizer_id");
CREATE INDEX IF NOT EXISTS "idx_performers_slug" ON "performers"("slug");

-- Event performers indexes
CREATE INDEX IF NOT EXISTS "idx_event_performers_event_id" ON "event_performers"("event_id");
CREATE INDEX IF NOT EXISTS "idx_event_performers_performer_id" ON "event_performers"("performer_id");

-- Sponsors indexes
CREATE INDEX IF NOT EXISTS "idx_sponsors_organizer_id" ON "sponsors"("organizer_id");

-- Event sponsors indexes
CREATE INDEX IF NOT EXISTS "idx_event_sponsors_event_id" ON "event_sponsors"("event_id");
CREATE INDEX IF NOT EXISTS "idx_event_sponsors_sponsor_id" ON "event_sponsors"("sponsor_id");

-- Attendee questions indexes
CREATE INDEX IF NOT EXISTS "idx_attendee_questions_event_id" ON "attendee_questions"("event_id");

-- Attendee answers indexes
CREATE INDEX IF NOT EXISTS "idx_attendee_answers_booked_ticket_id" ON "attendee_answers"("booked_ticket_id");
CREATE INDEX IF NOT EXISTS "idx_attendee_answers_question_id" ON "attendee_answers"("question_id");

-- Venue sections indexes
CREATE INDEX IF NOT EXISTS "idx_venue_sections_event_id" ON "venue_sections"("event_id");

-- Venue rows indexes
CREATE INDEX IF NOT EXISTS "idx_venue_rows_section_id" ON "venue_rows"("section_id");

-- Seats indexes
CREATE INDEX IF NOT EXISTS "idx_seats_row_id" ON "seats"("row_id");
CREATE INDEX IF NOT EXISTS "idx_seats_ticket_type_id" ON "seats"("ticket_type_id");
CREATE INDEX IF NOT EXISTS "idx_seats_status" ON "seats"("status");
CREATE INDEX IF NOT EXISTS "idx_seats_booked_ticket_id" ON "seats"("booked_ticket_id");

-- Venue layouts indexes
CREATE INDEX IF NOT EXISTS "idx_venue_layouts_event_id" ON "venue_layouts"("event_id");

-- Organizer followers indexes
CREATE INDEX IF NOT EXISTS "idx_organizer_followers_organizer_profile_id" ON "organizer_followers"("organizer_profile_id");
CREATE INDEX IF NOT EXISTS "idx_organizer_followers_user_id" ON "organizer_followers"("user_id");

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity_type" ON "audit_logs"("entity_type");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity_id" ON "audit_logs"("entity_id");

-- Scanner sessions indexes
CREATE INDEX IF NOT EXISTS "idx_scanner_sessions_user_id" ON "scanner_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_scanner_sessions_event_id" ON "scanner_sessions"("event_id");

SELECT 'Initial schema migration completed successfully!' as status;
