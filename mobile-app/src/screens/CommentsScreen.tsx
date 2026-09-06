import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native'
import { supabase } from '../services/supabase'
import { colors, spacing, fonts } from '../constants/theme'

interface Comment {
  id: string
  content: string
  author: string
  email?: string
  approved: boolean
  created_at: string
  blogs?: { title: string }
}

export default function CommentsScreen() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, blogs!inner(title)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchComments() }, [])

  const handleApprove = async (id: string, approved: boolean) => {
    const { error } = await supabase
      .from('comments')
      .update({ approved })
      .eq('id', id)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      fetchComments()
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete Comment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('comments').delete().eq('id', id)
          if (error) Alert.alert('Error', error.message)
          else fetchComments()
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

  const pending = comments.filter(c => !c.approved)
  const approved = comments.filter(c => c.approved)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comments ({comments.length})</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchComments} tintColor={colors.gold} />
        }
      >
        {pending.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Pending ({pending.length})</Text>
            {pending.map(c => (
              <CommentCard
                key={c.id}
                comment={c}
                onApprove={() => handleApprove(c.id, true)}
                onDelete={() => handleDelete(c.id)}
              />
            ))}
          </>
        )}

        <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
          Approved ({approved.length})
        </Text>
        {approved.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No approved comments yet</Text>
          </View>
        ) : (
          approved.map(c => (
            <CommentCard
              key={c.id}
              comment={c}
              onApprove={() => handleApprove(c.id, false)}
              onDelete={() => handleDelete(c.id)}
              approved
            />
          ))
        )}
      </ScrollView>
    </View>
  )
}

function CommentCard({ comment, onApprove, onDelete, approved }: {
  comment: Comment
  onApprove: () => void
  onDelete: () => void
  approved?: boolean
}) {
  return (
    <View style={[styles.commentCard, !comment.approved && styles.pendingCard]}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>{comment.author}</Text>
        <Text style={styles.commentDate}>
          {new Date(comment.created_at).toLocaleDateString()}
        </Text>
      </View>
      {comment.blogs?.title && (
        <Text style={styles.commentBlog}>on "{comment.blogs.title}"</Text>
      )}
      <Text style={styles.commentContent}>{comment.content}</Text>
      <View style={styles.commentActions}>
        {!approved && (
          <TouchableOpacity style={styles.approveBtn} onPress={onApprove}>
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
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
  list: { padding: spacing.lg },
  sectionLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  empty: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { color: colors.textMuted },
  commentCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pendingCard: {
    borderColor: colors.warning,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  commentAuthor: { color: colors.text, fontWeight: '600' },
  commentDate: { color: colors.textMuted, fontSize: fonts.sizes.xs },
  commentBlog: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginBottom: spacing.xs },
  commentContent: { color: colors.textSecondary, marginBottom: spacing.sm },
  commentActions: { flexDirection: 'row', gap: spacing.sm },
  approveBtn: {
    backgroundColor: colors.forest,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  approveBtnText: { color: colors.text, fontWeight: '500', fontSize: fonts.sizes.sm },
  deleteBtn: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteBtnText: { color: colors.error, fontWeight: '500', fontSize: fonts.sizes.sm },
})
