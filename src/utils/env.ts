// Environment variables utility
export const getEnvVars = () => {
  const stored = sessionStorage.getItem('n8n_env_vars')
  return stored ? JSON.parse(stored) : {}
}

// Use proxy URLs for CORS-free communication in development
export const getWhatsAppWebhookUrl = () => '/api/whatsapp'
export const getLeadsApiUrl = () => '/leads'
// GoWA is accessed through the local proxy to avoid browser CORS restrictions.
export const getChatList = (offset = 0, limit = 10) => `/api/chat-list?offset=${offset}&limit=${limit}`
export const getChatMessages = (chatId: string, offset = 0, limit = 20) =>
  `/api/chat-detail/${chatId}/messages?offset=${offset}&limit=${limit}`
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
