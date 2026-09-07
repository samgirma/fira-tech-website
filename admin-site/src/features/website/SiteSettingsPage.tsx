import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate, getRelativeTime, cn } from '../../lib/utils'
import {
  Sliders,
  Save,
  Check,
  Loader2,
  Share2,
  Star,
  Mail,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ExternalLink,
  CheckCircle2,
  X,
  MessageSquare,
} from 'lucide-react'

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'survey' | 'inbox'>('general')
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [socialLinks, setSocialLinks] = useState<any[]>([])
  const [feedback, setFeedback] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Survey generator state
  const [partnerName, setPartnerName] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Social link modal state
  const [showSocialModal, setShowSocialModal] = useState(false)
  const [editingSocial, setEditingSocial] = useState<any | null>(null)

  // General settings saving state
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      setIsLoading(true)
      const [settingsRes, socialRes, feedbackRes, messagesRes] = await Promise.allSettled([
        api.getSettings(),
        api.getSocialLinks(),
        api.getSatisfactionResponses(),
        api.getContactMessages(),
      ])

      if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value || {})
      if (socialRes.status === 'fulfilled') setSocialLinks(socialRes.value || [])
      if (feedbackRes.status === 'fulfilled') setFeedback(feedbackRes.value || [])
      if (messagesRes.status === 'fulfilled') setMessages(messagesRes.value || [])
    } catch (err) {
      console.error('Failed to load site settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSetting = async (key: string) => {
    try {
      setSavingKey(key)
      await api.updateSetting(key, settings[key] || '')
      setSavedKey(key)
      setTimeout(() => setSavedKey(null), 2500)
    } catch (err) {
      console.error('Failed to save setting:', err)
      alert('Failed to save setting.')
    } finally {
      setSavingKey(null)
    }
  }

  const handleGenerateSurveyLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerName.trim()) return

    try {
      setIsGenerating(true)
      const res = await api.generateSatisfactionLink(partnerName.trim())
      setGeneratedLink(res.surveyUrl || res.url || `https://firatech.systems/feedback?partner=${encodeURIComponent(partnerName.trim())}`)
    } catch (err) {
      console.error('Failed to generate survey link:', err)
      // Fallback
      setGeneratedLink(`https://firatech.systems/feedback?partner=${encodeURIComponent(partnerName.trim())}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveSocial = async (data: any) => {
    try {
      if (editingSocial) {
        await api.updateSocialLink(editingSocial.id, data)
      } else {
        await api.createSocialLink(data)
      }
      setShowSocialModal(false)
      setEditingSocial(null)
      const updated = await api.getSocialLinks()
      setSocialLinks(updated || [])
    } catch (err) {
      console.error('Failed to save social link:', err)
      alert('Failed to save social link.')
    }
  }

  const handleDeleteSocial = async (id: string) => {
    if (!confirm('Delete this social channel?')) return
    try {
      await api.deleteSocialLink(id)
      setSocialLinks((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error('Failed to delete social link:', err)
    }
  }

  const handleMarkMessageRead = async (id: string) => {
    try {
      await api.markContactRead(id)
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
      )
    } catch (err) {
      console.error('Failed to mark message read:', err)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="page-container flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-brand-600" />
      </div>
    )
  }

  const unreadMessagesCount = messages.filter((m) => !m.is_read).length

  return (
    <div className="page-container space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="page-title">Website Settings & Integrations</h1>
        <p className="page-subtitle">
          Configure site metadata, brand counters, social channels, and manage customer feedback
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('general')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'general'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <Sliders size={14} />
          <span>General & Stats</span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'social'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <Share2 size={14} />
          <span>Social Channels ({socialLinks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('survey')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'survey'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <Star size={14} />
          <span>Satisfaction Survey & Results ({feedback.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'inbox'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <Mail size={14} />
          <span>Contact Inbox</span>
          {unreadMessagesCount > 0 && (
            <span className="text-3xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold">
              {unreadMessagesCount} unread
            </span>
          )}
        </button>
      </div>

      {/* Tab: General & Counters */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Brand Details Card */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm text-surface-900 dark:text-surface-100">
              Corporate & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                  Company Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.site_name || 'Fira Tech Solutions'}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    className="input w-full"
                  />
                  <button
                    onClick={() => handleSaveSetting('site_name')}
                    disabled={savingKey === 'site_name'}
                    className="btn-primary text-xs px-3"
                  >
                    {savingKey === 'site_name' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                  Public Contact Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={settings.contact_email || 'contact@firatech.systems'}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    className="input w-full"
                  />
                  <button
                    onClick={() => handleSaveSetting('contact_email')}
                    disabled={savingKey === 'contact_email'}
                    className="btn-primary text-xs px-3"
                  >
                    {savingKey === 'contact_email' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                  Direct Phone
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={settings.contact_phone || '+251 911 000000'}
                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                    className="input w-full"
                  />
                  <button
                    onClick={() => handleSaveSetting('contact_phone')}
                    disabled={savingKey === 'contact_phone'}
                    className="btn-primary text-xs px-3"
                  >
                    {savingKey === 'contact_phone' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                  Office Location / Headquarters
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.contact_address || 'Bole, Addis Ababa, Ethiopia'}
                    onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                    className="input w-full"
                  />
                  <button
                    onClick={() => handleSaveSetting('contact_address')}
                    disabled={savingKey === 'contact_address'}
                    className="btn-primary text-xs px-3"
                  >
                    {savingKey === 'contact_address' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Metric Counters */}
          <div className="card p-6 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-surface-900 dark:text-surface-100">
                Public Website Stat Counters
              </h3>
              <p className="text-2xs text-surface-500 dark:text-surface-400">
                Verified figures rendered in the stats bar on the public landing page
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                  Years of Mastery
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.stat_years || '7+'}
                    onChange={(e) => setSettings({ ...settings, stat_years: e.target.value })}
                    className="input w-full"
                  />
                  <button onClick={() => handleSaveSetting('stat_years')} className="btn-primary text-xs px-2.5">
                    <Save size={12} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                  Sovereign Builds
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.stat_projects || '40+'}
                    onChange={(e) => setSettings({ ...settings, stat_projects: e.target.value })}
                    className="input w-full"
                  />
                  <button onClick={() => handleSaveSetting('stat_projects')} className="btn-primary text-xs px-2.5">
                    <Save size={12} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                  Uptime Guarantee
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.stat_uptime || '99.99%'}
                    onChange={(e) => setSettings({ ...settings, stat_uptime: e.target.value })}
                    className="input w-full"
                  />
                  <button onClick={() => handleSaveSetting('stat_uptime')} className="btn-primary text-xs px-2.5">
                    <Save size={12} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                  Client Satisfaction
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.stat_satisfaction || '100%'}
                    onChange={(e) => setSettings({ ...settings, stat_satisfaction: e.target.value })}
                    className="input w-full"
                  />
                  <button onClick={() => handleSaveSetting('stat_satisfaction')} className="btn-primary text-xs px-2.5">
                    <Save size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Social Channels */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingSocial(null)
                setShowSocialModal(true)
              }}
              className="btn-primary text-xs h-8 px-3 inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              Add Social Link
            </button>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/40 text-surface-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">URL</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {socialLinks.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-50/80 dark:hover:bg-surface-800/50">
                    <td className="py-3 px-4 font-bold text-surface-900 dark:text-surface-100 capitalize">
                      {s.platform}
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                      >
                        <span className="truncate max-w-xs">{s.url}</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'text-2xs px-2 py-0.5 rounded-full font-bold',
                        s.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-100 text-surface-600'
                      )}>
                        {s.active !== false ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingSocial(s)
                            setShowSocialModal(true)
                          }}
                          className="p-1 hover:bg-surface-100 rounded text-surface-400 hover:text-surface-700"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteSocial(s.id)}
                          className="p-1 hover:bg-red-50 rounded text-surface-400 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {socialLinks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-surface-400">
                      No social links added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Satisfaction Survey & Responses */}
      {activeTab === 'survey' && (
        <div className="space-y-6">
          {/* Link Generator */}
          <div className="card p-6 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-surface-900 dark:text-surface-100">
                Generate Partner Satisfaction Survey Link
              </h3>
              <p className="text-2xs text-surface-500 dark:text-surface-400">
                Create a bespoke feedback link to send to clients upon deliverable completion
              </p>
            </div>

            <form onSubmit={handleGenerateSurveyLink} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Client or Partner Name (e.g. BROS Technology)"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="input flex-1 text-xs"
              />
              <button
                type="submit"
                disabled={isGenerating || !partnerName.trim()}
                className="btn-primary text-xs h-9 px-4 shrink-0"
              >
                {isGenerating && <Loader2 size={13} className="animate-spin mr-1" />}
                Generate Link
              </button>
            </form>

            {generatedLink && (
              <div className="p-3 bg-brand-50 dark:bg-brand-950/60 rounded-xl border border-brand-200 dark:border-brand-900 flex items-center justify-between gap-3 animate-in fade-in">
                <span className="text-xs font-mono text-brand-800 dark:text-brand-300 truncate">
                  {generatedLink}
                </span>
                <button
                  onClick={() => copyToClipboard(generatedLink)}
                  className="btn-primary text-xs h-8 px-3 shrink-0 inline-flex items-center gap-1"
                >
                  {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            )}
          </div>

          {/* Feedback Submissions List */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm text-surface-900 dark:text-surface-100">
              Submitted Client Feedback ({feedback.length})
            </h3>

            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {feedback.map((item, idx) => (
                <div key={item.id || idx} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-surface-900 dark:text-surface-100">
                        {item.partner_name || item.name || 'Anonymous Client'}
                      </span>
                      {item.project_name && (
                        <span className="text-3xs text-surface-500 ml-2">
                          Project: {item.project_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 text-gold-500">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-surface-700 dark:text-surface-300 italic leading-relaxed">
                    "{item.feedback || item.comments || 'Great work!'}"
                  </p>

                  <div className="text-3xs text-surface-400">
                    Submitted: {formatDate(item.created_at || new Date().toISOString())}
                  </div>
                </div>
              ))}

              {feedback.length === 0 && (
                <div className="py-8 text-center text-xs text-surface-400">
                  No feedback responses submitted yet. Send a survey link above!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Contact Inbox */}
      {activeTab === 'inbox' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/40 text-surface-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Subject & Message</th>
                  <th className="py-3 px-4">Received</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={cn(
                      'hover:bg-surface-50/80 dark:hover:bg-surface-800/50 transition-colors',
                      !msg.is_read && 'bg-brand-50/30 dark:bg-brand-950/20'
                    )}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-surface-900 dark:text-surface-100 flex items-center gap-1.5">
                        {!msg.is_read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                        <span>{msg.name}</span>
                      </div>
                      <a href={`mailto:${msg.email}`} className="text-3xs text-surface-500 hover:underline">
                        {msg.email}
                      </a>
                    </td>

                    <td className="py-3 px-4 max-w-md">
                      {msg.subject && (
                        <div className="font-semibold text-surface-800 dark:text-surface-200 mb-0.5">
                          {msg.subject}
                        </div>
                      )}
                      <p className="text-surface-600 dark:text-surface-400 line-clamp-2">
                        {msg.message}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-surface-400 whitespace-nowrap">
                      {getRelativeTime(msg.created_at)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {!msg.is_read && (
                        <button
                          onClick={() => handleMarkMessageRead(msg.id)}
                          className="btn-outline text-2xs h-7 px-2.5"
                        >
                          Mark Read
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {messages.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-surface-400">
                      No inbound contact messages received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Social Link Modal */}
      {showSocialModal && (
        <SocialModal
          item={editingSocial || undefined}
          onSave={handleSaveSocial}
          onClose={() => {
            setShowSocialModal(false)
            setEditingSocial(null)
          }}
        />
      )}
    </div>
  )
}

function SocialModal({
  item,
  onSave,
  onClose,
}: {
  item?: any
  onSave: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [platform, setPlatform] = useState(item?.platform || 'github')
  const [url, setUrl] = useState(item?.url || '')
  const [active, setActive] = useState(item?.active ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    try {
      setIsSubmitting(true)
      await onSave({
        platform,
        url,
        active,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 w-full max-w-sm shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
          <h3 className="font-bold text-sm text-surface-900 dark:text-surface-100">
            {item ? 'Edit Social Link' : 'Add Social Channel'}
          </h3>
          <button onClick={onClose} className="p-1 text-surface-400 hover:text-surface-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="input w-full"
            >
              <option value="github">GitHub</option>
              <option value="linkedin">LinkedIn</option>
              <option value="x">X / Twitter</option>
              <option value="telegram">Telegram</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Profile URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="input w-full"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-surface-700 dark:text-surface-300 font-medium">
              Show in public footer & navigation
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100 dark:border-surface-800">
            <button type="button" onClick={onClose} className="btn-outline text-xs h-8 px-3">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs h-8 px-4">
              {isSubmitting && <Loader2 size={13} className="animate-spin mr-1" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
