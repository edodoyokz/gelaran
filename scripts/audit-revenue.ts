import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditRevenueBreakdown() {
    console.log('=== Revenue Breakdown Audit ===\n');

    // Get aggregate data for confirmed/paid bookings
    const aggregate = await prisma.booking.aggregate({
        where: { status: { in: ['CONFIRMED', 'PAID'] } },
        _sum: {
            totalAmount: true,
            platformRevenue: true,
            organizerRevenue: true,
            paymentGatewayFee: true,
            taxAmount: true,
            platformFee: true,
            subtotal: true,
            discountAmount: true,
        },
        _count: true,
    });

    console.log('Total Bookings:', aggregate._count);
    console.log('Total Amount (sum):', Number(aggregate._sum.totalAmount || 0));
    console.log('Subtotal (sum):', Number(aggregate._sum.subtotal || 0));
    console.log('Discount (sum):', Number(aggregate._sum.discountAmount || 0));
    console.log('Platform Fee (sum):', Number(aggregate._sum.platformFee || 0));
    console.log('Platform Revenue (sum):', Number(aggregate._sum.platformRevenue || 0));
    console.log('Organizer Revenue (sum):', Number(aggregate._sum.organizerRevenue || 0));
    console.log('Payment Gateway Fee (sum):', Number(aggregate._sum.paymentGatewayFee || 0));
    console.log('Tax Amount (sum):', Number(aggregate._sum.taxAmount || 0));

    // Check if gatewayFee is always 0 or has some values
    const withGatewayFee = await prisma.booking.count({
        where: {
            status: { in: ['CONFIRMED', 'PAID'] },
            paymentGatewayFee: { gt: 0 },
        },
    });
    console.log('\nBookings with Gateway Fee > 0:', withGatewayFee);

    // Sample some bookings for detail
    const sampleBookings = await prisma.booking.findMany({
        where: { status: { in: ['CONFIRMED', 'PAID'] } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            bookingCode: true,
            subtotal: true,
            totalAmount: true,
            platformFee: true,
            platformRevenue: true,
            organizerRevenue: true,
            paymentGatewayFee: true,
            taxAmount: true,
            salesChannel: true,
        },
    });

    console.log('\n=== Sample Bookings ===');
    for (const b of sampleBookings) {
        console.log(`\n${b.bookingCode} (${b.salesChannel}):`);
        console.log(`  Subtotal: ${Number(b.subtotal)}`);
        console.log(`  Tax: ${Number(b.taxAmount)}`);
        console.log(`  Total: ${Number(b.totalAmount)}`);
        console.log(`  Platform Fee: ${Number(b.platformFee)}`);
        console.log(`  Platform Revenue: ${Number(b.platformRevenue)}`);
        console.log(`  Organizer Revenue: ${Number(b.organizerRevenue)}`);
        console.log(`  Gateway Fee: ${Number(b.paymentGatewayFee)}`);

        // Verify formula
        const taxBase = Number(b.subtotal);
        const calculatedOrgRevenue = taxBase - Number(b.platformFee) - Number(b.paymentGatewayFee);
        console.log(`  Expected Org Revenue (taxBase - platformFee - gatewayFee): ${calculatedOrgRevenue}`);
    }

    await prisma.$disconnect();
}

auditRevenueBreakdown().catch(console.error);
