import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TAX_RATE = 0.11; // 11%

async function backfillTaxAndTotal() {
    console.log('=== Backfill Tax Amount & Total ===\n');

    const bookings = await prisma.booking.findMany({
        where: { status: { in: ['CONFIRMED', 'PAID'] } },
        select: {
            id: true,
            bookingCode: true,
            subtotal: true,
            discountAmount: true,
            platformFee: true,
            paymentGatewayFee: true,
            taxAmount: true,
            totalAmount: true,
            organizerRevenue: true,
        },
    });

    console.log(`Found ${bookings.length} bookings to verify\n`);

    let fixedCount = 0;

    for (const booking of bookings) {
        const taxBase = Number(booking.subtotal) - Number(booking.discountAmount);
        const currentTax = Number(booking.taxAmount);
        const correctTax = Math.round(taxBase * TAX_RATE);

        // Calculate correct totalAmount (taxBase + tax, no platform fee added to customer price)
        // Based on calculatePricing: totalAmount = amountAfterTax = taxBase + taxAmount (for exclusive tax)
        const correctTotal = taxBase + correctTax;
        const currentTotal = Number(booking.totalAmount);

        if (Math.abs(currentTax - correctTax) > 0.01 || Math.abs(currentTotal - correctTotal) > 0.01) {
            console.log(`${booking.bookingCode}:`);
            console.log(`  Tax Base (subtotal): ${taxBase}`);
            console.log(`  Current Tax: ${currentTax} → Correct Tax: ${correctTax}`);
            console.log(`  Current Total: ${currentTotal} → Correct Total: ${correctTotal}`);

            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    taxAmount: correctTax,
                    totalAmount: correctTotal,
                },
            });

            console.log(`  ✅ Fixed!\n`);
            fixedCount++;
        }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total bookings checked: ${bookings.length}`);
    console.log(`Bookings fixed: ${fixedCount}`);

    // Show new totals
    const newAggregate = await prisma.booking.aggregate({
        where: { status: { in: ['CONFIRMED', 'PAID'] } },
        _sum: {
            totalAmount: true,
            subtotal: true,
            platformRevenue: true,
            organizerRevenue: true,
            taxAmount: true,
        },
    });

    const subtotal = Number(newAggregate._sum.subtotal || 0);
    const platformRev = Number(newAggregate._sum.platformRevenue || 0);
    const orgRev = Number(newAggregate._sum.organizerRevenue || 0);
    const tax = Number(newAggregate._sum.taxAmount || 0);
    const total = Number(newAggregate._sum.totalAmount || 0);

    console.log(`\n=== New Revenue Breakdown ===`);
    console.log(`Total Transactions: ${total}`);
    console.log(`Platform Revenue: ${platformRev} (${((platformRev / subtotal) * 100).toFixed(1)}% of subtotal)`);
    console.log(`Organizer Revenue: ${orgRev} (${((orgRev / subtotal) * 100).toFixed(1)}% of subtotal)`);
    console.log(`Tax Collected: ${tax} (${((tax / subtotal) * 100).toFixed(1)}% of subtotal)`);
    console.log(`\nVerification: Platform + Org + Tax = ${platformRev + orgRev + tax} (should ≈ ${total})`);

    await prisma.$disconnect();
}

backfillTaxAndTotal().catch(console.error);
