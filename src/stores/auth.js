import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref(null)
  const user = ref(null)
  const profile = ref(null)

  const loading = ref(true)
  const profileLoading = ref(false)

  let initialized = false

  async function initialize() {
    if (initialized) return

    initialized = true

    // Subscribe once to authentication changes.
    supabase.auth.onAuthStateChange((_event, newSession) => {
      const previousUserId = user.value?.id
      const nextUserId = newSession?.user?.id

      session.value = newSession
      user.value = newSession?.user ?? null

      if (previousUserId !== nextUserId) {
        profile.value = null
      }
    })

    // Load the existing session.
    const { data, error } = await supabase.auth.getSession()

    if (!error) {
      session.value = data.session
      user.value = data.session?.user ?? null
    }

    loading.value = false
  }

  async function loadProfile() {
    if (!user.value) {
      profile.value = null
      return
    }

    if (profile.value?.id === user.value.id) return

    profileLoading.value = true

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, membership_status')
      .eq('id', user.value.id)
      .single()

    if (!error) {
      profile.value = data
    } else {
      profile.value = null
    }

    profileLoading.value = false
  }

  async function login(email, password) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  async function logout() {
    return await supabase.auth.signOut()
  }

  return {
    session,
    user,
    profile,
    loading,
    profileLoading,
    initialize,
    loadProfile,
    login,
    logout,
  }
})
