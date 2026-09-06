import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, TextInput,
} from 'react-native'
import { supabase } from '../services/supabase'
import { colors, spacing, fonts } from '../constants/theme'

type ViewMode = 'channels' | 'inbox'

interface ContactEntry {
  label: string
  value: string
}

interface Platform {
  id: string
  name: string
  icon: string
  color: string
  bg: string
  hint: string
  entries: ContactEntry[]
}

const PLATFORMS: Omit<Platform, 'entries'>[] = [
  { id: 'telegram', name: 'Telegram', icon: '✈️', color: colors.gold, bg: '#1B4332', hint: 'https://t.me/username' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366', bg: '#1B4332', hint: 'https://wa.me/251...' },
  { id: 'phone', name: 'Phone', icon: '📞', color: '#4CAF50', bg: '#1B4332', hint: '+251...' },
  { id: 'email', name: 'Email', icon: '📧', color: colors.gold, bg: '#1B4332', hint: 'email@example.com' },
]

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export default function MessagesScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('channels')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Message | null>(null)
  const [saving, setSaving] = useState(false)
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null)
  const [editEntries, setEditEntries] = useState<ContactEntry[]>([])

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }, [])

  const fetchChannels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('settings').select('value').eq('key', 'contact_channels').single()
      if (error && error.code !== 'PGRST116') throw error
      const saved: ContactEntry[] = data?.value ? JSON.parse(data.value) : []
      setPlatforms(PLATFORMS.map(p => ({
        ...p,
        entries: saved.filter(e => e.label.toLowerCase() === p.id) || [],
      })))
    } catch (error) {
      console.error('Error fetching channels:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChannels()
    fetchMessages()
  }, [fetchChannels, fetchMessages])

  const saveChannels = async (allPlatforms: Platform[]) => {
    setSaving(true)
    try {
      const entries: ContactEntry[] = allPlatforms.flatMap(p =>
        p.entries.map(e => ({ label: p.id, value: e.value }))
      )
      const { error } = await supabase
        .from('settings').upsert({ key: 'contact_channels', value: JSON.stringify(entries) }, { onConflict: 'key' })
      if (error) throw error
      setPlatforms(allPlatforms)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setSaving(false)
    }
  }

  const openPlatform = (id: string) => {
    const p = platforms.find(x => x.id === id)
    setEditEntries(p ? [...p.entries] : [])
    setEditingPlatform(id)
  }

  const addEntry = () => {
    setEditEntries(prev => [...prev, { label: '', value: '' }])
  }

  const updateEntry = (index: number, field: 'label' | 'value', text: string) => {
    setEditEntries(prev => prev.map((e, i) => i === index ? { ...e, [field]: text } : e))
  }

  const removeEntry = (index: number) => {
    setEditEntries(prev => prev.filter((_, i) => i !== index))
  }

  const savePlatformEntries = async () => {
    const valid = editEntries.filter(e => e.value.trim())
    const updated = platforms.map(p =>
      p.id === editingPlatform ? { ...p, entries: valid } : p
    )
    await saveChannels(updated)
    setEditingPlatform(null)
  }

  const markRead = async (id: string) => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id)
    fetchMessages()
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete Message', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('contact_messages').delete().eq('id', id)
          setSelected(null)
          fetchMessages()
        },
      },
    ])
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    )
  }

  // --- Message detail ---
  if (selected) {
    const m = selected
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelected(null)}>
            <Text style={styles.navBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Message</Text>
          <TouchableOpacity onPress={() => handleDelete(m.id)}>
            <Text style={[styles.navBtn, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.detailContent}>
          {!m.is_read && (
            <TouchableOpacity style={styles.markBtn} onPress={() => { markRead(m.id); setSelected({ ...m, is_read: true }) }}>
              <Text style={styles.markBtnText}>Mark as Read</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.detailName}>{m.name}</Text>
          <Text style={styles.detailEmail}>{m.email}</Text>
          <Text style={styles.detailDate}>{new Date(m.created_at).toLocaleString()}</Text>
          <View style={styles.divider} />
          <Text style={styles.detailSubject}>{m.subject}</Text>
          <Text style={styles.detailMessage}>{m.message}</Text>
        </ScrollView>
      </View>
    )
  }

  // --- Platform editor ---
  if (editingPlatform) {
    const platform = platforms.find(p => p.id === editingPlatform)!
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setEditingPlatform(null)}>
            <Text style={styles.navBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{platform.icon} {platform.name}</Text>
          <TouchableOpacity onPress={savePlatformEntries} disabled={saving}>
            <Text style={styles.navBtn}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>
            Add multiple contacts for {platform.name}. Leave label empty for a single entry.
          </Text>

          {editEntries.map((entry, i) => (
            <View key={i} style={styles.entryCard}>
              <View style={styles.entryRow}>
                <TextInput
                  style={[styles.entryInput, { flex: 1, marginRight: spacing.sm }]}
                  value={entry.label}
                  onChangeText={t => updateEntry(i, 'label', t)}
                  placeholder="Label (e.g. Support)"
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity onPress={() => removeEntry(i)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.entryInput}
                value={entry.value}
                onChangeText={t => updateEntry(i, 'value', t)}
                placeholder={platform.hint}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addEntry}>
            <Text style={styles.addBtnText}>+ Add Contact</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }

  const unread = messages.filter(m => !m.is_read)
  const read = messages.filter(m => m.is_read)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'channels' && styles.toggleActive]}
          onPress={() => setViewMode('channels')}
        >
          <Text style={[styles.toggleText, viewMode === 'channels' && styles.toggleTextActive]}>
            Contact Channels
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'inbox' && styles.toggleActive]}
          onPress={() => setViewMode('inbox')}
        >
          <Text style={[styles.toggleText, viewMode === 'inbox' && styles.toggleTextActive]}>
            Inbox ({messages.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => { fetchChannels(); fetchMessages() }}
            tintColor={colors.gold}
          />
        }
      >
        {viewMode === 'channels' ? (
          <>
            <Text style={styles.sectionTitle}>Tap a platform to manage contacts</Text>
            {platforms.map(p => (
              <TouchableOpacity key={p.id} style={styles.platformCard} onPress={() => openPlatform(p.id)}>
                <View style={styles.platformLeft}>
                  <Text style={styles.platformIcon}>{p.icon}</Text>
                  <View>
                    <Text style={styles.platformName}>{p.name}</Text>
                    <Text style={styles.platformCount}>
                      {p.entries.length > 0
                        ? `${p.entries.length} contact${p.entries.length > 1 ? 's' : ''}`
                        : 'No contacts yet'}
                    </Text>
                  </View>
                </View>
                {p.entries.length > 0 && (
                  <View style={styles.contactPreview}>
                    {p.entries.slice(0, 2).map((e, i) => (
                      <Text key={i} style={styles.contactPreviewText} numberOfLines={1}>
                        {e.label ? `${e.label}: ` : ''}{e.value}
                      </Text>
                    ))}
                    {p.entries.length > 2 && (
                      <Text style={styles.contactPreviewMore}>+{p.entries.length - 2} more</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            {unread.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Unread ({unread.length})</Text>
                {unread.map(m => (
                  <TouchableOpacity key={m.id} style={styles.msgCard} onPress={() => setSelected(m)}>
                    <View style={styles.unreadDot} />
                    <View style={styles.msgInfo}>
                      <Text style={styles.msgName}>{m.name}</Text>
                      <Text style={styles.msgSubject} numberOfLines={1}>{m.subject}</Text>
                      <Text style={styles.msgPreview} numberOfLines={1}>{m.message}</Text>
                      <Text style={styles.msgDate}>{new Date(m.created_at).toLocaleString()}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
            <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
              Read ({read.length})
            </Text>
            {read.length === 0 && unread.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No messages yet</Text>
              </View>
            ) : (
              read.map(m => (
                <TouchableOpacity key={m.id} style={styles.msgCardRead} onPress={() => setSelected(m)}>
                  <View style={styles.msgInfo}>
                    <Text style={styles.msgName}>{m.name}</Text>
                    <Text style={styles.msgSubject} numberOfLines={1}>{m.subject}</Text>
                    <Text style={styles.msgPreview} numberOfLines={1}>{m.message}</Text>
                    <Text style={styles.msgDate}>{new Date(m.created_at).toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navBtn: { color: colors.gold, fontSize: fonts.sizes.md },
  title: { fontSize: fonts.sizes.xl, fontWeight: 'bold', color: colors.text },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: 8, alignItems: 'center' },
  toggleActive: { backgroundColor: colors.forest },
  toggleText: { color: colors.textMuted, fontWeight: '500', fontSize: fonts.sizes.sm },
  toggleTextActive: { color: colors.text },

  content: { padding: spacing.lg },

  // Channels
  sectionTitle: { fontSize: fonts.sizes.md, color: colors.textSecondary, marginBottom: spacing.lg },

  platformCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  platformLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  platformIcon: { fontSize: 28 },
  platformName: { color: colors.text, fontWeight: '600', fontSize: fonts.sizes.lg },
  platformCount: { color: colors.textMuted, fontSize: fonts.sizes.sm, marginTop: 2 },
  contactPreview: { marginTop: spacing.sm, marginLeft: 44 },
  contactPreviewText: { color: colors.textSecondary, fontSize: fonts.sizes.sm, marginBottom: 2 },
  contactPreviewMore: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: 2 },

  // Platform editor
  entryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  entryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  entryInput: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.sm,
    color: colors.text,
    fontSize: fonts.sizes.sm,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: { color: colors.error, fontWeight: 'bold', fontSize: fonts.sizes.sm },
  addBtn: {
    backgroundColor: colors.forest,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addBtnText: { color: colors.text, fontWeight: '600' },

  // Inbox
  sectionLabel: { fontSize: fonts.sizes.md, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  empty: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { color: colors.textMuted },
  msgCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgCardRead: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold, marginRight: spacing.sm },
  msgInfo: { flex: 1 },
  msgName: { color: colors.text, fontWeight: '600', marginBottom: 2 },
  msgSubject: { color: colors.textSecondary, fontSize: fonts.sizes.sm, marginBottom: 2 },
  msgPreview: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginBottom: 2 },
  msgDate: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: 4 },

  // Detail
  detailContent: { padding: spacing.lg },
  markBtn: {
    backgroundColor: colors.forest,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  markBtnText: { color: colors.text, fontWeight: '500' },
  detailName: { fontSize: fonts.sizes.xl, fontWeight: 'bold', color: colors.text },
  detailEmail: { color: colors.gold, fontSize: fonts.sizes.sm, marginTop: spacing.xs },
  detailDate: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  detailSubject: { fontSize: fonts.sizes.lg, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  detailMessage: { color: colors.textSecondary, lineHeight: 22 },
})
