import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyRLS() {
  console.log("🔍 Verifying RLS Status...\n");

  try {
    const result: any = await prisma.$queryRaw`
      SELECT 
        schemaname, 
        tablename, 
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    const enabled = result.filter((r: any) => r.rowsecurity === true);
    const disabled = result.filter((r: any) => r.rowsecurity === false);

    console.log(`✅ RLS Enabled: ${enabled.length} tables`);
    console.log(`❌ RLS Disabled: ${disabled.length} tables\n`);

    if (enabled.length > 0) {
      console.log("Tables with RLS enabled:");
      for (const r of enabled) {
        console.log(`  ✓ ${r.tablename}`);
      }
    }

    if (disabled.length > 0) {
      console.log("\nTables with RLS disabled:");
      for (const r of disabled) {
        console.log(`  ✗ ${r.tablename}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Total tables: ${result.length}`);
    console.log(`  RLS enabled: ${enabled.length} (${((enabled.length / result.length) * 100).toFixed(1)}%)`);
    
    if (enabled.length === result.length) {
      console.log("\n🎉 All tables have RLS enabled!");
    } else {
      console.log(`\n⚠️  ${disabled.length} tables still need RLS enabled`);
    }

  } catch (error) {
    console.error("❌ Error verifying RLS:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRLS();
