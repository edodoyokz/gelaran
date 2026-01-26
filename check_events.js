const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEvents() {
    try {
        // Check events with seating chart
        const events = await prisma.event.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
                hasSeatingChart: true,
                venueSections: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        console.log('\n=== Events ===');
        events.forEach(event => {
            console.log(`\n${event.title} (${event.slug})`);
            console.log(`  Has Seating Chart: ${event.hasSeatingChart}`);
            console.log(`  Venue Sections: ${event.venueSections.length}`);
        });

        // Check device sessions
        const sessions = await prisma.eventDeviceSession.findMany({
            select: {
                id: true,
                sessionType: true,
                isActive: true,
                eventId: true,
            },
        });

        console.log('\n=== Device Sessions ===');
        sessions.forEach(session => {
            console.log(`\nSession ID: ${session.id}`);
            console.log(`  Type: ${session.sessionType}`);
            console.log(`  Active: ${session.isActive}`);
            console.log(`  Event ID: ${session.eventId}`);
        });

        // Check device access
        const deviceAccess = await prisma.deviceAccess.findMany({
            select: {
                id: true,
                deviceToken: true,
                isActive: true,
                staffName: true,
            },
        });

        console.log('\n=== Device Access ===');
        deviceAccess.forEach(access => {
            console.log(`\nID: ${access.id}`);
            console.log(`  Token: ${access.deviceToken}`);
            console.log(`  Active: ${access.isActive}`);
            console.log(`  Staff: ${access.staffName}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkEvents();
