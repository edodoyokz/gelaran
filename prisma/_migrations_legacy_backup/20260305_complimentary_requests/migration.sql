DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'ComplimentaryRequestStatus' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "public"."ComplimentaryRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END $$;

ALTER TABLE "public"."bookings"
  ADD COLUMN IF NOT EXISTS "complimentary_request_id" uuid,
  ADD COLUMN IF NOT EXISTS "is_complimentary" boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "public"."complimentary_ticket_requests" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "event_id" uuid NOT NULL,
  "event_schedule_id" uuid,
  "requested_by_id" uuid NOT NULL,
  "reviewed_by_id" uuid,
  "guest_name" text,
  "guest_email" text,
  "guest_phone" text,
  "reason" text,
  "requested_total" integer NOT NULL,
  "approved_total" integer,
  "status" "public"."ComplimentaryRequestStatus" NOT NULL DEFAULT 'PENDING',
  "reviewed_note" text,
  "reviewed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "complimentary_ticket_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."complimentary_ticket_request_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "request_id" uuid NOT NULL,
  "ticket_type_id" uuid NOT NULL,
  "quantity" integer NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "complimentary_ticket_request_items_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'complimentary_ticket_requests_event_id_fkey'
  ) THEN
    ALTER TABLE "public"."complimentary_ticket_requests"
      ADD CONSTRAINT "complimentary_ticket_requests_event_id_fkey"
      FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'complimentary_ticket_requests_event_schedule_id_fkey'
  ) THEN
    ALTER TABLE "public"."complimentary_ticket_requests"
      ADD CONSTRAINT "complimentary_ticket_requests_event_schedule_id_fkey"
      FOREIGN KEY ("event_schedule_id") REFERENCES "public"."event_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'complimentary_ticket_requests_requested_by_id_fkey'
  ) THEN
    ALTER TABLE "public"."complimentary_ticket_requests"
      ADD CONSTRAINT "complimentary_ticket_requests_requested_by_id_fkey"
      FOREIGN KEY ("requested_by_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'complimentary_ticket_requests_reviewed_by_id_fkey'
  ) THEN
    ALTER TABLE "public"."complimentary_ticket_requests"
      ADD CONSTRAINT "complimentary_ticket_requests_reviewed_by_id_fkey"
      FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'complimentary_ticket_request_items_request_id_fkey'
  ) THEN
    ALTER TABLE "public"."complimentary_ticket_request_items"
      ADD CONSTRAINT "complimentary_ticket_request_items_request_id_fkey"
      FOREIGN KEY ("request_id") REFERENCES "public"."complimentary_ticket_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'complimentary_ticket_request_items_ticket_type_id_fkey'
  ) THEN
    ALTER TABLE "public"."complimentary_ticket_request_items"
      ADD CONSTRAINT "complimentary_ticket_request_items_ticket_type_id_fkey"
      FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bookings_complimentary_request_id_fkey'
  ) THEN
    ALTER TABLE "public"."bookings"
      ADD CONSTRAINT "bookings_complimentary_request_id_fkey"
      FOREIGN KEY ("complimentary_request_id") REFERENCES "public"."complimentary_ticket_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "complimentary_ticket_requests_event_id_idx"
  ON "public"."complimentary_ticket_requests"("event_id");

CREATE INDEX IF NOT EXISTS "complimentary_ticket_requests_status_idx"
  ON "public"."complimentary_ticket_requests"("status");

CREATE INDEX IF NOT EXISTS "complimentary_ticket_requests_requested_by_id_idx"
  ON "public"."complimentary_ticket_requests"("requested_by_id");

CREATE INDEX IF NOT EXISTS "complimentary_ticket_request_items_request_id_idx"
  ON "public"."complimentary_ticket_request_items"("request_id");

CREATE INDEX IF NOT EXISTS "bookings_complimentary_request_id_idx"
  ON "public"."bookings"("complimentary_request_id");

ALTER TABLE "public"."complimentary_ticket_request_items"
  ALTER COLUMN "created_at" TYPE TIMESTAMP(3),
  ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "public"."complimentary_ticket_requests"
  ALTER COLUMN "reviewed_at" TYPE TIMESTAMP(3),
  ALTER COLUMN "created_at" TYPE TIMESTAMP(3),
  ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "updated_at" TYPE TIMESTAMP(3),
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'NotificationType' AND n.nspname = 'public'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'NotificationType' AND e.enumlabel = 'COMPLIMENTARY_REQUEST_SUBMITTED'
    ) THEN
      ALTER TYPE "public"."NotificationType" ADD VALUE 'COMPLIMENTARY_REQUEST_SUBMITTED';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'NotificationType' AND e.enumlabel = 'COMPLIMENTARY_REQUEST_APPROVED'
    ) THEN
      ALTER TYPE "public"."NotificationType" ADD VALUE 'COMPLIMENTARY_REQUEST_APPROVED';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'NotificationType' AND e.enumlabel = 'COMPLIMENTARY_REQUEST_REJECTED'
    ) THEN
      ALTER TYPE "public"."NotificationType" ADD VALUE 'COMPLIMENTARY_REQUEST_REJECTED';
    END IF;
  END IF;
END $$;
