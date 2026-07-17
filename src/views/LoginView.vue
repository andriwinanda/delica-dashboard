<script lang="ts">
import { defineComponent } from 'vue'
import { Eye, EyeOff, LayoutDashboard, LoaderCircle, LockKeyhole, Mail } from 'lucide-vue-next'
import axiosHelper, {
  clearAuthSession,
  getApiErrorMessage,
  setAuthSession
} from '@/utils/axiosHelper'
import { getLoginApiUrl, getUserDetailsApiUrl } from '@/utils/env'

interface TokenResponse {
  access_token?: string
}

interface UserDetails {
  role?: string
  [key: string]: unknown
}

export default defineComponent({
  name: 'LoginView',
  components: {
    Eye,
    EyeOff,
    LayoutDashboard,
    LoaderCircle,
    LockKeyhole,
    Mail
  },
  data() {
    return {
      username: '',
      password: '',
      showPassword: false,
      isLoading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      this.errorMessage = ''

      if (!this.username.trim() || !this.password) {
        this.errorMessage = "Data can't be null."
        return
      }

      this.isLoading = true

      try {
        const userLogin = new URLSearchParams({
          username: this.username.trim(),
          password: this.password,
          grant_type: 'password'
        })
        const clientToken = window.btoa('delica-client:delica-secret')
        const tokenResponse = await axiosHelper.post<TokenResponse>(
          getLoginApiUrl(),
          userLogin,
          {
            headers: {
              Authorization: `Basic ${clientToken}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        )
        const token = tokenResponse.data.access_token

        if (!token) throw new Error('Login response does not contain an access token.')

        axiosHelper.defaults.headers.common.Authorization = `Bearer ${token}`

        const userResponse = await axiosHelper.get<UserDetails>(getUserDetailsApiUrl(), {
          headers: { Authorization: `Bearer ${token}` }
        })
        const user = userResponse.data

        if (user.role !== 'ROLE_ADMIN') {
          clearAuthSession()
          delete axiosHelper.defaults.headers.common.Authorization
          this.errorMessage = 'Access denied.'
          return
        }

        setAuthSession(token, user)
        const redirect = typeof this.$route.query.redirect === 'string'
          ? this.$route.query.redirect
          : '/'
        await this.$router.replace(redirect)
      } catch (error) {
        this.errorMessage = error instanceof Error && !('response' in error)
          ? error.message
          : getApiErrorMessage(error, 'Email or password is incorrect.')
      } finally {
        this.isLoading = false
      }
    }
  }
})
</script>

<template>
  <main class="grid min-h-screen bg-white lg:grid-cols-2">
    <section class="hidden overflow-hidden bg-gray-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div class="flex items-center gap-3 text-xl font-bold">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-950">
          <LayoutDashboard :size="21" />
        </span>
        Delica
      </div>

      <div class="max-w-lg">
        <p class="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-blue-400">Business dashboard</p>
        <h1 class="text-5xl font-semibold leading-tight tracking-tight">Keep every lead and conversation moving forward.</h1>
        <p class="mt-6 max-w-md text-base leading-7 text-gray-400">Manage leads, WhatsApp conversations, and workflow syncs from one focused workspace.</p>
      </div>

      <p class="text-sm text-gray-500">Delica Aluminium Management System</p>
    </section>

    <section class="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12">
      <div class="w-full max-w-md">
        <div class="mb-10 flex items-center gap-3 text-xl font-bold lg:hidden">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-white">
            <LayoutDashboard :size="21" />
          </span>
          Delica
        </div>

        <div class="mb-8">
          <h2 class="text-3xl font-bold tracking-tight text-gray-950">Welcome back</h2>
          <p class="mt-2 text-sm text-gray-500">Enter your account details to access the dashboard.</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div>
            <label for="username" class="mb-2 block text-sm font-medium text-gray-700">Username</label>
            <div class="!relative">
              <Mail :size="18" class="pointer-events-none !absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-1" />
              <input id="username" v-model="username" type="text" autocomplete="username" required placeholder="Enter your username" class="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-100 text-gray-900 " />
            </div>
          </div>

          <div>
            <label for="password" class="mb-2 block text-sm font-medium text-gray-700">Password</label>
            <div class="!relative">
              <LockKeyhole :size="18" class="pointer-events-none !absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-1" />
              <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required placeholder="Enter your password" class="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 text-gray-900  focus:ring-2 focus:ring-gray-100" />
              <button type="button" class="!absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" :size="18" />
                <Eye v-else :size="18" />
              </button>
            </div>
          </div>

          <p v-if="errorMessage" role="alert" class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

          <button type="submit" :disabled="isLoading" class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">
            <LoaderCircle v-if="isLoading" :size="18" class="animate-spin" />
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </div>
    </section>
  </main>
</template>
