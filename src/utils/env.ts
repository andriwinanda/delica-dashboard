// Environment variables utility
export const getEnvVars = () => {
  const stored = sessionStorage.getItem('n8n_env_vars')
  return stored ? JSON.parse(stored) : {}
}

// External service URLs. GoWA must allow the deployed frontend origin via CORS.
export const getWhatsAppWebhookUrl = () => '/api/whatsapp'
export const getLeadsApiUrl = () => '/leads'
export const getChatList = (offset = 0, limit = 10) =>
  `${import.meta.env.VITE_GOWA_BASE_URL}/chats?offset=${offset}&limit=${limit}`
export const getChatMessages = (chatId: string, offset = 0, limit = 20) =>
  `${import.meta.env.VITE_GOWA_BASE_URL}/chat/${encodeURIComponent(chatId)}/messages?offset=${offset}&limit=${limit}`
export const getGowaHeaders = () => ({
  Authorization: `Basic ${btoa(`${import.meta.env.VITE_GOWA_USERNAME}:${import.meta.env.VITE_GOWA_PASSWORD}`)}`,
  'X-Device-Id': `085111528585`
})
export const getCustomersApiUrl = (id?: number | string) =>
  id === undefined ? '/customers' : `/customers/${id}`
export const getQuotationsApiUrl = (id?: number | string) =>
  id === undefined ? '/quotations' : `/quotations/${id}`
export const getBranchesApiUrl = (id?: number | string) =>
  id === undefined ? '/branch' : `/branch/${id}`
export const getBranchMutationsApiUrl = (id?: number | string) =>
  id === undefined ? '/branches' : `/branches/${id}`
export const getLocationsApiUrl = (id?: number | string) =>
  id === undefined ? '/location' : `/location/${id}`
export const getDashboardKpiApiUrl = () => '/dashboard/kpi'
export const getDashboardBranchesApiUrl = () => '/dashboard/branches'
export const getDashboardProductsApiUrl = () => '/dashboard/products'
export const getTakeoverWebhookUrl = () => '/takeover'
export const getLoginApiUrl = () => '/oauth/token'
export const getUserDetailsApiUrl = () => '/user/details'

// Keep original env vars for display purposes
export const getOriginalWhatsAppWebhookUrl = () => getEnvVars().whatsappWebhookUrl
export const getOriginalLeadsApiUrl = () => getEnvVars().leadsApiUrl
export const getOriginalTakeoverWebhookUrl = () => getEnvVars().takeoverWebhookUrl
export const getOriginalLoginApiUrl = () => getEnvVars().loginApiUrl
