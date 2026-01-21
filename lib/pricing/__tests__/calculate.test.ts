import { describe, test, expect } from '@jest/globals'
import { calculatePricing } from '../calculate'

describe('calculatePricing', () => {
  test('exclusive tax with percentage commission', () => {
    const result = calculatePricing({
      subtotal: 100000,
      discountAmount: 10000,
      taxRate: { rate: 11, type: 'PERCENTAGE', isInclusive: false },
      commission: { value: 5, type: 'PERCENTAGE' },
      paymentGatewayFeePercentage: 2.9
    })
    
    expect(result.taxBase).toBe(90000)
    expect(result.taxAmount).toBe(9900)
    expect(result.platformFee).toBe(4500)
    expect(result.totalAmount).toBe(99900)
  })
  
  test('inclusive tax', () => {
    const result = calculatePricing({
      subtotal: 111000,
      discountAmount: 0,
      taxRate: { rate: 11, type: 'PERCENTAGE', isInclusive: true },
      commission: { value: 5, type: 'PERCENTAGE' },
      paymentGatewayFeePercentage: 2.9
    })
    
    expect(result.taxAmount).toBe(11000)
    expect(result.totalAmount).toBe(111000)
  })
  
  test('commission with min cap', () => {
    const result = calculatePricing({
      subtotal: 10000,
      discountAmount: 0,
      taxRate: null,
      commission: { value: 5, type: 'PERCENTAGE', minCommission: 2000 },
      paymentGatewayFeePercentage: 2.9
    })
    
    expect(result.platformFee).toBe(2000)
  })
})
