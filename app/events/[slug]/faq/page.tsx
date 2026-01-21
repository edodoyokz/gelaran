import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma/client'

export default async function EventFaqPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await prisma.event.findUnique({
    where: { slug, deletedAt: null },
    include: {
      faqs: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })
  
  if (!event) {
    notFound()
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{event.title} - FAQ</h1>
        <p className="text-gray-600 mb-8">
          Frequently Asked Questions
        </p>
        
        {event.faqs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No FAQ available for this event yet.
          </div>
        ) : (
          <div className="space-y-6">
            {event.faqs.map((faq, index) => (
              <div key={faq.id} className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {index + 1}. {faq.question}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2">Still have questions?</h4>
          <p className="text-gray-700 mb-4">
            If you can&apos;t find the answer you&apos;re looking for, contact our support team.
          </p>
          <a
            href="mailto:support@gelaran.id"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
