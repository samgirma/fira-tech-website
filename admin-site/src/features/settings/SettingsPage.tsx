import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { cn } from '../../lib/utils'
import { Settings, Loader2, Save, Check } from 'lucide-react'

interface Setting {
  key: string
  value: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const data = await api.getSettings()
      const entries = Object.entries(data).map(([key, value]) => ({ key, value: String(value) }))
      setSettings(entries)
      const formObj: Record<string, string> = {}
      entries.forEach((s) => { formObj[s.key] = s.value })
      setForm(formObj)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (key: string) => {
    setSaving(key)
    try {
      await api.updateSetting(key, form[key] || '')
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
    } catch (error) {
      console.error('Failed to save setting:', error)
    } finally {
      setSaving(null)
    }
  }

  const groupedSettings = settings.reduce((acc, s) => {
    const group = s.key.split('_')[0] || 'general'
    if (!acc[group]) acc[group] = []
    acc[group].push(s)
    return acc
  }, {} as Record<string, Setting[]>)

  return (
    <div className="page-container max-w-3xl">
      <div className="mb-6">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your platform settings</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="text-surface-400 animate-spin" />
        </div>
      )}

      {!isLoading && settings.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
              <Settings size={24} className="text-surface-400" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No settings configured</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Settings will appear here as they are added to the system.
            </p>
          </div>
        </div>
      )}

      {!isLoading && Object.entries(groupedSettings).map(([group, items]) => (
        <div key={group} className="card mb-4">
          <div className="card-header">
            <h2 className="font-semibold text-surface-900 capitalize">{group.replace(/-/g, ' ')}</h2>
          </div>
          <div className="card-content space-y-4">
            {items.map((setting) => (
              <div key={setting.key} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    {setting.key}
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form[setting.key] || ''}
                    onChange={(e) => setForm({ ...form, [setting.key]: e.target.value })}
                  />
                </div>
                <button
                  onClick={() => handleSave(setting.key)}
                  disabled={saving === setting.key || form[setting.key] === setting.value}
                  className={cn(
                    'mt-6 p-2 rounded-lg transition-colors',
                    saved === setting.key
                      ? 'bg-green-100 text-green-600'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  )}
                >
                  {saving === setting.key ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : saved === setting.key ? (
                    <Check size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
