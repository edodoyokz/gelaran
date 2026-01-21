import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma/client'
import { calculatePricing } from '@/lib/pricing/calculate'
import { DEFAULT_PAYMENT_GATEWAY_FEE_PERCENTAGE, DEFAULT_PLATFORM_FEE_PERCENTAGE } from '@/lib/pricing/constants'

const QuoteSchema = z.object({
  eventId: z.string().uuid(),
  tickets: z.array(z.object({
    ticketTypeId: z.string().uuid(),
    quantity: z.number().int().min(1)
  })),
  seatIds: z.array(z.string().uuid()).optional(),
  promoCode: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = QuoteSchema.parse(body)
    
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      include: {
        ticketTypes: true
      }
    })
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    
    let subtotal = 0
    
    for (const ticket of data.tickets) {
      const ticketType = event.ticketTypes.find(t => t.id === ticket.ticketTypeId)
      if (!ticketType) {
        return NextResponse.json({ error: `Ticket type ${ticket.ticketTypeId} not found` }, { status: 400 })
      }
      subtotal += Number(ticketType.basePrice) * ticket.quantity
    }
    
    let discountAmount = 0
    
    if (data.promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: data.promoCode, isActive: true }
      })
      
      if (promo && new Date() >= promo.validFrom && new Date() <= promo.validUntil) {
        if (promo.discountType === 'PERCENTAGE') {
          discountAmount = Math.round(subtotal * Number(promo.discountValue) / 100)
          if (promo.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, Number(promo.maxDiscountAmount))
          }
        } else {
          discountAmount = Number(promo.discountValue)
        }
      }
    }
    
    const defaultTaxRate = await prisma.taxRate.findFirst({
      where: { isDefault: true, isActive: true }
    })
    
    let commissionSetting = await prisma.commissionSetting.findFirst({
      where: {
        eventId: event.id,
        isActive: true,
        OR: [
          { validFrom: null },
          { validFrom: { lte: new Date() } }
        ],
        AND: [
          {
            OR: [
              { validUntil: null },
              { validUntil: { gte: new Date() } }
            ]
          }
        ]
      }
    })
    
    if (!commissionSetting) {
      commissionSetting = await prisma.commissionSetting.findFirst({
        where: {
          organizerId: event.organizerId,
          isActive: true
        }
      })
    }
    
    const pricing = calculatePricing({
      subtotal,
      discountAmount,
      taxRate: defaultTaxRate ? {
        rate: Number(defaultTaxRate.rate),
        type: defaultTaxRate.taxType,
        isInclusive: defaultTaxRate.isInclusive
      } : null,
      commission: commissionSetting ? {
        value: Number(commissionSetting.commissionValue),
        type: commissionSetting.commissionType,
        minCommission: commissionSetting.minCommission ? Number(commissionSetting.minCommission) : undefined,
        maxCommission: commissionSetting.maxCommission ? Number(commissionSetting.maxCommission) : undefined
      } : {
        value: DEFAULT_PLATFORM_FEE_PERCENTAGE,
        type: 'PERCENTAGE'
      },
      paymentGatewayFeePercentage: DEFAULT_PAYMENT_GATEWAY_FEE_PERCENTAGE
    })
    
    return NextResponse.json(pricing)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Pricing quote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
