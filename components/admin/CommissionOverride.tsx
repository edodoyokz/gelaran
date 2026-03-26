'use client'

import { useState, useEffect, useCallback } from 'react'
import { Percent, Save, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast-provider'

interface CommissionSetting {
  id: string
  commissionType: 'PERCENTAGE' | 'FIXED'
  commissionValue: number
  minCommission?: number
  maxCommission?: number
  isActive: boolean
  createdAt: string
}

interface CommissionOverrideProps {
  organizerId: string
  organizationName: string
}

export function CommissionOverride({ organizerId, organizationName }: CommissionOverrideProps) {
  const { showToast } = useToast()
  const [globalDefault, setGlobalDefault] = useState<number>(5)
  const [currentSetting, setCurrentSetting] = useState<CommissionSetting | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [commissionType, setCommissionType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE')
  const [commissionValue, setCommissionValue] = useState('')
  const [minCommission, setMinCommission] = useState('')
  const [maxCommission, setMaxCommission] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const [settingsRes, globalRes] = await Promise.all([
        fetch('/api/admin/commission'),
        fetch('/api/admin/settings/commission')
      ])

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        const organizerSetting = data.data?.find((s: CommissionSetting) => s.id === organizerId)
        setCurrentSetting(organizerSetting || null)
        
        if (organizerSetting) {
          setCommissionType(organizerSetting.commissionType)
          setCommissionValue(String(organizerSetting.commissionValue))
          setMinCommission(String(organizerSetting.minCommission || ''))
          setMaxCommission(String(organizerSetting.maxCommission || ''))
        }
      }

      if (globalRes.ok) {
        const globalData = await globalRes.json()
        setGlobalDefault(globalData.data?.commissionValue || 5)
      }
    } catch (error) {
      console.error('Failed to fetch commission data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [organizerId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = async () => {
    try {
      setIsSaving(true)

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
        showToast('Commission override saved successfully', 'success')
        await fetchData()
        setIsEditing(false)
      } else {
        const data = await res.json()
        showToast(data.error?.message || 'Failed to save commission', 'error')
      }
    } catch (_error) {
      showToast('Network error', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset to global default? This will remove the custom commission for this organizer.')) {
      return
    }

    try {
      setIsSaving(true)
      
      const res = await fetch(`/api/admin/commission/${currentSetting?.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        showToast('Commission reset to global default', 'success')
        await fetchData()
        setIsEditing(false)
      } else {
        showToast('Failed to reset commission', 'error')
      }
    } catch (_error) {
      showToast('Network error', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Percent className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Commission Settings</h3>
            <p className="text-sm text-gray-500">Custom commission for {organizationName}</p>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Edit Commission
          </button>
        )}
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Global Default Commission</p>
            <p className="text-xs text-blue-700 mt-1">
              Platform default is <strong>{globalDefault}%</strong> of subtotal. 
              You can override this for specific organizers below.
            </p>
          </div>
        </div>
      </div>

      {currentSetting && !isEditing ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Custom Commission Active</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">{currentSetting.commissionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Value:</span>
                    <span className="font-medium">
                      {currentSetting.commissionValue}{currentSetting.commissionType === 'PERCENTAGE' ? '%' : ' IDR'}
                    </span>
                  </div>
                  {currentSetting.minCommission && (
                    <div className="flex justify-between">
                      <span>Minimum:</span>
                      <span className="font-medium">Rp {currentSetting.minCommission.toLocaleString()}</span>
                    </div>
                  )}
                  {currentSetting.maxCommission && (
                    <div className="flex justify-between">
                      <span>Maximum:</span>
                      <span className="font-medium">Rp {currentSetting.maxCommission.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Reset to Global Default
          </button>
        </div>
      ) : isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="commission-type" className="block text-sm font-medium text-gray-700 mb-2">
              Commission Type
            </label>
            <select
              id="commission-type"
              value={commissionType}
              onChange={(e) => setCommissionType(e.target.value as 'PERCENTAGE' | 'FIXED')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount (IDR)</option>
            </select>
          </div>

          <div>
            <label htmlFor="commission-value" className="block text-sm font-medium text-gray-700 mb-2">
              Commission Value {commissionType === 'PERCENTAGE' ? '(%)' : '(IDR)'}
            </label>
            <input
              id="commission-value"
              type="number"
              step="0.01"
              value={commissionValue}
              onChange={(e) => setCommissionValue(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={commissionType === 'PERCENTAGE' ? '5' : '10000'}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="min-commission" className="block text-sm font-medium text-gray-700 mb-2">
                Min Commission (IDR)
              </label>
              <input
                id="min-commission"
                type="number"
                step="0.01"
                value={minCommission}
                onChange={(e) => setMinCommission(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional"
              />
            </div>
            <div>
              <label htmlFor="max-commission" className="block text-sm font-medium text-gray-700 mb-2">
                Max Commission (IDR)
              </label>
              <input
                id="max-commission"
                type="number"
                step="0.01"
                value={maxCommission}
                onChange={(e) => setMaxCommission(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !commissionValue}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Commission
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                if (currentSetting) {
                  setCommissionType(currentSetting.commissionType)
                  setCommissionValue(String(currentSetting.commissionValue))
                  setMinCommission(String(currentSetting.minCommission || ''))
                  setMaxCommission(String(currentSetting.maxCommission || ''))
                } else {
                  setCommissionType('PERCENTAGE')
                  setCommissionValue('')
                  setMinCommission('')
                  setMaxCommission('')
                }
              }}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No custom commission set</p>
          <p className="text-sm text-gray-400 mb-6">
            Using global default: <strong>{globalDefault}%</strong>
          </p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Set Custom Commission
          </button>
        </div>
      )}
    </div>
  )
}
