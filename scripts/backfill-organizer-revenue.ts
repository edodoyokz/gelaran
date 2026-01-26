import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillOrganizerRevenue() {
    console.log('=== Backfill Organizer Revenue ===\n');

    // Get all bookings that need fixing
    const bookings = await prisma.booking.findMany({
        where: { status: { in: ['CONFIRMED', 'PAID'] } },
        select: {
            id: true,
            bookingCode: true,
            subtotal: true,
            discountAmount: true,
            platformFee: true,
            paymentGatewayFee: true,
            organizerRevenue: true,
        },
    });

    console.log(`Found ${bookings.length} bookings to verify\n`);

    let fixedCount = 0;

    for (const booking of bookings) {
        const taxBase = Number(booking.subtotal) - Number(booking.discountAmount);
        const platformFee = Number(booking.platformFee);
        const gatewayFee = Number(booking.paymentGatewayFee);
        const currentOrgRevenue = Number(booking.organizerRevenue);
        const correctOrgRevenue = taxBase - platformFee - gatewayFee;

        // Check if it needs fixing (allow small float tolerance)
        if (Math.abs(currentOrgRevenue - correctOrgRevenue) > 0.01) {
            console.log(`${booking.bookingCode}:`);
            console.log(`  Current: ${currentOrgRevenue}`);
            console.log(`  Correct: ${correctOrgRevenue}`);
            console.log(`  Diff: ${currentOrgRevenue - correctOrgRevenue}`);

            await prisma.booking.update({
                where: { id: booking.id },
                data: { organizerRevenue: correctOrgRevenue },
            });

            console.log(`  ✅ Fixed!\n`);
            fixedCount++;
        }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total bookings checked: ${bookings.length}`);
    console.log(`Bookings fixed: ${fixedCount}`);

    await prisma.$disconnect();
}

backfillOrganizerRevenue().catch(console.error);
