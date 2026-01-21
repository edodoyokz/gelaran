'use client'

import { useState, useEffect, useCallback } from 'react'

interface CommissionSetting {
  id: string
  organizerId: string
  commissionType: 'PERCENTAGE' | 'FIXED'
  commissionValue: number
  minCommission?: number
  maxCommission?: number
  validFrom?: string
  validUntil?: string
  createdAt: string
}

export default function AdminCommissionPage() {
  const [settings, setSettings] = useState<CommissionSetting[]>([])
  const [organizerId, setOrganizerId] = useState('')
  const [commissionType, setCommissionType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE')
  const [commissionValue, setCommissionValue] = useState('')
  const [minCommission, setMinCommission] = useState('')
  const [maxCommission, setMaxCommission] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/commission')
      if (res.ok) {
        const data = await res.json()
        setSettings(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizerId,
          commissionType,
          commissionValue: parseFloat(commissionValue),
          minCommission: minCommission ? parseFloat(minCommission) : undefined,
          maxCommission: maxCommission ? parseFloat(maxCommission) : undefined
        })
      })

      if (res.ok) {
        setSuccess('Commission setting created successfully')
        setOrganizerId('')
        setCommissionValue('')
        setMinCommission('')
        setMaxCommission('')
        await fetchSettings()
      } else {
        const data = await res.json()
        setError(data.error?.message || 'Failed to create setting')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Commission Override Management</h1>

      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Commission Override</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="organizer-id" className="block text-sm font-medium mb-2">
              Organizer ID (UUID)
            </label>
            <input
              id="organizer-id"
              type="text"
              value={organizerId}
              onChange={(e) => setOrganizerId(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="commission-type" className="block text-sm font-medium mb-2">
              Commission Type
            </label>
            <select
              id="commission-type"
              value={commissionType}
              onChange={(e) => setCommissionType(e.target.value as 'PERCENTAGE' | 'FIXED')}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label htmlFor="commission-value" className="block text-sm font-medium mb-2">
              Commission Value {commissionType === 'PERCENTAGE' ? '(%)' : '(IDR)'}
            </label>
            <input
              id="commission-value"
              type="number"
              step="0.01"
              value={commissionValue}
              onChange={(e) => setCommissionValue(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="min-commission" className="block text-sm font-medium mb-2">
                Min Commission (IDR)
              </label>
              <input
                id="min-commission"
                type="number"
                step="0.01"
                value={minCommission}
                onChange={(e) => setMinCommission(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label htmlFor="max-commission" className="block text-sm font-medium mb-2">
                Max Commission (IDR)
              </label>
              <input
                id="max-commission"
                type="number"
                step="0.01"
                value={maxCommission}
                onChange={(e) => setMaxCommission(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Override'}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Overrides</h2>

        {settings.length === 0 && (
          <p className="text-gray-500">No commission overrides configured</p>
        )}

        {settings.map((setting) => (
          <div key={setting.id} className="border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Organizer ID:</span> {setting.organizerId}
              </div>
              <div>
                <span className="font-semibold">Type:</span> {setting.commissionType}
              </div>
              <div>
                <span className="font-semibold">Value:</span> {setting.commissionValue}
                {setting.commissionType === 'PERCENTAGE' ? '%' : ' IDR'}
              </div>
              {setting.minCommission && (
                <div>
                  <span className="font-semibold">Min:</span> {setting.minCommission} IDR
                </div>
              )}
              {setting.maxCommission && (
                <div>
                  <span className="font-semibold">Max:</span> {setting.maxCommission} IDR
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
