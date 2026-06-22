import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../services/supabase'
import { colors, spacing, fonts } from '../constants/theme'

export default function DashboardScreen({ onLogout }: {
  onLogout: () => void
}) {
  const navigation = useNavigation<any>()
  const [stats, setStats] = useState({ blogs: 0, comments: 0, pendingComments: 0, jobs: 0, socialLinks: 0, unreadMessages: 0 })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const fetchStats = async () => {
    try {
      const { count: blogs } = await supabase.from('blogs').select('*', { count: 'exact', head: true })
      const { count: comments } = await supabase.from('comments').select('*', { count: 'exact', head: true })
      const { count: pendingComments } = await supabase
        .from('comments').select('*', { count: 'exact', head: true }).eq('approved', false)
      const { count: jobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true })
      const { count: socialLinks } = await supabase.from('social_links').select('*', { count: 'exact', head: true })
      const { count: unreadMessages } = await supabase
        .from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false)

      setStats({
        blogs: blogs || 0,
        comments: comments || 0,
        pendingComments: pendingComments || 0,
        jobs: jobs || 0,
        socialLinks: socialLinks || 0,
        unreadMessages: unreadMessages || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchStats()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  const menuItems = [
    {
      title: 'Blog Posts',
      value: stats.blogs.toString(),
      subtitle: 'Manage your blog content',
      screen: 'Blogs',
      color: colors.forest,
    },
    {
      title: 'Comments',
      value: stats.comments.toString(),
      subtitle: `${stats.pendingComments} pending approval`,
      screen: 'Comments',
      color: colors.forestLight,
      badge: stats.pendingComments,
    },
    {
      title: 'Jobs',
      value: stats.jobs.toString(),
      subtitle: 'Manage job listings',
      screen: 'Jobs',
      color: colors.forest,
    },
    {
      title: 'Social Links',
      value: stats.socialLinks.toString(),
      subtitle: 'Manage social media links',
      screen: 'Social Links',
      color: colors.gold,
    },
    {
      title: 'Messages',
      value: stats.unreadMessages.toString(),
      subtitle: `${stats.unreadMessages} unread · Manage contact channels`,
      screen: 'Messages',
      color: colors.error,
      badge: stats.unreadMessages,
    },
  ]

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchStats} tintColor={colors.gold} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Overview</Text>

      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={styles.card}
          onPress={() => navigation.navigate(item.screen)}
        >
          <View style={[styles.cardAccent, { backgroundColor: item.color }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.badge != null && item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardValue}>{item.value}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  logoutBtn: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardAccent: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.text,
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
  },
})
