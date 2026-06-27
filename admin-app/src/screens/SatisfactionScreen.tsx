import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Share } from 'react-native'
import { supabase } from '../services/supabase'
import { colors, fonts } from '../constants/theme'

interface Satisfaction {
  id: string
  partner_name: string
  rating: number
  feedback: string
  created_at: string
}

export default function SatisfactionScreen() {
  const [responses, setResponses] = useState<Satisfaction[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ average: 0, total: 0, percentage: 0 })

  const fetchResponses = async () => {
    setLoading(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const [res, statsRes] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/admin/satisfaction`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/satisfaction`),
      ])
      if (res.ok) setResponses(await res.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResponses() }, [])

  const handleDelete = (id: string) => {
    Alert.alert('Delete Response', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const token = (await supabase.auth.getSession()).data.session?.access_token
          const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/admin/satisfaction`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id }),
          })
          if (res.ok) fetchResponses()
        } catch (err) { console.error(err) }
      }},
    ])
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Share your experience with Fira Tech!\n\n${process.env.EXPO_PUBLIC_API_URL}/feedback`,
      })
    } catch (err) { console.error(err) }
  }

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

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

        {/* Share Link Button */}
        <TouchableOpacity
          onPress={handleShare}
          style={{ backgroundColor: colors.gold, borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 20 }}
        >
          <Text style={{ color: colors.obsidian, fontWeight: '600', fontSize: fonts.sizes.base }}>Share Feedback Link</Text>
        </TouchableOpacity>

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
