import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/client'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const userRecord = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { role: true }
    })

    if (userRecord?.role !== 'ADMIN' && userRecord?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: { message: 'Admin access required' } },
        { status: 403 }
      )
    }

    const { id } = await params

    const commissionSetting = await prisma.commissionSetting.findUnique({
      where: { id }
    })

    if (!commissionSetting) {
      return NextResponse.json(
        { success: false, error: { message: 'Commission setting not found' } },
        { status: 404 }
      )
    }

    if (!commissionSetting.organizerId) {
      return NextResponse.json(
        { success: false, error: { message: 'Cannot delete global default commission' } },
        { status: 400 }
      )
    }

    await prisma.commissionSetting.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Custom commission override removed successfully' 
    })
  } catch (error) {
    console.error('Error deleting commission setting:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
