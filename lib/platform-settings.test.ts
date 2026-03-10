import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_PLATFORM_SETTINGS,
  mergePlatformSettings,
  toPlatformSettingsResponse,
} from "./platform-settings.ts";

test("mergePlatformSettings deep merges nested payment gateways", () => {
  const merged = mergePlatformSettings(DEFAULT_PLATFORM_SETTINGS, {
    platformName: "Gelaran Beta",
    paymentGateways: {
      midtrans: false,
      xendit: true,
    },
  });

  assert.equal(merged.platformName, "Gelaran Beta");
  assert.deepEqual(merged.paymentGateways, {
    midtrans: false,
    xendit: true,
  });
  assert.equal(merged.enableEmailNotifications, true);
});

test("toPlatformSettingsResponse maps database row into API shape", () => {
  const mapped = toPlatformSettingsResponse({
    id: "settings-id",
    settings_key: "default",
    platform_name: "Gelaran",
    platform_email: "support@example.com",
    platform_phone: "+62 21 1234567",
    platform_fee_percentage: "5",
    min_withdrawal_amount: "100000",
    max_tickets_per_order: 10,
    booking_expiry_minutes: 60,
    enable_email_notifications: true,
    enable_sms_notifications: false,
    maintenance_mode: false,
    payment_gateway_midtrans_enabled: true,
    payment_gateway_xendit_enabled: false,
    created_at: new Date("2026-03-08T00:00:00.000Z"),
    updated_at: new Date("2026-03-08T00:00:00.000Z"),
  });

  assert.equal(mapped.platformFeePercentage, 5);
  assert.equal(mapped.minWithdrawalAmount, 100000);
  assert.deepEqual(mapped.paymentGateways, {
    midtrans: true,
    xendit: false,
  });
});
