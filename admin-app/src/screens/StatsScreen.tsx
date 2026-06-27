import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert,
  Modal, KeyboardAvoidingView, Platform, Image,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../services/supabase'
import { colors, spacing, fonts } from '../constants/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://firatech.systems'

interface StatItem {
  id: string
  name: string
  description: string
  logo?: string
  location?: string
  website?: string
  preview?: string
  link?: string
}

interface StatCategory {
  id: string
  key: string
  label: string
  icon: string
  items: StatItem[]
}

const TABS = [
  { key: 'community_partners', label: 'Community Partners', icon: '👥' },
  { key: 'projects_delivered', label: 'Projects Delivered', icon: '📦' },
  { key: 'client_satisfaction', label: 'Client Satisfaction', icon: '⭐' },
]

let nextItemId = 200

function generateItemId(): string {
  return (nextItemId++).toString()
}

async function pickAndUploadImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) {
    Alert.alert('Permission denied', 'Gallery access is required to select images.')
    return null
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
    base64: true,
  })

  if (result.canceled || !result.assets[0]?.base64) return null

  const base64 = `data:${result.assets[0].mimeType || 'image/jpeg'};base64,${result.assets[0].base64}`

  try {
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { throw new Error(`Server returned: ${text.slice(0, 100)}`) }
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data.url
  } catch (error: any) {
    Alert.alert('Upload Error', error.message)
    return null
  }
}

