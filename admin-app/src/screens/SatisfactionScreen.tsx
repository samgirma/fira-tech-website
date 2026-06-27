import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Share, Clipboard } from 'react-native'
import { supabase } from '../services/supabase'
import { colors, fonts } from '../constants/theme'

interface Satisfaction {
  id: string
  partner_name: string
  rating: number
  feedback: string
  created_at: string
}

interface Link {
  token: string
  created_at: string
  expires_at: string
}

export default function SatisfactionScreen() {
  const [responses, setResponses] = useState<Satisfaction[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [stats, setStats] = useState({ average: 0, total: 0, percentage: 0 })

  const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://firatech.systems'

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const [res, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/satisfaction`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/satisfaction`),
      ])
      if (res.ok) setResponses(await res.json())
      if (statsRes.ok) setStats(await statsRes.json())

      // Fetch links
      const linksRes = await fetch(`${API_BASE}/api/admin/satisfaction/links`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (linksRes.ok) setLinks(await linksRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleGenerateLink = async () => {
    setGenerating(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${API_BASE}/api/admin/satisfaction/generate-link`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to generate link')
      const data = await res.json()
      
      Alert.alert('Link Generated', `Share this feedback link:\n\n${data.url}\n\nExpires: ${new Date(data.expires_at).toLocaleString()}`, [
        { text: 'Copy Link', onPress: () => { Clipboard.setString(data.url); Alert.alert('Copied!', 'Link copied to clipboard') } },
        { text: 'Share', onPress: async () => {
          try { await Share.share({ message: `Share your experience with Fira Tech!\n\n${data.url}` }) }
          catch (e) { console.error(e) }
        }},
        { text: 'OK' },
      ])
      fetchData()
    } catch (err) {
      Alert.alert('Error', 'Failed to generate link')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete Response', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const token = (await supabase.auth.getSession()).data.session?.access_token
          const res = await fetch(`${API_BASE}/api/admin/satisfaction`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id }),
          })
          if (res.ok) fetchData()
        } catch (err) { console.error(err) }
      }},
    ])
  }

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const activeLinks = links.filter(l => new Date(l.expires_at) > new Date())

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16 }}>
        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.gold, fontSize: fonts.sizes.xxl, fontWeight: 'bold' }}>{stats.percentage}%</Text>
            <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, marginTop: 4 }}>Satisfaction</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.gold, fontSize: fonts.sizes.xxl, fontWeight: 'bold' }}>{stats.average}</Text>
            <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, marginTop: 4 }}>Avg Rating</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.gold, fontSize: fonts.sizes.xxl, fontWeight: 'bold' }}>{stats.total}</Text>
            <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, marginTop: 4 }}>Responses</Text>
          </View>
        </View>

        {/* Generate Link Button */}
        <TouchableOpacity
          onPress={handleGenerateLink}
          disabled={generating}
          style={{
            backgroundColor: colors.forest,
            borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 12,
            opacity: generating ? 0.6 : 1,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: fonts.sizes.base }}>
            {generating ? 'Generating...' : 'Generate Expiring Link'}
          </Text>
        </TouchableOpacity>

        {/* Active Links */}
        {activeLinks.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.text, fontSize: fonts.sizes.sm, fontWeight: 'bold', marginBottom: 8 }}>
              Active Links ({activeLinks.length})
            </Text>
            {activeLinks.map((link) => (
              <View key={link.token} style={{
                backgroundColor: colors.surface, borderRadius: 8, padding: 12, marginBottom: 6,
                borderWidth: 1, borderColor: colors.border,
              }}>
                <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.xs, marginBottom: 4 }}>
                  Expires: {new Date(link.expires_at).toLocaleString()}
                </Text>
                <Text style={{ color: colors.text, fontSize: fonts.sizes.xs }} numberOfLines={1}>
                  {API_BASE}/feedback?token={link.token}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Responses */}
        <Text style={{ color: colors.text, fontSize: fonts.sizes.lg, fontWeight: 'bold', marginBottom: 12 }}>
          Responses ({responses.length})
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.gold} />
        ) : responses.length === 0 ? (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>No responses yet</Text>
        ) : (
          responses.map((r) => (
            <View key={r.id} style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.gold, fontSize: fonts.sizes.base }}>{r.partner_name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, marginTop: 2 }}>{renderStars(r.rating)}</Text>
                  {r.feedback ? (
                    <Text style={{ color: colors.text, fontSize: fonts.sizes.sm, marginTop: 6, lineHeight: 18 }}>{r.feedback}</Text>
                  ) : null}
                  <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: 6 }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(r.id)}
                  style={{ padding: 8, marginLeft: 8 }}
                >
                  <Text style={{ color: colors.error, fontSize: fonts.sizes.base }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}
