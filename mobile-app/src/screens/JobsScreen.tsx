import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert,
  Modal, KeyboardAvoidingView, Platform, Switch,
} from 'react-native'
import { supabase } from '../services/supabase'
import { colors, spacing, fonts } from '../constants/theme'

interface Job {
  id: string
  title: string
  description: string
  department: string
  location: string
  type: string
  experience: string
  remote: boolean
  is_active: boolean
  created_at: string
}

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Job | null>(null)
  const [form, setForm] = useState({ title: '', description: '', department: '', location: '', type: 'FULL_TIME', experience: 'ENTRY', remote: false })
  const [saving, setSaving] = useState(false)

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchJobs() }, [])

  const resetForm = () => setForm({ title: '', description: '', department: '', location: '', type: 'FULL_TIME', experience: 'ENTRY', remote: false })

  const openNewForm = () => { setEditing(null); resetForm(); setShowForm(true) }

  const openEditForm = (job: Job) => {
    setEditing(job)
    setForm({ title: job.title, description: job.description, department: job.department, location: job.location, type: job.type, experience: job.experience, remote: job.remote })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.description || !form.department || !form.location) {
      Alert.alert('Error', 'Required fields missing')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('jobs').update(form).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('jobs').insert({ ...form, is_active: true })
        if (error) throw error
      }
      setShowForm(false)
      fetchJobs()
    } catch (error: any) { Alert.alert('Error', error.message) }
    finally { setSaving(false) }
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete Job', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('jobs').delete().eq('id', id); fetchJobs()
      }},
    ])
  }

  const toggleStatus = async (job: Job) => {
    const { error } = await supabase.from('jobs').update({ is_active: !job.is_active }).eq('id', job.id)
    if (!error) fetchJobs()
  }

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={colors.gold} /></View>

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Jobs ({jobs.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openNewForm}><Text style={styles.addBtnText}>+ New</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchJobs} tintColor={colors.gold} />}>
        {jobs.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyText}>No jobs created yet</Text></View>
        ) : jobs.map(job => (
          <View key={job.id} style={styles.jobCard}>
            <TouchableOpacity onPress={() => toggleStatus(job)} style={styles.statusDot}>
              <View style={[styles.dot, { backgroundColor: job.is_active ? colors.success : colors.textMuted }]} />
            </TouchableOpacity>
            <View style={styles.jobInfo}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobMeta}>{job.department} · {job.location}</Text>
              <Text style={styles.jobType}>{job.type} · {job.experience}</Text>
            </View>
            <View style={styles.jobActions}>
              <TouchableOpacity onPress={() => openEditForm(job)}><Text style={styles.actionText}>Edit</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(job.id)}><Text style={[styles.actionText, { color: colors.error }]}>Del</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={styles.modal} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}><Text style={styles.cancelBtn}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Edit Job' : 'New Job'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}><Text style={styles.saveBtn}>{saving ? 'Saving...' : 'Save'}</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={form.title} onChangeText={t => setForm(p => ({ ...p, title: t }))} placeholder="Job title" placeholderTextColor={colors.textMuted} />
            <Text style={styles.label}>Department</Text>
            <TextInput style={styles.input} value={form.department} onChangeText={t => setForm(p => ({ ...p, department: t }))} placeholder="e.g. Engineering" placeholderTextColor={colors.textMuted} />
            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={form.location} onChangeText={t => setForm(p => ({ ...p, location: t }))} placeholder="e.g. Adama, Ethiopia" placeholderTextColor={colors.textMuted} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={form.description} onChangeText={t => setForm(p => ({ ...p, description: t }))} placeholder="Job description..." placeholderTextColor={colors.textMuted} multiline textAlignVertical="top" />
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Type</Text>
                <TextInput style={styles.input} value={form.type} onChangeText={t => setForm(p => ({ ...p, type: t }))} placeholder="FULL_TIME" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Experience</Text>
                <TextInput style={styles.input} value={form.experience} onChangeText={t => setForm(p => ({ ...p, experience: t }))} placeholder="MID" placeholderTextColor={colors.textMuted} />
              </View>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Remote position</Text>
              <Switch value={form.remote} onValueChange={v => setForm(p => ({ ...p, remote: v }))} trackColor={{ false: colors.surfaceLight, true: colors.forest }} thumbColor={form.remote ? colors.gold : colors.textMuted} />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xxl, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: fonts.sizes.xl, fontWeight: 'bold', color: colors.text },
  addBtn: { backgroundColor: colors.forest, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 8 },
  addBtnText: { color: colors.text, fontWeight: '600' },
  list: { padding: spacing.lg },
  empty: { alignItems: 'center', paddingTop: spacing.xxl * 2 },
  emptyText: { color: colors.textMuted },
  jobCard: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' },
  statusDot: { marginRight: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  jobInfo: { flex: 1 },
  jobTitle: { color: colors.text, fontWeight: '600', marginBottom: 2 },
  jobMeta: { color: colors.textSecondary, fontSize: fonts.sizes.sm },
  jobType: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: 2 },
  jobActions: { flexDirection: 'row', gap: spacing.sm },
  actionText: { color: colors.gold, fontWeight: '500' },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xxl, borderBottomWidth: 1, borderBottomColor: colors.border },
  cancelBtn: { color: colors.textSecondary, fontSize: fonts.sizes.md },
  modalTitle: { fontSize: fonts.sizes.lg, fontWeight: 'bold', color: colors.text },
  saveBtn: { color: colors.gold, fontSize: fonts.sizes.md, fontWeight: '600' },
  modalContent: { padding: spacing.lg },
  label: { color: colors.text, fontSize: fonts.sizes.sm, fontWeight: '500', marginBottom: spacing.xs },
  input: { backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, color: colors.text, fontSize: fonts.sizes.md, marginBottom: spacing.md },
  textArea: { height: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
})
