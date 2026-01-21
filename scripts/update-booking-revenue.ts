import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateBookingRevenue() {
  console.log("🔄 Updating booking revenue fields...\n");

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "PAID"] },
      },
      select: {
        id: true,
        bookingCode: true,
        platformFee: true,
        subtotal: true,
        platformRevenue: true,
        organizerRevenue: true,
      },
    });

    console.log(`Found ${bookings.length} bookings to update\n`);

    let updated = 0;

    for (const booking of bookings) {
      const platformRevenue = Number(booking.platformFee);
      const organizerRevenue = Number(booking.subtotal);

      if (
        Number(booking.platformRevenue) === 0 &&
        Number(booking.organizerRevenue) === 0
      ) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            platformRevenue,
            organizerRevenue,
          },
        });

        console.log(
          `  ✅ Updated ${booking.bookingCode}: Platform=${platformRevenue}, Organizer=${organizerRevenue}`
        );
        updated++;
      } else {
        console.log(`  ⏭️  Skipped ${booking.bookingCode} (already has revenue data)`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Total bookings: ${bookings.length}`);
    console.log(`  ✅ Updated: ${updated}`);
    console.log(`  ⏭️  Skipped: ${bookings.length - updated}`);

    if (updated > 0) {
      console.log("\n🎉 Booking revenue fields updated!");
    }
  } catch (error) {
    console.error("❌ Error updating bookings:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateBookingRevenue();
