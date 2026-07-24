<template>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold">WhatsApp Messages</h2>
        <p class="text-sm text-gray-500">Status of automated WhatsApp messages.</p>
      </div>
    </div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="pb-6 flex justify-between items-center">
        <div>
          <h3 class="font-bold text-lg">Recent Messages</h3>
          <p class="text-sm text-gray-500">Status of automated WhatsApp messages.</p>
        </div>
        <button @click="fetchChatList(true)"
          class="px-4 py-2 border border-gray-200 rounded-md flex items-center gap-2 hover:bg-gray-50 transition-colors ">
          <RefreshCw :size="14" />
          Refresh
        </button>
      </div>

      <div class="h-[400px] overflow-y-auto pr-2 scrollbar-thin" @scroll.passive="handleMessageScroll">
        <div v-if="!selectedMessage && isListLoading" v-for="value in 3">
          <div class="w-full h-20 rounded bg-gray-200 mb-2"></div>
        </div>

        <div v-for="msg in messages" :key="msg.jid" @click="showDetailMessage(msg)"
          :class="['group p-4 mb-4! border border-gray-300 me-1 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-500 hover:border-gray-500 hover:text-white transition-colors cursor-pointer', selectedMessage && selectedMessage.jid == msg.jid ? 'border-gray-500! bg-gray-500! text-white!' : '']">
          <div
            class="flex h-10 w-10 me-4 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[18px] font-bold text-gray-400">

            {{ msg.name.charAt(0) }}
          </div>
          <div class="w-full">
            <div class="flex items-center justify-between gap-2">
              <p class="font-bold text-sm ">{{ msg.name }}
              </p>
              <span
                :class="['text-[10px] transition-colors group-hover:text-white', selectedMessage && selectedMessage.jid == msg.jid ? 'text-white' : 'text-gray-400']">
                <span v-if="moment(msg.last_message_time).isSame(moment(), 'D')">{{
                  moment(msg.last_message_time).format('HH.mm') }}</span>
                <span v-else-if="moment().diff(moment(msg.last_message_time), 'days') == 1">Yesterday</span>
                <span v-else-if="moment().diff(moment(msg.last_message_time), 'days') >= 1">{{
                  moment(msg.last_message_time).format('dddd') }}</span>
                <span v-else>{{ moment(msg.last_message_time).fromNow() }}</span>
              </span>
            </div>
            <div class="flex items-center gap-2 text-gray-400">
              <span
                :class="['text-sm transition-colors group-hover:text-white', selectedMessage && selectedMessage.jid == msg.jid ? 'text-white' : 'text-gray-500']">
                +{{ msg.jid.replace('@s.whatsapp.net', '') }}
              </span>
            </div>
          </div>

        </div>
        <p v-if="selectedMessage && isListLoading" class="py-3 text-center text-xs text-gray-400">Loading more messages...
        </p>
        <p v-else-if="!hasMore && messages.length" class="py-3 text-center text-xs text-gray-400">All messages loaded
        </p>
      </div>
    </div>

    <div v-if="selectedMessage" class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div v-if="selectedMessage">

        <div class="p-6 pb-4 flex items-center">
          <div
            class="flex h-10 w-10 me-4 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[18px] font-bold text-gray-400">
            {{ selectedMessage.name.charAt(0) }}
          </div>
          <div>
            <h3 class="font-bold text-lg flex items-center gap-2">{{ selectedMessage.name }}
              <span :class="[
                'text-[12px] px-2 py-0.5 border border-gray-200 rounded-full text-sm uppercase tracking-wider bg-gray-100 text-gray-600'
              ]">
                +{{ selectedMessage.jid.replace('@s.whatsapp.net', '') }}
              </span>
            </h3>
            <p class="text-[12px] text-gray-500">Last chat {{ moment(selectedMessage.last_message_time).fromNow() }}</p>
          </div>
        </div>
        <div ref="detailScroller" class="h-[400px] overflow-y-auto pr-2 space-y-4 rounded scrollbar-thin bg-[#F8F9FA]"
          @scroll.passive="handleDetailScroll">
          <p v-if="isLoading" class="py-2 text-center text-xs text-gray-400">Loading older messages...</p>
          <div v-for="(msg, idx) in detailMessages" :key="msg.id || idx" class="flex flex-col gap-2 px-6 py-4">
            <span v-if="!detailMessages[idx - 1] || idx == detailMessages.length - 1"
              class=" text-xs text-gray-500 pb-4 text-center">{{
                moment(msg.created_at || msg.timestamp).format('ddd, DD MMM yyyy') }}</span>
            <span
              v-else-if="detailMessages[idx - 1] && moment(msg.created_at || msg.timestamp).format('DD MMM yyyy') !== moment(detailMessages[idx - 1].created_at || detailMessages[idx - 1].timestamp).format('DD MMM yyyy')"
              class="text-xs text-gray-500 pb-4 text-center">
              {{ moment(msg.created_at || msg.timestamp).format('ddd, DD MMM yyyy') }}
            </span>

            <!-- Outgoing (kanan) -->
            <div v-if="msg.is_from_me" class="flex justify-end">
              <div class="bg-blue-500 relative text-white px-2 pt-2 pb-6 rounded-md w-fit max-w-xs">
                <img
                  v-if="msg.media_type === 'image' && mediaUrls[msg.id]"
                  :src="mediaUrls[msg.id]"
                  :alt="msg.filename || 'WhatsApp image'"
                  class="block max-h-72 max-w-full rounded object-contain"
                  loading="lazy"
                >
                <p v-else-if="msg.media_type === 'image' && loadingMediaIds.includes(msg.id)"
                  class="px-2 py-3 text-sm text-blue-100">Memuat gambar...</p>
                <p v-else-if="msg.media_type === 'image' && failedMediaIds.includes(msg.id)"
                  class="px-2 py-3 text-sm text-blue-100">Gambar tidak dapat dimuat</p>
                <p v-if="msg.content" class="px-2 pt-2 whitespace-pre-wrap break-words">{{ msg.content }}</p>
                <span class="absolute! bottom-2 right-4 text-xs text-white ml-2">{{ moment(msg.created_at ||
                  msg.timestamp).format('HH:mm')
                }}</span>
              </div>
            </div>

            <!-- Incoming (kiri) -->
            <div v-else class="flex justify-start">
              <div class="bg-gray-200 relative text-black px-2 pt-2 pb-6 rounded-md w-fit max-w-xs">
                <img
                  v-if="msg.media_type === 'image' && mediaUrls[msg.id]"
                  :src="mediaUrls[msg.id]"
                  :alt="msg.filename || 'WhatsApp image'"
                  class="block max-h-72 max-w-full rounded object-contain"
                  loading="lazy"
                >
                <p v-else-if="msg.media_type === 'image' && loadingMediaIds.includes(msg.id)"
                  class="px-2 py-3 text-sm text-gray-500">Memuat gambar...</p>
                <p v-else-if="msg.media_type === 'image' && failedMediaIds.includes(msg.id)"
                  class="px-2 py-3 text-sm text-gray-500">Gambar tidak dapat dimuat</p>
                <p v-if="msg.content" class="px-2 pt-2 whitespace-pre-wrap break-words">{{ msg.content }}</p>
                <span class="absolute! bottom-2 right-4 text-xs text-gray-500 ml-2">{{ moment(msg.created_at ||
                  msg.timestamp).format('HH:mm')
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="p-6 pb-4">
          <h3 class="font-bold text-lg">Message Takeover</h3>
          <p class="text-sm text-gray-500">Incoming WhatsApp messages from n8n workflow.</p>
        </div>
        <div class="h-[300px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
          <div class="text-center py-8 text-gray-500">
            <MessageSquare :size="48" class="mx-auto mb-4 opacity-50" />
            <p class="text-sm">No incoming messages yet.</p>
            <p class="text-xs mt-1">Messages will appear here when received via n8n webhook.</p>
          </div>
        </div>
      </div>

    </div>
    <!-- 
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="mb-6">
        <h3 class="font-bold text-lg">Send Manual Message</h3>
        <p class="text-sm text-gray-500">Trigger a WhatsApp message via n8n workflow.</p>
      </div>
      <form @submit.prevent="sendWhatsAppMessage" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Recipient Phone Number</label>
          <input v-model="form.phone" type="text" placeholder="+628..."
            class="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-black outline-none transition-all"
            required />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Message Content</label>
          <textarea v-model="form.message"
            class="w-full min-h-[120px] p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all text-sm"
            placeholder="Type your message here..." required></textarea>
        </div>
        <button type="submit"
          class="w-full py-2 bg-black text-white rounded-md flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
          <Send :size="16" />
          Trigger n8n Workflow
        </button>
      </form>
    </div> -->

    <!-- <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="mb-6">
        <h3 class="font-bold text-lg">Message Takeover</h3>
        <p class="text-sm text-gray-500">Incoming WhatsApp messages from n8n workflow.</p>
      </div>
      <div class="h-[300px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
        <div class="text-center py-8 text-gray-500">
          <MessageSquare :size="48" class="mx-auto mb-4 opacity-50" />
          <p class="text-sm">No incoming messages yet.</p>
          <p class="text-xs mt-1">Messages will appear here when received via n8n webhook.</p>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import axiosHelper from '@/utils/axiosHelper'
import { getWhatsAppWebhookUrl, getTakeoverWebhookUrl, getLeadsApiUrl, getChatList, getChatMessages, getMessageMediaDownload, getGowaHeaders } from '@/utils/env'
import {
  ArrowRight,
  MessageSquare,
  RefreshCw,
  Send
} from 'lucide-vue-next'
import moment from 'moment';

const HIDDEN_CHAT_NUMBERS = new Set([
  '62895335202843',
  '6281365569764'
])

const chatNumber = (chat: any) => String(chat?.jid || chat?.phone || chat?.id || '').replace(/\D/g, '')

export default defineComponent({
  name: 'WhatsAppTab',
  components: {
    ArrowRight,
    RefreshCw,
    MessageSquare,
    Send
  },
  data() {
    return {
      isLoading: false,
      isListLoading: false,
      messages: [],
      offset: 0,
      chatPageIndex: 1,
      limit: 10,
      chatTotal: null as number | null,
      hasMore: true,
      selectedMessage: null,
      detailMessages: [],
      detailOffset: 0,
      detailPageIndex: 1,
      detailLimit: 20,
      detailTotal: null as number | null,
      detailHasMore: true,
      mediaUrls: {} as Record<string, string>,
      loadingMediaIds: [] as string[],
      failedMediaIds: [] as string[],
      form: {
        phone: '',
        message: ''
      },
      moment
    }
  },
  mounted() {
    this.fetchChatList()
  },
  beforeUnmount() {
    Object.values(this.mediaUrls).forEach((url) => URL.revokeObjectURL(url))
  },
  methods: {

    async loadMessageMedia(message: any) {
      const id = String(message?.id || '')
      if (
        message?.media_type !== 'image' ||
        !id ||
        this.mediaUrls[id] ||
        this.loadingMediaIds.includes(id) ||
        this.failedMediaIds.includes(id)
      ) return

      this.loadingMediaIds.push(id)
      try {
        const response = await axiosHelper.get(getMessageMediaDownload(id), {
          params: {phone: message.chat_jid},
          headers: getGowaHeaders(),
          responseType: 'blob'
        })
        this.mediaUrls[id] = URL.createObjectURL(response.data)
      } catch {
        this.failedMediaIds.push(id)
      } finally {
        this.loadingMediaIds = this.loadingMediaIds.filter((mediaId) => mediaId !== id)
      }
    },

    async fetchChatList(reset = false) {
      if (this.isListLoading || (!this.hasMore && !reset)) return
      if (reset) { this.offset = 0; this.chatPageIndex = 1; this.chatTotal = null; this.hasMore = true; this.messages = [] }
      if (this.chatTotal !== null && this.offset >= this.chatTotal) { this.hasMore = false; return }
      this.isListLoading = true
      const requestLimit = this.limit
      this.offset = this.limit * (this.chatPageIndex - 1)
      const leadsUrl = getChatList(this.offset, requestLimit)

      if (!leadsUrl) {
        console.log('VITE_LEADS_API_URL not configured')
        return
      }

      try {
        const response = await axiosHelper.get(leadsUrl, { headers: getGowaHeaders() })
        const payload = response.data?.results ?? response.data?.result ?? response.data
        const rows = Array.isArray(payload) ? payload : (payload?.data || payload?.items || payload?.chats || [])
        const pagination = payload?.pagination || response.data?.pagination
        const page = rows
          .filter((lead: any) => !HIDDEN_CHAT_NUMBERS.has(chatNumber(lead)))
          .map((lead: any) => ({
            ...lead,
            message: typeof lead.message === 'string' ? this.parseMessages(lead.message) : (lead.message || [])
          }))
        if (rows.length === 0) {
          this.hasMore = false
        } else {
          this.messages = [...this.messages, ...page]
          const total = Number(pagination?.total)
          this.chatTotal = Number.isFinite(total) ? total : null
          this.chatPageIndex += 1
          this.offset = this.limit * (this.chatPageIndex - 1)
          this.hasMore = this.chatTotal !== null ? this.offset < this.chatTotal : page.length >= requestLimit
          if (!this.selectedMessage && this.messages.length) await this.showDetailMessage(this.messages[0])
        }
      } catch (error: any) {

      }
      this.isListLoading = false

      // A page may contain only excluded chats; continue until a visible chat or the end.
      if (!this.messages.length && this.hasMore) await this.fetchChatList()

    },
    parseMessages(value: string) {
      try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : [] } catch { return [] }
    },
    latestMessage(message: any) {
      const entries = Array.isArray(message.message) ? message.message : []
      return entries[entries.length - 1] || {}
    },
    handleMessageScroll(event: Event) {
      const element = event.target as HTMLElement
      if (element.scrollHeight - element.scrollTop - element.clientHeight < 120) this.fetchChatList()
    },
    truncate(text: string, length = 50) {
      if (!text) return ''
      return text.length > length
        ? text.slice(0, length) + '...'
        : text

    },
    async showDetailMessage(msg: any) {
      this.isLoading = false
      this.isListLoading = false
      this.selectedMessage = msg
      this.detailMessages = []
      this.detailOffset = 0
      this.detailPageIndex = 1
      this.detailTotal = null
      this.detailHasMore = true
      await this.fetchChatMessages()
    },
    async fetchChatMessages() {
      if (!this.selectedMessage || this.isLoading || !this.detailHasMore) return
      if (this.detailTotal !== null && this.detailOffset >= this.detailTotal) { this.detailHasMore = false; return }
      this.isLoading = true
      const scroller = this.$refs.detailScroller as HTMLElement | undefined
      const previousHeight = scroller?.scrollHeight || 0
      const isFirstPage = this.detailOffset === 0
      try {
        const id = this.selectedMessage.jid || this.selectedMessage.id || this.selectedMessage.phone
        const requestLimit = this.detailLimit
        this.detailOffset = this.detailLimit * (this.detailPageIndex - 1)
        const response = await axiosHelper.get(getChatMessages(id, this.detailOffset, requestLimit), { headers: getGowaHeaders() })
        const results = response.data?.results ?? response.data?.result ?? response.data
        const rows = Array.isArray(results?.data) ? results.data : []
        if (rows.length === 0) {
          this.detailHasMore = false
          return
        }
        const orderedRows = [...rows].reverse()
        this.detailMessages = isFirstPage ? orderedRows : [...orderedRows, ...this.detailMessages]
        orderedRows.forEach((message: any) => this.loadMessageMedia(message))
        const total = Number(results?.pagination?.total)
        this.detailTotal = Number.isFinite(total) ? total : null
        this.detailPageIndex += 1
        this.detailOffset = this.detailLimit * (this.detailPageIndex - 1)
        this.detailHasMore = this.detailTotal !== null ? this.detailOffset < this.detailTotal : rows.length >= requestLimit
        await this.$nextTick()
        const updatedScroller = this.$refs.detailScroller as HTMLElement | undefined
        if (updatedScroller) {
          updatedScroller.scrollTop = isFirstPage
            ? updatedScroller.scrollHeight
            : updatedScroller.scrollHeight - previousHeight
        }
      } finally { this.isLoading = false }
    },
    handleDetailScroll(event: Event) {
      const element = event.target as HTMLElement
      if (element.scrollTop < 120) this.fetchChatMessages()
    }
  }
})
</script>
