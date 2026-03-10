CREATE TABLE IF NOT EXISTS "platform_settings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "settings_key" TEXT NOT NULL DEFAULT 'default',
  "platform_name" TEXT NOT NULL,
  "platform_email" TEXT NOT NULL,
  "platform_phone" TEXT NOT NULL,
  "platform_fee_percentage" DECIMAL(5,2) NOT NULL,
  "min_withdrawal_amount" DECIMAL(15,2) NOT NULL,
  "max_tickets_per_order" INTEGER NOT NULL,
  "booking_expiry_minutes" INTEGER NOT NULL,
  "enable_email_notifications" BOOLEAN NOT NULL DEFAULT true,
  "enable_sms_notifications" BOOLEAN NOT NULL DEFAULT false,
  "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
  "payment_gateway_midtrans_enabled" BOOLEAN NOT NULL DEFAULT true,
  "payment_gateway_xendit_enabled" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_settings_settings_key_key"
  ON "platform_settings"("settings_key");
