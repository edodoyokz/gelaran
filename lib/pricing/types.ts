import { TaxType, CommissionType } from '@prisma/client'

export interface PricingInput {
  subtotal: number
  discountAmount: number
  taxRate: {
    rate: number
    type: TaxType
    isInclusive: boolean
  } | null
  commission: {
    value: number
    type: CommissionType
    minCommission?: number
    maxCommission?: number
  } | null
  paymentGatewayFeePercentage: number // e.g., 2.9% for Midtrans
}

export interface PricingBreakdown {
  subtotal: number
  discountAmount: number
  taxBase: number // DPP (after discount, before tax)
  taxAmount: number
  taxLabel: string
  platformFee: number
  paymentGatewayFee: number
  totalAmount: number
  organizerRevenue: number
  platformRevenue: number
}
