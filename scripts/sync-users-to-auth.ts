import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DEFAULT_PASSWORD = "password123";

async function syncUsersToAuth() {
  console.log("🔄 Syncing users from database to Supabase Auth...\n");

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log(`Found ${users.length} users in database\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      try {
        const { data: existingUser, error: checkError } =
          await supabase.auth.admin.getUserById(user.id);

        if (existingUser?.user) {
          console.log(`  ⏭️  Skipped: ${user.email} (already exists in Auth)`);
          skipped++;
          continue;
        }

        const { data, error } = await supabase.auth.admin.createUser({
          id: user.id,
          email: user.email,
          password: DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: {
            name: user.name,
            role: user.role,
          },
        });

        if (error) {
          console.error(`  ❌ Error creating ${user.email}:`, error.message);
          errors++;
        } else {
          console.log(`  ✅ Created: ${user.email} (${user.role})`);
          created++;
        }
      } catch (err: any) {
        console.error(`  ❌ Exception for ${user.email}:`, err.message);
        errors++;
      }
    }

    console.log("\n📊 Summary:");
    console.log(`  Total users: ${users.length}`);
    console.log(`  ✅ Created: ${created}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Errors: ${errors}`);

    if (created > 0) {
      console.log("\n🎉 Users synced to Supabase Auth!");
      console.log(`\n🔑 Default password for all users: ${DEFAULT_PASSWORD}`);
    }
  } catch (error) {
    console.error("❌ Error syncing users:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncUsersToAuth();
