import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert,
} from 'react-native'
import { supabase } from '../services/supabase'
import { colors, spacing, fonts } from '../constants/theme'

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ contact_email: '' })

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*')
      if (error) throw error
      const map: Record<string, string> = {}
      for (const row of data || []) map[row.key] = row.value
      setSettings(map)
      setForm({ contact_email: map.contact_email || '' })
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'contact_email', value: form.contact_email }, { onConflict: 'key' })
      if (error) throw error
      Alert.alert('Saved', 'Contact email updated successfully')
      fetchSettings()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setSaving(false)
    }
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
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchSettings} tintColor={colors.gold} />
        }
      >
        <Text style={styles.sectionTitle}>Contact Information</Text>

        <Text style={styles.label}>Contact Email</Text>
        <TextInput
          style={styles.input}
          value={form.contact_email}
          onChangeText={(t) => setForm(prev => ({ ...prev, contact_email: t }))}
          placeholder="admin@example.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {settings.contact_email && (
          <Text style={styles.hint}>
            Currently set to: {settings.contact_email}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
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
  title: { fontSize: fonts.sizes.xl, fontWeight: 'bold', color: colors.text },
  content: { padding: spacing.lg },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  label: { color: colors.textSecondary, fontSize: fonts.sizes.sm, fontWeight: '500', marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text,
    fontSize: fonts.sizes.md,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textMuted,
    fontSize: fonts.sizes.xs,
    marginBottom: spacing.lg,
  },
  saveBtn: {
    backgroundColor: colors.forest,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: colors.text, fontWeight: '600', fontSize: fonts.sizes.md },
})