export default function StatsScreen() {
  const [categories, setCategories] = useState<StatCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('community_partners')
  const [uploading, setUploading] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<{ categoryKey: string; item: StatItem | null } | null>(null)
  const [itemName, setItemName] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [itemLogo, setItemLogo] = useState('')
  const [itemLocation, setItemLocation] = useState('')
  const [itemWebsite, setItemWebsite] = useState('')
  const [itemPreview, setItemPreview] = useState('')
  const [itemLink, setItemLink] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'site_stats')
        .single()
      if (error) throw error
      const parsed = JSON.parse(data.value)
      setCategories(Array.isArray(parsed) ? parsed : [])
    } catch (error) {
      console.error('Error fetching stats:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  const saveStats = useCallback(async (newCategories: StatCategory[]) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token
    if (!token) return

    const res = await fetch(
      'https://dboquayegkmmkyjjsczv.supabase.co/rest/v1/settings?key=eq.site_stats',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${token}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          key: 'site_stats',
          value: JSON.stringify(newCategories),
        }),
      }
    )

    if (res.status === 404) {
      await fetch('https://dboquayegkmmkyjjsczv.supabase.co/rest/v1/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${token}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          key: 'site_stats',
          value: JSON.stringify(newCategories),
        }),
      })
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  const currentCategory = categories.find(c => c.key === activeTab)

  const resetForm = () => {
    setItemName('')
    setItemDescription('')
    setItemLogo('')
    setItemLocation('')
    setItemWebsite('')
    setItemPreview('')
    setItemLink('')
  }

  const openNewItemForm = () => {
    setEditingItem({ categoryKey: activeTab, item: null })
    resetForm()
    setShowForm(true)
  }

  const openEditItemForm = (item: StatItem) => {
    setEditingItem({ categoryKey: activeTab, item })
    setItemName(item.name)
    setItemDescription(item.description || '')
    setItemLogo(item.logo || '')
    setItemLocation(item.location || '')
    setItemWebsite(item.website || '')
    setItemPreview(item.preview || '')
    setItemLink(item.link || '')
    setShowForm(true)
  }

  const handlePickImage = async (field: 'logo' | 'preview') => {
    setUploading(true)
    const url = await pickAndUploadImage()
    if (url) {
      if (field === 'logo') setItemLogo(url)
      else setItemPreview(url)
    }
    setUploading(false)
  }

  const handleSaveItem = async () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Name is required')
      return
    }

    setSaving(true)
    try {
      const base: StatItem = {
        id: editingItem?.item?.id || generateItemId(),
        name: itemName.trim(),
        description: itemDescription.trim(),
      }

      if (activeTab === 'community_partners') {
        base.logo = itemLogo.trim()
        base.location = itemLocation.trim()
        base.website = itemWebsite.trim()
      } else if (activeTab === 'projects_delivered') {
        base.preview = itemPreview.trim()
        base.link = itemLink.trim()
      }

      const newCategories = categories.map(cat => {
        if (cat.key !== activeTab) return cat
        if (editingItem?.item) {
          return { ...cat, items: cat.items.map(i => i.id === editingItem.item!.id ? base : i) }
        }
        return { ...cat, items: [...cat.items, base] }
      })

      await saveStats(newCategories)
      setCategories(newCategories)
      setShowForm(false)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = (itemId: string) => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const newCategories = categories.map(cat => {
            if (cat.key !== activeTab) return cat
            return { ...cat, items: cat.items.filter(i => i.id !== itemId) }
          })
          await saveStats(newCategories)
          setCategories(newCategories)
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

  const showImageUpload = activeTab === 'community_partners' || activeTab === 'projects_delivered'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Site Stats</Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            <View style={styles.tabCount}>
              <Text style={styles.tabCountText}>
                {categories.find(c => c.key === tab.key)?.items.length || 0}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchStats} tintColor={colors.gold} />
        }
      >
        <TouchableOpacity style={styles.addBtn} onPress={openNewItemForm}>
          <Text style={styles.addBtnText}>+ Add {TABS.find(t => t.key === activeTab)?.label.slice(0, -1) || 'Item'}</Text>
        </TouchableOpacity>

        {!currentCategory || currentCategory.items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No items yet</Text>
            <Text style={styles.emptySubtitle}>Add your first item to this category</Text>
          </View>
        ) : (
          currentCategory.items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                ) : null}
                {activeTab === 'community_partners' && (
                  <Text style={styles.itemMeta}>
                    {[item.location, item.website].filter(Boolean).join(' · ') || 'No extra info'}
                  </Text>
                )}
                {activeTab === 'projects_delivered' && item.link && (
                  <Text style={styles.itemMeta} numberOfLines={1}>{item.link}</Text>
                )}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => openEditItemForm(item)} style={styles.actionBtn}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.actionBtn}>
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
            <Text style={styles.modalTitle}>
              {editingItem?.item ? 'Edit Item' : 'New Item'}
            </Text>
            <TouchableOpacity onPress={handleSaveItem} disabled={saving}>
              <Text style={styles.saveBtn}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={itemName}
              onChangeText={setItemName}
              placeholder={
                activeTab === 'community_partners' ? 'Organization name' :
                activeTab === 'projects_delivered' ? 'Project name' :
                'Client name'
              }
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={itemDescription}
              onChangeText={setItemDescription}
              placeholder={
                activeTab === 'community_partners' ? 'About the partnership...' :
                activeTab === 'projects_delivered' ? 'Project overview...' :
                'Testimonial text...'
              }
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {activeTab === 'community_partners' && (
              <>
                <Text style={styles.label}>Logo</Text>
                {itemLogo ? (
                  <Image source={{ uri: itemLogo }} style={styles.imagePreview} />
                ) : null}
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => handlePickImage('logo')}
                  disabled={uploading}
                >
                  <Text style={styles.uploadBtnText}>
                    {uploading ? 'Uploading...' : itemLogo ? 'Change Image' : 'Upload Logo'}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={itemLogo}
                  onChangeText={setItemLogo}
                  placeholder="Or paste image URL directly..."
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={itemLocation}
                  onChangeText={setItemLocation}
                  placeholder="e.g. Adama, Ethiopia"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>Website URL</Text>
                <TextInput
                  style={styles.input}
                  value={itemWebsite}
                  onChangeText={setItemWebsite}
                  placeholder="https://example.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </>
            )}

            {activeTab === 'projects_delivered' && (
              <>
                <Text style={styles.label}>Preview Image</Text>
                {itemPreview ? (
                  <Image source={{ uri: itemPreview }} style={styles.imagePreview} />
                ) : null}
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => handlePickImage('preview')}
                  disabled={uploading}
                >
                  <Text style={styles.uploadBtnText}>
                    {uploading ? 'Uploading...' : itemPreview ? 'Change Image' : 'Upload Preview'}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={itemPreview}
                  onChangeText={setItemPreview}
                  placeholder="Or paste image URL directly..."
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Project Link</Text>
                <TextInput
                  style={styles.input}
                  value={itemLink}
                  onChangeText={setItemLink}
                  placeholder="https://example.com/project"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </>
            )}
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.gold },
  tabIcon: { fontSize: 18, marginBottom: 2 },
  tabLabel: { fontSize: fonts.sizes.xs, color: colors.textSecondary, textAlign: 'center' },
  tabLabelActive: { color: colors.gold, fontWeight: '600' },
  tabCount: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginTop: 4,
  },
  tabCountText: { color: colors.textSecondary, fontSize: 10, fontWeight: '600' },
  list: { padding: spacing.lg },
  addBtn: {
    backgroundColor: colors.forest,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  addBtnText: { color: colors.text, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: spacing.xxl * 2 },
  emptyTitle: { fontSize: fonts.sizes.lg, color: colors.text, fontWeight: '600' },
  emptySubtitle: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: spacing.xs },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: { flex: 1 },
  itemName: { color: colors.text, fontWeight: '600', fontSize: fonts.sizes.md, marginBottom: spacing.xs },
  itemDesc: { color: colors.textSecondary, fontSize: fonts.sizes.sm },
  itemMeta: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: spacing.xs },
  itemActions: { flexDirection: 'row', gap: spacing.sm, marginLeft: spacing.sm },
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
  textArea: { minHeight: 100 },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceLight,
  },
  uploadBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  uploadBtnText: { color: colors.gold, fontWeight: '600' },
})
