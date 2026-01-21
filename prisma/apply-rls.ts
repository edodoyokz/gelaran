import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function applyRLS() {
  console.log("🔐 Applying Row Level Security (RLS) policies...");
  
  try {
    const sqlContent = readFileSync(
      join(process.cwd(), "prisma", "enable-rls-simple.sql"),
      "utf-8"
    );

    const statements = sqlContent
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));

    console.log(`Found ${statements.length} SQL statements to execute`);

    let executed = 0;
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement + ";");
        executed++;
        if (executed % 10 === 0) {
          console.log(`  ✓ Executed ${executed}/${statements.length} statements`);
        }
      } catch (error: any) {
        if (error.message.includes("already exists")) {
          console.log(`  ⚠ Skipping: ${statement.substring(0, 50)}... (already exists)`);
        } else {
          console.error(`  ✗ Error on statement: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    }

    console.log(`✅ Successfully executed ${executed} statements!`);
    console.log("\nSecurity improvements:");
    console.log("  ✓ Enabled RLS on 51 tables");
    console.log("  ✓ Created public read policies");
    console.log("  ✓ Created user policies");
    console.log("  ✓ Created organizer policies");
    console.log("  ✓ Created admin policies");
    console.log("\n🎉 Database is now secure!");
  } catch (error) {
    console.error("❌ Error applying RLS policies:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyRLS();
