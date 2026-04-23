import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma/client'
import { ownsLocalUserResource } from '@/lib/auth/local-identity'
import { requireOrganizerContext } from '@/lib/auth/route-auth'

const FaqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(10),
  sortOrder: z.number().optional()
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireOrganizerContext()

    if ("error" in authContext) {
      return NextResponse.json({ error: authContext.error }, { status: authContext.status })
    }
    
    const { id } = await params
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })
    
    if (!event || !ownsLocalUserResource(event.organizerId, authContext)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(event.faqs)
    
  } catch (error) {
    console.error('Get FAQs error:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireOrganizerContext()

    if ("error" in authContext) {
      return NextResponse.json({ error: authContext.error }, { status: authContext.status })
    }
    
    const { id } = await params
    const event = await prisma.event.findUnique({
      where: { id }
    })
    
    if (!event || !ownsLocalUserResource(event.organizerId, authContext)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await req.json()
    const data = FaqSchema.parse(body)
    
    const faq = await prisma.eventFaq.create({
      data: {
        eventId: id,
        question: data.question,
        answer: data.answer,
        sortOrder: data.sortOrder || 0,
        isActive: true
      }
    })
    
    return NextResponse.json(faq)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Create FAQ error:', error)
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
  }
}
