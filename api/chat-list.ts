import type { IncomingMessage, ServerResponse } from 'node:http'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') { res.statusCode = 405; res.setHeader('Allow', 'GET'); res.end('Method Not Allowed'); return }
  const { GOWA_BASE_URL: baseUrl, GOWA_USERNAME: username, GOWA_PASSWORD: password } = process.env
  if (!baseUrl || !username || !password) { res.statusCode = 500; res.end('GoWA server configuration is missing'); return }
  const requestUrl = new URL(req.url || '/', 'http://localhost')
  const targetUrl = new URL('/chats', baseUrl); targetUrl.search = requestUrl.search
  const response = await fetch(targetUrl, { headers: { Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}` } })
  res.statusCode = response.status; res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json'); res.end(await response.text())
}
