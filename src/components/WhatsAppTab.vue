<template>
  <div class="flex items-center justify-between mb-8 page-height">
    <div>
      <h2 class="text-2xl font-bold">WhatsApp Messages</h2>
      <p class="text-sm text-gray-500">Status of automated WhatsApp messages.</p>
    </div>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 min-w-0 p-4 sm:p-6">
      <div class="pb-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
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

      <div class="h-[50dvh] lg:h-[500px] overflow-y-auto pr-2 scrollbar-thin" @scroll.passive="handleMessageScroll">
        <div v-if="!selectedMessage && isListLoading" v-for="value in 15">
          <div class="w-full h-20 rounded bg-gray-200 mb-2"></div>
        </div>

        <div v-for="msg in messages" :key="msg.jid" @click="showDetailMessage(msg)"
          :class="['group p-4 mb-4! border border-gray-300 me-1 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-500 hover:border-gray-500 hover:text-white transition-colors cursor-pointer', selectedMessage && selectedMessage.jid == msg.jid ? 'border-gray-500! bg-gray-500! text-white!' : '']">
          <div
            class="flex h-10 w-10 me-4 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[18px] font-bold text-gray-400">

            {{ msg.name.charAt(0) }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="min-w-0 break-words font-bold text-sm">{{ msg.name }}
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
        <p v-if="selectedMessage && isListLoading" class="py-3 text-center text-xs text-gray-400">Loading more
          messages...
        </p>
        <p v-else-if="!hasMore && messages.length" class="py-3 text-center text-xs text-gray-400">All messages loaded
        </p>
      </div>
    </div>

    <div v-if="selectedMessage" class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div v-if="selectedMessage">

        <div class="p-4 sm:p-6 pb-4 flex flex-wrap items-center gap-y-3">
          <div
            class="flex h-10 w-10 me-4 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[18px] font-bold text-gray-400">
            {{ selectedMessage.name.charAt(0) }}
          </div>
          <div>
            <h3 class="font-bold text-lg flex flex-col items-start gap-2 sm:flex-row sm:items-center">{{ selectedMessage.name }}
              <span :class="[
                'text-[12px] px-2 py-0.5 border border-gray-200 rounded-full text-sm uppercase tracking-wider bg-gray-100 text-gray-600'
              ]">
                +{{ selectedMessage.jid.replace('@s.whatsapp.net', '') }}
              </span>
            </h3>
            <p class="text-[12px] text-gray-500">Last chat {{ moment(selectedMessage.last_message_time).fromNow() }}</p>
          </div>
          <button type="button" @click="openLeadForm"
            :disabled="isAddingLead || addedLeadJids.includes(selectedMessage.jid)"
            class="ml-auto min-h-11 rounded-lg bg-blue-500 px-3 py-2 text-sm text-white disabled:opacity-50">
            {{ addedLeadJids.includes(selectedMessage.jid) ? 'Added to Leads' : 'Add to Leads' }}
          </button>
        </div>
        <dialog v-if="showLeadForm" open
          class="!fixed !inset-0 !z-50 !m-0 flex !h-screen !w-screen !max-h-none !max-w-none items-center justify-center bg-black/40 p-4"
          @click.self="showLeadForm = false" @keydown.esc="showLeadForm = false">
          <form v-if="showLeadForm" @submit.prevent="addSelectedChatToLeads"
            class="w-full max-w-xl space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label class="text-sm">Name
                <input v-model="leadForm.name" required :disabled="isAddingLead"
                  class="mt-1 w-full rounded-md border border-gray-200 p-2" />
              </label>
              <label class="text-sm">Phone
                <input v-model="leadForm.phone" readonly
                  class="mt-1 w-full rounded-md border border-gray-200 bg-gray-100 p-2" />
              </label>
              <label class="text-sm">Location
                <input v-model="leadForm.location" required :disabled="isAddingLead" placeholder="Medan"
                  class="mt-1 w-full rounded-md border border-gray-200 p-2" />
              </label>
              <label class="text-sm">Branch
                <input v-model="leadForm.branch" required :disabled="isAddingLead" placeholder="medan"
                  class="mt-1 w-full rounded-md border border-gray-200 p-2" />
              </label>
            </div>
            <label class="block text-sm">Message
              <textarea v-model="leadForm.message" :disabled="isAddingLead" rows="3"
                class="mt-1 w-full rounded-md border border-gray-200 p-2"></textarea>
            </label>
            <label class="block text-sm">Notes
              <textarea v-model="leadForm.notes" :disabled="isAddingLead" rows="2"
                class="mt-1 w-full rounded-md border border-gray-200 p-2"></textarea>
            </label>
            <p class="text-xs text-gray-500">Source: WhatsApp · Status: New</p>
            <p v-if="leadError" role="alert" class="text-sm text-red-600">{{ leadError }}</p>
            <div class="flex justify-end gap-2">
              <button type="button" @click="showLeadForm = false" :disabled="isAddingLead"
                class="rounded-md border border-gray-200 px-4 py-2 text-sm">Cancel</button>
              <button type="submit" :disabled="isAddingLead"
                class="rounded-md bg-blue-500 px-4 py-2 text-sm text-white disabled:opacity-50">{{ isAddingLead ?
                  'Saving...' : 'Save Lead' }}</button>
            </div>
          </form>
        </dialog>
        <p v-if="leadSuccess" role="status" class="px-6 pb-4 text-sm text-green-600">{{ leadSuccess }}</p>
        <div ref="detailScroller" class="h-[50dvh] lg:h-[500px] overflow-y-auto pr-2 space-y-4 rounded scrollbar-thin bg-[#F8F9FA]"
          @scroll.passive="handleDetailScroll">
          <p v-if="isLoading" class="py-2 text-center text-xs text-gray-400">Loading older messages...</p>
          <div v-for="(msg, idx) in detailMessages" :key="msg.id || idx" class="flex flex-col gap-2 px-3 sm:px-6 py-4">
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
              <div class="bg-blue-500 relative text-white px-2 pt-2 pb-6 rounded-md w-fit max-w-[90%] sm:max-w-xs">
                <img v-if="msg.media_type === 'image' && mediaUrls[msg.id]" :src="mediaUrls[msg.id]"
                  :alt="msg.filename || 'WhatsApp image'" class="block max-h-72 max-w-full rounded object-contain"
                  loading="lazy" role="button" tabindex="0"
                  @click="openImagePreview(mediaUrls[msg.id], msg.filename || 'WhatsApp image')"
                  @keydown.enter="openImagePreview(mediaUrls[msg.id], msg.filename || 'WhatsApp image')"
                  @keydown.space.prevent="openImagePreview(mediaUrls[msg.id], msg.filename || 'WhatsApp image')">
                <video v-else-if="msg.media_type === 'video' && mediaUrls[msg.id]" :src="mediaUrls[msg.id]" controls
                  playsinline preload="metadata" class="block max-h-72 max-w-full rounded bg-black">
                  Your browser does not support video playback.
                </video>
                <p v-else-if="isSupportedMedia(msg) && loadingMediaIds.includes(String(msg.id))"
                  class="px-2 py-3 text-sm text-blue-100">Memuat media...</p>
                <p v-else-if="isSupportedMedia(msg) && failedMediaIds.includes(String(msg.id))"
                  class="px-2 py-3 text-sm text-blue-100">Media tidak dapat dimuat</p>
                <p v-if="msg.content" class="px-2 pt-2 whitespace-pre-wrap break-words">{{ msg.content }}</p>
                <span class="absolute! bottom-2 right-4 text-xs text-white ml-2">{{ moment(msg.created_at ||
                  msg.timestamp).format('HH:mm')
                }}</span>
              </div>
            </div>

            <!-- Incoming (kiri) -->
            <div v-else class="flex justify-start">
              <div class="bg-gray-200 relative text-black px-2 pt-2 pb-6 rounded-md w-fit max-w-[90%] sm:max-w-xs min-w-24">
                <img v-if="msg.media_type === 'image' && mediaUrls[msg.id]" :src="mediaUrls[msg.id]"
                  :alt="msg.filename || 'WhatsApp image'" class="block max-h-72 max-w-full rounded object-contain"
                  loading="lazy" role="button" tabindex="0"
                  @click="openImagePreview(mediaUrls[msg.id], msg.filename || 'WhatsApp image')"
                  @keydown.enter="openImagePreview(mediaUrls[msg.id], msg.filename || 'WhatsApp image')"
                  @keydown.space.prevent="openImagePreview(mediaUrls[msg.id], msg.filename || 'WhatsApp image')">
                <video v-else-if="msg.media_type === 'video' && mediaUrls[msg.id]" :src="mediaUrls[msg.id]" controls
                  playsinline preload="metadata" class="block max-h-72 max-w-full rounded bg-black">
                  Your browser does not support video playback.
                </video>
                <p v-else-if="isSupportedMedia(msg) && loadingMediaIds.includes(String(msg.id))"
                  class="px-2 py-3 text-sm text-gray-500">Memuat media...</p>
                <p v-else-if="isSupportedMedia(msg) && failedMediaIds.includes(String(msg.id))"
                  class="px-2 py-3 text-sm text-gray-500">Media tidak dapat dimuat</p>
                <p v-if="msg.content" class="px-2 pt-2 whitespace-pre-wrap break-words">{{ msg.content }}</p>
                <span class="absolute! bottom-2 right-4 text-xs text-gray-500 ml-2">{{ moment(msg.created_at ||
                  msg.timestamp).format('HH:mm')
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <form @submit.prevent="sendWhatsAppMessage" class="border-t border-gray-100 bg-gray-50 p-4 rounded-b-xl">
          <div class="flex items-end gap-3">
            <textarea v-model="form.message" :disabled="isSending" aria-label="Message" rows="2"
              class="flex-1 min-w-0 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Type a message..." required></textarea>
            <button type="submit" :disabled="isSending || !form.message.trim()"
              :aria-label="isSending ? 'Sending message' : 'Send message'"
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Send :size="20" :class="{ 'animate-pulse': isSending }" />
            </button>
          </div>
          <p v-if="sendError" role="alert" class="mt-2 text-sm text-red-600">{{ sendError }}</p>
          <p v-if="sendSuccess" role="status" class="mt-2 text-sm text-green-600">{{ sendSuccess }}</p>
        </form>
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

    <!-- <div class="bg-white rounded-xl shadow-sm border border-gray-100 min-w-0 p-4 sm:p-6">
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

  <!-- <Teleport to="body"> -->
  <dialog v-if="previewImageUrl" open
    class="!fixed !inset-0 !z-50 !m-0 flex !h-screen !w-screen !max-h-none !max-w-none items-center justify-center bg-black/40 !p-4 relative"
    @click.self="closeImagePreview" @keydown.esc="closeImagePreview">
    <div class="bg-white max-w-full !h-[calc(100dvh-100px)] rounded items-center justify-center p-6 relative">
      <button type="button"
        class="!absolute -right-3 -top-3 pb-1  flex h-9 w-9 items-center justify-center rounded-full bg-white text-3xl text-black shadow hover:bg-gray-100"
        aria-label="Close image preview" @click="closeImagePreview">
        &times;
      </button>
      <img :src="previewImageUrl" :alt="previewImageAlt" class="max-h-full max-w-full object-contain" @click.stop>

    </div>
  </dialog>


</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axiosHelper, { getApiErrorMessage, isApiRateLimited } from '@/utils/axiosHelper'
import { getWhatsAppWebhookUrl, getTakeoverWebhookUrl, getLeadsApiUrl, getChatList, getChatMessages, getMessageMediaDownload, getGowaHeaders } from '@/utils/env'
import {
  ArrowRight,
  MessageSquare,
  RefreshCw,
  Send
} from 'lucide-vue-next'
import moment from 'moment';

const HIDDEN_CHAT_NUMBERS = new Set([
  '62895335202843'
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
      showLeadForm: false,
      isAddingLead: false,
      leadError: '',
      leadSuccess: '',
      addedLeadJids: [] as string[],
      leadForm: { name: '', phone: '', notes: '', message: '', location: '', branch: '' },
      isSending: false,
      sendError: '',
      sendSuccess: '',
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
      previewImageUrl: '',
      previewImageAlt: '',
      form: {
        message: ''
      },
      moment
    }
  },
  mounted() {
    this.fetchChatList()
    window.addEventListener('keydown', this.handlePreviewKeydown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handlePreviewKeydown)
    if (this.previewImageUrl) document.body.style.overflow = ''
    Object.values(this.mediaUrls).forEach((url) => URL.revokeObjectURL(url))
  },
  methods: {
    openLeadForm() {
      if (!this.selectedMessage || this.isAddingLead) return
      const incoming = [...this.detailMessages].reverse().find((msg: any) => !msg.is_from_me && msg.content)
      this.leadForm = {
        name: this.selectedMessage.name || '',
        phone: this.selectedMessage.jid.split('@')[0].replace(/\D/g, ''),
        notes: 'New leads, hubungi segera',
        message: incoming?.content || '',
        location: '',
        branch: ''
      }
      this.leadError = ''
      this.leadSuccess = ''
      this.showLeadForm = true
    },
    async addSelectedChatToLeads() {
      const jid = this.selectedMessage?.jid
      if (!jid || this.isAddingLead || this.addedLeadJids.includes(jid)) return
      const payload = {
        name: this.leadForm.name.trim(),
        phone: this.leadForm.phone,
        source: 'whatsapp',
        notes: this.leadForm.notes.trim(),
        message: this.leadForm.message.trim(),
        location: this.leadForm.location.trim(),
        branch: this.leadForm.branch.trim(),
        status: 'new'
      }
      this.leadError = ''
      if (!payload.name || !payload.phone || !payload.location || !payload.branch) {
        this.leadError = 'Please fill in name, location, and branch.'
        return
      }
      this.isAddingLead = true
      try {
        const response = await axiosHelper.post(getLeadsApiUrl(), payload)
        if (response.data?.success === false) {
          if (this.selectedMessage?.jid === jid) this.leadError = response.data?.message || 'Unable to add lead.'
          return
        }
        this.addedLeadJids.push(jid)
        if (this.selectedMessage?.jid === jid) {
          this.showLeadForm = false
          this.leadSuccess = 'Lead added successfully.'
        }
      } catch (error) {
        if (this.selectedMessage?.jid === jid) this.leadError = getApiErrorMessage(error, 'Unable to add lead. Please try again.')
      } finally {
        this.isAddingLead = false
      }
    },
    async sendWhatsAppMessage() {
      if (this.isSending) return
      this.sendError = ''
      this.sendSuccess = ''
      const phone = this.selectedMessage?.jid || ''
      const message = this.form.message.trim()
      if (!phone || !message) {
        this.sendError = 'Select a chat and enter a message.'
        return
      }
      this.isSending = true
      try {
        const response = await axiosHelper.post('gowa/send/message', { message, phone }, {
          headers: getGowaHeaders()
        })
        if (this.selectedMessage?.jid !== phone) return
        if (response.data?.success === false) {
          this.sendError = response.data?.message || 'Unable to send message.'
          return
        }
        this.form.message = ''
        this.sendSuccess = 'Message sent successfully.'
        try {
          await this.refreshSentChat(phone)
        } catch {
          if (this.selectedMessage?.jid === phone) {
            this.sendSuccess = 'Message sent. Unable to refresh the chat; reopen it to see the latest messages.'
          }
        }
      } catch (error) {
        if (this.selectedMessage?.jid === phone) {
          this.sendError = getApiErrorMessage(error, 'Unable to send message. Please try again.')
        }
      } finally {
        this.isSending = false
      }
    },

    async refreshSentChat(phone: string) {
      // Reload the pages already visible so older bubbles remain available.
      const pageCount = Math.max(1, this.detailPageIndex - 1)
      const limit = pageCount * this.detailLimit
      const response = await axiosHelper.get(getChatMessages(phone, 0, limit), {
        headers: getGowaHeaders()
      })
      if (this.selectedMessage?.jid !== phone) return
      const results = response.data?.results ?? response.data?.result ?? response.data
      const rows = Array.isArray(results?.data) ? results.data : []
      this.detailMessages = [...rows].reverse()
      this.detailMessages.forEach((message: any) => this.loadMessageMedia(message))
      const total = Number(results?.pagination?.total)
      this.detailTotal = Number.isFinite(total) ? total : null
      this.detailPageIndex = pageCount + 1
      this.detailOffset = limit
      this.detailHasMore = this.detailTotal !== null ? limit < this.detailTotal : rows.length >= limit
      await this.$nextTick()
      const scroller = this.$refs.detailScroller as HTMLElement | undefined
      if (scroller) scroller.scrollTop = scroller.scrollHeight
    },

    openImagePreview(url: string, alt: string) {
      this.previewImageUrl = url
      this.previewImageAlt = alt
      document.body.style.overflow = 'hidden'
    },

    closeImagePreview() {
      this.previewImageUrl = ''
      this.previewImageAlt = ''
      document.body.style.overflow = ''
    },

    handlePreviewKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape' && this.previewImageUrl) this.closeImagePreview()
    },

    isSupportedMedia(message: any) {
      return message?.media_type === 'image' || message?.media_type === 'video'
    },

    async loadMessageMedia(message: any) {
      const id = String(message?.id || '')
      if (
        !this.isSupportedMedia(message) ||
        !id ||
        this.mediaUrls[id] ||
        this.loadingMediaIds.includes(id) ||
        this.failedMediaIds.includes(id)
      ) return

      this.loadingMediaIds.push(id)
      try {
        const response = await axiosHelper.get(getMessageMediaDownload(id), {
          params: { phone: message.chat_jid },
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
      if (isApiRateLimited()) return
      if (this.isListLoading || (!this.hasMore && !reset)) return
      if (reset) { this.offset = 0; this.chatPageIndex = 1; this.chatTotal = null; this.hasMore = true; this.messages = [] }
      if (this.chatTotal !== null && this.offset >= this.chatTotal) { this.hasMore = false; return }
      this.isListLoading = true
      const requestLimit = this.limit
      this.offset = this.limit * (this.chatPageIndex - 1)
      const leadsUrl = getChatList(this.offset, requestLimit)

      if (!leadsUrl) {
        this.isListLoading = false
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
          this.hasMore = this.chatTotal !== null ? this.offset < this.chatTotal : rows.length >= requestLimit
          if (!this.selectedMessage && this.messages.length) await this.showDetailMessage(this.messages[0])
        }
      } catch (error: any) {
        // Leave pagination available for a manual retry, without recursively retrying errors.
        return
      } finally {
        this.isListLoading = false
      }

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
      if (!this.messages.length) return
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
      this.form.message = ''
      this.sendError = ''
      this.sendSuccess = ''
      this.selectedMessage = msg
      this.showLeadForm = false
      this.leadError = ''
      this.leadSuccess = ''
      this.detailMessages = []
      this.detailOffset = 0
      this.detailPageIndex = 1
      this.detailTotal = null
      this.detailHasMore = true
      await this.fetchChatMessages()
    },
    async fetchChatMessages() {
      if (isApiRateLimited()) return
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
      } catch {
        // Axios displays the error; allow scrolling or reopening the chat to retry later.
      } finally { this.isLoading = false }
    },
    handleDetailScroll(event: Event) {
      if (!this.detailMessages) return
      const element = event.target as HTMLElement
      if (element.scrollTop < 120) this.fetchChatMessages()
    }
  }
})
</script>
