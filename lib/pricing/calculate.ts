import type { PricingInput, PricingBreakdown } from './types'

export function calculatePricing(input: PricingInput): PricingBreakdown {
  const { subtotal, discountAmount, taxRate, commission, paymentGatewayFeePercentage } = input
  
  const taxBase = Math.max(0, subtotal - discountAmount)
  
  let taxAmount = 0
  let taxLabel = 'No Tax'
  
  if (taxRate) {
    if (taxRate.type === 'PERCENTAGE') {
      if (taxRate.isInclusive) {
        taxAmount = Math.round(taxBase - (taxBase / (1 + taxRate.rate / 100)))
        taxLabel = `Tax (${taxRate.rate}% incl.)`
      } else {
        taxAmount = Math.round(taxBase * taxRate.rate / 100)
        taxLabel = `Tax (${taxRate.rate}%)`
      }
    } else {
      taxAmount = taxRate.rate
      taxLabel = 'Tax (fixed)'
    }
  }
  
  const amountAfterTax = taxRate?.isInclusive ? taxBase : taxBase + taxAmount
  
  let platformFee = 0
  
  if (commission) {
    if (commission.type === 'PERCENTAGE') {
      platformFee = Math.round(taxBase * commission.value / 100)
    } else {
      platformFee = commission.value
    }
    
    if (commission.minCommission && platformFee < commission.minCommission) {
      platformFee = commission.minCommission
    }
    if (commission.maxCommission && platformFee > commission.maxCommission) {
      platformFee = commission.maxCommission
    }
  }
  
  const paymentGatewayFee = Math.round(amountAfterTax * paymentGatewayFeePercentage / 100)
  
  const totalAmount = amountAfterTax
  
  const platformRevenue = platformFee
  const organizerRevenue = taxBase - platformFee - paymentGatewayFee
  
  return {
    subtotal,
    discountAmount,
    taxBase,
    taxAmount,
    taxLabel,
    platformFee,
    paymentGatewayFee,
    totalAmount,
    organizerRevenue,
    platformRevenue
  }
}
