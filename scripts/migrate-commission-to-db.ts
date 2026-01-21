import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { readFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

async function migrateCommissionToDatabase() {
  console.log("🔄 Migrating platform commission from JSON to database...\n");

  try {
    const SETTINGS_FILE = path.join(process.cwd(), "data", "platform-settings.json");
    let platformFeePercentage = 5;

    try {
      const data = await readFile(SETTINGS_FILE, "utf-8");
      const settings = JSON.parse(data);
      platformFeePercentage = settings.platformFeePercentage || 5;
      console.log(`✓ Found platform fee in JSON: ${platformFeePercentage}%`);
    } catch (error) {
      console.log(`⚠ No JSON file found, using default: ${platformFeePercentage}%`);
    }

    const existingGlobalCommission = await prisma.commissionSetting.findFirst({
      where: {
        organizerId: null,
        isActive: true,
      },
    });

    if (existingGlobalCommission) {
      console.log(`\n✓ Global commission already exists in database: ${existingGlobalCommission.commissionValue}%`);
      console.log("  Skipping migration.");
      return;
    }

    const globalCommission = await prisma.commissionSetting.create({
      data: {
        organizerId: null,
        commissionType: "PERCENTAGE",
        commissionValue: platformFeePercentage,
        isActive: true,
      },
    });

    console.log(`\n✅ Created global commission setting in database:`);
    console.log(`   ID: ${globalCommission.id}`);
    console.log(`   Type: ${globalCommission.commissionType}`);
    console.log(`   Value: ${globalCommission.commissionValue}%`);
    console.log(`   Active: ${globalCommission.isActive}`);
    
    console.log("\n🎉 Migration complete!");
    console.log("\nNext steps:");
    console.log("  1. Settings page will now read from database");
    console.log("  2. Commission overrides per organizer work seamlessly");
    console.log("  3. Old JSON file can be kept for other settings");
  } catch (error) {
    console.error("❌ Error during migration:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCommissionToDatabase();
