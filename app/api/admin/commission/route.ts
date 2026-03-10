import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/client'
import { requireAdmin } from '@/lib/auth/route-auth'
import { z } from 'zod'

const commissionSettingSchema = z.object({
  organizerId: z.string().uuid(),
  commissionType: z.enum(['PERCENTAGE', 'FIXED']),
  commissionValue: z.number().min(0),
  minCommission: z.number().min(0).optional(),
  maxCommission: z.number().min(0).optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional()
})

export async function GET() {
  try {
    const authResult = await requireAdmin()

    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: { message: authResult.error } },
        { status: authResult.status }
      )
    }

    const settings = await prisma.commissionSetting.findMany({
      where: {
        organizerId: { not: null },
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching commission settings:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()

    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: { message: authResult.error } },
        { status: authResult.status }
      )
    }

    const body = await request.json()
    const validated = commissionSettingSchema.parse(body)

    await prisma.commissionSetting.updateMany({
      where: { organizerId: validated.organizerId, isActive: true },
      data: { isActive: false }
    })

    const setting = await prisma.commissionSetting.create({
      data: {
        organizerId: validated.organizerId,
        commissionType: validated.commissionType,
        commissionValue: validated.commissionValue,
        minCommission: validated.minCommission,
        maxCommission: validated.maxCommission,
        validFrom: validated.validFrom ? new Date(validated.validFrom) : null,
        validUntil: validated.validUntil ? new Date(validated.validUntil) : null
      }
    })

    return NextResponse.json({ success: true, data: setting })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation failed', details: error.issues } },
        { status: 400 }
      )
    }

    console.error('Error creating commission setting:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
