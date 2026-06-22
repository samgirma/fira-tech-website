import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert,
  Modal, KeyboardAvoidingView, Platform, Switch,
} from 'react-native'
import { supabase } from '../services/supabase'
import { colors, spacing, fonts } from '../constants/theme'

interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string
  label: string
  sort_order: number
  is_active: boolean
  created_at: string
}

const PLATFORM_OPTIONS = [
  { value: 'github', label: 'GitHub', icon: 'Github' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'Linkedin' },
  { value: 'telegram', label: 'Telegram', icon: 'Send' },
  { value: 'twitter', label: 'Twitter / X', icon: 'Twitter' },
  { value: 'youtube', label: 'YouTube', icon: 'Youtube' },
  { value: 'facebook', label: 'Facebook', icon: 'Facebook' },
  { value: 'instagram', label: 'Instagram', icon: 'Instagram' },
  { value: 'website', label: 'Website', icon: 'Globe' },
]

export default function SocialLinksScreen() {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SocialLink | null>(null)
  const [platform, setPlatform] = useState('')
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      setLinks(data || [])
    } catch (error) {
      console.error('Error fetching social links:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLinks() }, [])

  const openNewForm = () => {
    setEditing(null)
    setPlatform('')
    setUrl('')
    setLabel('')
    setSortOrder('0')
    setIsActive(true)
    setShowForm(true)
  }

  const openEditForm = (link: SocialLink) => {
    setEditing(link)
    setPlatform(link.platform)
    setUrl(link.url)
    setLabel(link.label)
    setSortOrder(link.sort_order.toString())
    setIsActive(link.is_active)
    setShowForm(true)
  }

  const getLabelForPlatform = (p: string) => {
    const opt = PLATFORM_OPTIONS.find(o => o.value === p)
    return opt ? opt.label : p
  }

  const getIconForPlatform = (p: string) => {
    const opt = PLATFORM_OPTIONS.find(o => o.value === p)
    return opt ? opt.icon : 'Globe'
  }

  const handleSave = async () => {
    if (!platform.trim() || !url.trim() || !label.trim()) {
      Alert.alert('Error', 'Platform, URL, and Label are required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        platform: platform.toLowerCase(),
        url,
        label,
        icon: getIconForPlatform(platform),
        sort_order: parseInt(sortOrder) || 0,
        is_active: isActive,
      }

      if (editing) {
        const { error } = await supabase
          .from('social_links')
          .update(payload)
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('social_links')
          .insert(payload)
        if (error) throw error
      }

      setShowForm(false)
      fetchLinks()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete Social Link', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('social_links').delete().eq('id', id)
          fetchLinks()
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Social Links</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openNewForm}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchLinks} tintColor={colors.gold} />
        }
      >
        {links.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No social links yet</Text>
            <Text style={styles.emptySubtitle}>Add your first social media link</Text>
          </View>
        ) : (
          links.map((link) => (
            <View key={link.id} style={styles.linkCard}>
              <View style={styles.linkInfo}>
                <Text style={styles.linkPlatform}>{getLabelForPlatform(link.platform)}</Text>
                <Text style={styles.linkUrl} numberOfLines={1}>{link.url}</Text>
                <Text style={styles.linkMeta}>
                  {link.label} · Order: {link.sort_order} · {link.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <View style={styles.linkActions}>
                <TouchableOpacity onPress={() => openEditForm(link)} style={styles.actionBtn}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(link.id)} style={styles.actionBtn}>
                  <Text style={[styles.actionText, { color: colors.error }]}>Del</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={styles.modal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Text style={styles.cancelBtn}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Edit Social Link' : 'New Social Link'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text style={styles.saveBtn}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.label}>Platform</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformPicker}>
              {PLATFORM_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.platformChip,
                    platform === opt.value && styles.platformChipActive,
                  ]}
                  onPress={() => {
                    setPlatform(opt.value)
                    if (!editing) setLabel(opt.label)
                  }}
                >
                  <Text
                    style={[
                      styles.platformChipText,
                      platform === opt.value && styles.platformChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>URL</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Label</Text>
            <TextInput
              style={styles.input}
              value={label}
              onChangeText={setLabel}
              placeholder="Display label"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Sort Order</Text>
            <TextInput
              style={styles.input}
              value={sortOrder}
              onChangeText={setSortOrder}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />

            <View style={styles.switchRow}>
              <Text style={styles.label}>Active</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: colors.surfaceLight, true: colors.forest }}
                thumbColor={isActive ? colors.gold : colors.textMuted}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
  title: { fontSize: fonts.sizes.xl, fontWeight: 'bold', color: colors.text },
  addBtn: {
    backgroundColor: colors.forest,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addBtnText: { color: colors.text, fontWeight: '600' },
  list: { padding: spacing.lg },
  empty: { alignItems: 'center', paddingTop: spacing.xxl * 2 },
  emptyTitle: { fontSize: fonts.sizes.lg, color: colors.text, fontWeight: '600' },
  emptySubtitle: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: spacing.xs },
  linkCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkInfo: { flex: 1 },
  linkPlatform: { color: colors.text, fontWeight: '600', marginBottom: spacing.xs },
  linkUrl: { color: colors.textSecondary, fontSize: fonts.sizes.sm, marginBottom: spacing.xs },
  linkMeta: { color: colors.textMuted, fontSize: fonts.sizes.xs },
  linkActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { padding: spacing.sm },
  actionText: { color: colors.gold, fontWeight: '500' },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelBtn: { color: colors.textSecondary, fontSize: fonts.sizes.md },
  modalTitle: { fontSize: fonts.sizes.lg, fontWeight: 'bold', color: colors.text },
  saveBtn: { color: colors.gold, fontSize: fonts.sizes.md, fontWeight: '600' },
  modalContent: { padding: spacing.lg },
  label: { color: colors.text, fontSize: fonts.sizes.sm, fontWeight: '500', marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text,
    fontSize: fonts.sizes.md,
    marginBottom: spacing.md,
  },
  platformPicker: { marginBottom: spacing.md },
  platformChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  platformChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forestLight,
  },
  platformChipText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
  },
  platformChipTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
})
