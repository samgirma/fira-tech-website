import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert,
  Modal, KeyboardAvoidingView, Platform, Switch,
} from 'react-native'
import { supabase } from '../services/supabase'
import { colors, spacing, fonts } from '../constants/theme'

interface Blog {
  id: string
  title: string
  content: string
  slug: string
  published: boolean
  created_at: string
}

export default function BlogsScreen() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Blog | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setBlogs(data || [])
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBlogs() }, [])

  const openNewForm = () => {
    setEditing(null)
    setTitle('')
    setContent('')
    setPublished(false)
    setShowForm(true)
  }

  const openEditForm = (blog: Blog) => {
    setEditing(blog)
    setTitle(blog.title)
    setContent(blog.content)
    setPublished(blog.published)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Title and content are required')
      return
    }

    setSaving(true)
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
      const user = (await supabase.auth.getUser()).data.user

      if (editing) {
        const { error } = await supabase
          .from('blogs')
          .update({ title, content, published, slug })
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert({ title, content, slug, published, author_id: user?.id })
        if (error) throw error
      }

      setShowForm(false)
      fetchBlogs()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete Blog', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('blogs').delete().eq('id', id)
          fetchBlogs()
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
        <Text style={styles.title}>Blog Posts</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openNewForm}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchBlogs} tintColor={colors.gold} />
        }
      >
        {blogs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No blogs yet</Text>
            <Text style={styles.emptySubtitle}>Create your first blog post</Text>
          </View>
        ) : (
          blogs.map((blog) => (
            <View key={blog.id} style={styles.blogCard}>
              <View style={styles.blogInfo}>
                <Text style={styles.blogTitle}>{blog.title}</Text>
                <Text style={styles.blogDate}>
                  {new Date(blog.created_at).toLocaleDateString()}
                  {' · '}
                  {blog.published ? 'Published' : 'Draft'}
                </Text>
              </View>
              <View style={styles.blogActions}>
                <TouchableOpacity onPress={() => openEditForm(blog)} style={styles.actionBtn}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(blog.id)} style={styles.actionBtn}>
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
            <Text style={styles.modalTitle}>{editing ? 'Edit Blog' : 'New Blog'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text style={styles.saveBtn}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Blog title"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Content</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Write your blog content..."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.switchRow}>
              <Text style={styles.label}>Publish immediately</Text>
              <Switch
                value={published}
                onValueChange={setPublished}
                trackColor={{ false: colors.surfaceLight, true: colors.forest }}
                thumbColor={published ? colors.gold : colors.textMuted}
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
  blogCard: {
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
  blogInfo: { flex: 1 },
  blogTitle: { color: colors.text, fontWeight: '600', marginBottom: spacing.xs },
  blogDate: { color: colors.textMuted, fontSize: fonts.sizes.xs },
  blogActions: { flexDirection: 'row', gap: spacing.sm },
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
  label: { color: colors.text, fontSize: fonts.sizes.sm, fontWeight: '500', marginBottom: spacing.xs },
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
  textArea: { height: 200, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
})
