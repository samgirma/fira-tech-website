import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../services/supabase'
import { colors, spacing, fonts } from '../constants/theme'

const { width, height } = Dimensions.get('window')

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required')
      return
    }

    setLoading(true)
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        Alert.alert('Login Failed', signInError.message)
        return
      }

      const userId = authData.user?.id
      if (!userId) {
        Alert.alert('Error', 'Could not get user ID')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError)
        await supabase.auth.signOut()
        Alert.alert('Access Denied', 'Admin profile not found. Run the migration SQL first.')
        return
      }

      if (profile.role !== 'ADMIN') {
        await supabase.auth.signOut()
        Alert.alert('Access Denied', 'Admin role required')
        return
      }

      onLogin()
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={['#0a1214', '#112c1f', '#0a1214']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Oromo Pattern Overlay */}
        <View style={styles.patternOverlay} pointerEvents="none" />

        {/* Glow effects */}
        <View style={[styles.glow, styles.glow1]} pointerEvents="none" />
        <View style={[styles.glow, styles.glow2]} pointerEvents="none" />

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.companyName}>Fira Tech Solutions</Text>
          <Text style={styles.slogan}>Innovation. Community. Value.</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.1,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
  },
  glow1: {
    top: height * 0.1,
    left: -width * 0.3,
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: 'rgba(45, 106, 79, 0.15)',
    transform: [{ scale: 1 }],
  },
  glow2: {
    bottom: -height * 0.1,
    right: -width * 0.3,
    width: width,
    height: width,
    backgroundColor: 'rgba(184, 134, 11, 0.08)',
    transform: [{ scale: 1 }],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  companyName: {
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    color: colors.gold,
    textAlign: 'center',
    marginBottom: 2,
  },
  slogan: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  form: {
    gap: 0,
  },
  input: {
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(42, 42, 42, 0.5)',
    borderRadius: 10,
    padding: 12,
    color: colors.text,
    fontSize: fonts.sizes.sm,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.forest,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: '600',
  },
})
