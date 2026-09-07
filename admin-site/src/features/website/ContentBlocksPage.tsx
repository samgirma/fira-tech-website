import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import {
  Globe,
  Save,
  Check,
  Loader2,
  Sparkles,
  Layers,
  HelpCircle,
  Award,
} from 'lucide-react'

export default function ContentBlocksPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'process' | 'why_fira'>('hero')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const data = await api.getSettings()
      setSettings(data || {})
    } catch (err) {
      console.error('Failed to load content settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (key: string) => {
    try {
      setSavingKey(key)
      await api.updateSetting(key, settings[key] || '')
      setSavedKey(key)
      setTimeout(() => setSavedKey(null), 2500)
    } catch (err) {
      console.error('Failed to save content block:', err)
      alert('Failed to save changes.')
    } finally {
      setSavingKey(null)
    }
  }

  if (isLoading) {
    return (
      <div className="page-container flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="page-container space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="page-title">Website Content Blocks</h1>
        <p className="page-subtitle">
          Manage core public website messaging, hero headlines, company vision, and value propositions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-800 gap-6 text-xs font-semibold">
        {[
          { id: 'hero', label: 'Hero & Mission', icon: Sparkles },
          { id: 'about', label: 'About & Vision', icon: Globe },
          { id: 'process', label: '4-Step Process', icon: Layers },
          { id: 'why_fira', label: 'Why Fira Tech', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Hero Tab */}
      {activeTab === 'hero' && (
        <div className="space-y-4">
          <ContentField
            label="Hero Main Headline"
            settingKey="hero_headline"
            value={settings.hero_headline || 'Architecting Sovereign Digital Infrastructure'}
            description="The primary statement on the public landing page hero section."
            onChange={handleUpdate}
            onSave={handleSave}
            isSaving={savingKey === 'hero_headline'}
            isSaved={savedKey === 'hero_headline'}
          />

          <ContentField
            label="Hero Subheadline"
            settingKey="hero_subheadline"
            value={settings.hero_subheadline || 'We build ultra-resilient software systems, mission-critical cloud platforms, and custom AI ecosystems for enterprises that refuse compromise.'}
            description="Supporting narrative beneath the main hero headline."
            isTextarea
            onChange={handleUpdate}
            onSave={handleSave}
            isSaving={savingKey === 'hero_subheadline'}
            isSaved={savedKey === 'hero_subheadline'}
          />

          <ContentField
            label="Primary CTA Text"
            settingKey="hero_cta_primary"
            value={settings.hero_cta_primary || 'Start a Project'}
            description="Label on the primary gold accent button."
            onChange={handleUpdate}
            onSave={handleSave}
            isSaving={savingKey === 'hero_cta_primary'}
            isSaved={savedKey === 'hero_cta_primary'}
          />
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="space-y-4">
          <ContentField
            label="About Tagline"
            settingKey="about_tagline"
            value={settings.about_tagline || 'Deep Systems Engineering Meets Elite Product Craftsmanship'}
            description="Top heading of the About section."
            onChange={handleUpdate}
            onSave={handleSave}
            isSaving={savingKey === 'about_tagline'}
            isSaved={savedKey === 'about_tagline'}
          />

          <ContentField
            label="Founder Vision Narrative"
            settingKey="about_vision"
            value={settings.about_vision || 'Fira Tech was founded on a singular conviction: Africa and emerging global enterprises deserve sovereign, high-throughput software architectures built without technical debt.'}
            description="Vision statement explaining why Fira Tech exists."
            isTextarea
            onChange={handleUpdate}
            onSave={handleSave}
            isSaving={savingKey === 'about_vision'}
            isSaved={savedKey === 'about_vision'}
          />

          <ContentField
            label="The Oda Tree Heritage & Philosophy"
            settingKey="about_oda_philosophy"
            value={settings.about_oda_philosophy || 'Rooted in enduring Oromo traditions of assembly, shade, and wisdom under the sacred Oda tree, we build systems designed to shelter generations.'}
            description="Cultural grounding and brand symbolism."
            isTextarea
            onChange={handleUpdate}
            onSave={handleSave}
            isSaving={savingKey === 'about_oda_philosophy'}
            isSaved={savedKey === 'about_oda_philosophy'}
          />
        </div>
      )}

      {/* Process Tab */}
      {activeTab === 'process' && (
        <div className="space-y-4">
          <ContentField
            label="Step 1: Architectural Discovery"
            settingKey="process_step_1"
            value={settings.process_step_1 || 'Zero-compromise technical audit, data model design, and sovereign infrastructure roadmap.'}
            isTextarea
            onChange={handleUpdate}
            onSave={handleSave}
            isSaving={savingKey === 'process_step_1'}
            isSaved={savedKey === 'process_step_1'}
          />

          <ContentField
            label="Step 2: Rapid Sovereign Sprint"
            settingKey="process_step_2"
            value={settings.process_step_2 || 'Production prototype and scalable core engine delivered in compressed two-week cycles.'}
            isTextarea
            onChange={handleUpdate}
            onSave={handleSave}
            isSaving={savingKey === 'process_step_2'}
            isSaved={savedKey === 'process_step_2'}
          />

          <ContentField
            label="Step 3: Hardening & Compliance"
            settingKey="process_step_3"
            value={settings.process_step_3 || 'End-to-end security penetration testing, local regulatory compliance, and high-concurrency benchmarks.'}
            isTextarea
            onChange={handleUpdate}
            onSave={handleSave}
            isSaving={savingKey === 'process_step_3'}
            isSaved={savedKey === 'process_step_3'}
          />

          <ContentField
            label="Step 4: Sovereign Handover & Retainers"
            settingKey="process_step_4"
            value={settings.process_step_4 || 'Zero vendor lock-in. Full IP transfer, CI/CD automation, and optional architectural advisory retainers.'}
            isTextarea
            onChange={handleUpdate}
            onSave={handleSave}
            isSaving={savingKey === 'process_step_4'}
            isSaved={savedKey === 'process_step_4'}
          />
        </div>
      )}

      {/* Why Fira Tab */}
      {activeTab === 'why_fira' && (
        <div className="space-y-4">
          <ContentField
            label="Pillar 1: Direct Founder Accountability"
            settingKey="why_fira_pillar_1"
            value={settings.why_fira_pillar_1 || 'No account managers or junior middlemen. You collaborate directly with principal systems engineers.'}
            isTextarea
            onChange={handleUpdate}
            onSave={handleSave}
            isSaving={savingKey === 'why_fira_pillar_1'}
            isSaved={savedKey === 'why_fira_pillar_1'}
          />

          <ContentField
            label="Pillar 2: Sovereign IP Ownership"
            settingKey="why_fira_pillar_2"
            value={settings.why_fira_pillar_2 || 'Every line of code, Dockerfile, and database schema belongs 100% to your enterprise.'}
            isTextarea
            onChange={handleUpdate}
            onSave={handleSave}
            isSaving={savingKey === 'why_fira_pillar_2'}
            isSaved={savedKey === 'why_fira_pillar_2'}
          />

          <ContentField
            label="Pillar 3: Extreme Production Reliability"
            settingKey="why_fira_pillar_3"
            value={settings.why_fira_pillar_3 || 'Architectures designed for 99.99% uptime, graceful offline fallbacks, and resilient local payment bridges.'}
            isTextarea
            onChange={handleUpdate}
            onSave={handleSave}
            isSaving={savingKey === 'why_fira_pillar_3'}
            isSaved={savedKey === 'why_fira_pillar_3'}
          />
        </div>
      )}
    </div>
  )
}

function ContentField({
  label,
  settingKey,
  value,
  description,
  isTextarea,
  onChange,
  onSave,
  isSaving,
  isSaved,
}: {
  label: string
  settingKey: string
  value: string
  description?: string
  isTextarea?: boolean
  onChange: (key: string, val: string) => void
  onSave: (key: string) => void
  isSaving: boolean
  isSaved: boolean
}) {
  return (
    <div className="card p-5 space-y-2.5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label className="block text-xs font-bold text-surface-900 dark:text-surface-100">
            {label}
          </label>
          {description && (
            <p className="text-2xs text-surface-500 dark:text-surface-400 mt-0.5">
              {description}
            </p>
          )}
        </div>

        <button
          onClick={() => onSave(settingKey)}
          disabled={isSaving}
          className="btn-primary text-xs h-8 px-3 shrink-0 inline-flex items-center gap-1.5"
        >
          {isSaving ? (
            <Loader2 size={12} className="animate-spin" />
          ) : isSaved ? (
            <Check size={12} className="text-white" />
          ) : (
            <Save size={12} />
          )}
          <span>{isSaved ? 'Saved!' : 'Save Block'}</span>
        </button>
      </div>

      {isTextarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(settingKey, e.target.value)}
          className="input w-full text-xs resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(settingKey, e.target.value)}
          className="input w-full text-xs"
        />
      )}
    </div>
  )
}
