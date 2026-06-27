import React, { useState, useEffect } from 'react'
import { Text, View } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { supabase } from '../services/supabase'
import { colors, fonts } from '../constants/theme'
import DashboardScreen from '../screens/DashboardScreen'
import BlogsScreen from '../screens/BlogsScreen'
import CommentsScreen from '../screens/CommentsScreen'
import JobsScreen from '../screens/JobsScreen'
import SocialLinksScreen from '../screens/SocialLinksScreen'
import StatsScreen from '../screens/StatsScreen'
import MessagesScreen from '../screens/MessagesScreen'

const Tab = createBottomTabNavigator()

const tabIcons: Record<string, string> = {
  Dashboard: '📊',
  Stats: '📈',
  Blogs: '📝',
  Comments: '💬',
  Jobs: '💼',
  'Social Links': '🔗',
  Messages: '📨',
}

function TabIcon({ routeName, color, size, badge }: { routeName: string; color: string; size: number; badge?: number }) {
  return (
    <View style={{ position: 'relative' }}>
      <Text style={{ fontSize: size - 2, color }}>{tabIcons[routeName] || '•'}</Text>
      {badge != null && badge > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -8,
          backgroundColor: colors.error, borderRadius: 8,
          minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
  )
}

export default function TabNavigator({ onLogout }: { onLogout: () => void }) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false)
      setUnreadCount(count || 0)
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const badge = route.name === 'Messages' ? unreadCount : undefined
          return <TabIcon routeName={route.name} color={color} size={size} badge={badge} />
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.obsidian,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 20,
          height: 72,
        },
        tabBarLabelStyle: {
          fontSize: fonts.sizes.xs,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: fonts.sizes.lg,
        },
      })}
    >
      <Tab.Screen name="Dashboard">
        {() => <DashboardScreen onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Blogs"
        component={BlogsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Comments" component={CommentsScreen} />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Social Links"
        component={SocialLinksScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  )
}
