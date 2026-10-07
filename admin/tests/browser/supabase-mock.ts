import type { Page } from '@playwright/test'

export const adminId = '11111111-1111-4111-8111-111111111111'
export const stamp = '2026-10-01T10:00:00.000Z'
export const imageBytes = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAoElEQVRoge2SQQkAQRDD6t9WPjWyPk7EPcJAIQLS0PB6mugGbED1iuxCvUt0AzagekV2od4lugEbUL0iu1DvEt2ADahekV2od4luwAZUr8gu1LtEN2ADqldkF+pdohuwAdUrsgv1LtEN2IDqFdmFepfoBmxA9YrsQr1LdAM2oHpFdqHeJboBG1C9IrtQ7xLdgA2oXpFdqHeJbsAGVK/4hw8EmQJK/hxWogAAAABJRU5ErkJggg==',
  'base64',
)
export const records = [
  ['Alex D’Souza', 'President'],
  ['Maya Rao', 'Design Lead'],
  ['Jordan Fernandes', 'Web Development'],
  ['Sam Pereira', 'Events Lead'],
  ['Casey Thomas', 'Community Lead'],
  ['Avery D’Souza', 'Web Development'],
  ['Jamie Patel', 'Design Lead'],
  ['Taylor Lewis', 'Secretary'],
  ['Morgan Kumar', 'Treasurer'],
].map(([name, role], index) => ({
  id: `33333333-3333-4333-8333-${String(index + 1).padStart(12, '0')}`,
  name,
  role,
  photo_url: null as string | null,
  photo_path: null as string | null,
  created_at: stamp,
  updated_at: stamp,
}))

export function session(expiresIn = 3600) {
  const now = Math.floor(Date.now() / 1000)
  const user = {
    id: adminId,
    email: 'admin@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
    created_at: stamp,
    last_sign_in_at: stamp,
  }
  const access_token = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: adminId, aud: 'authenticated', role: 'authenticated', exp: now + expiresIn, iat: now })).toString('base64url')}.test-signature`
  return {
    access_token,
    refresh_token: 'test-refresh-token',
    token_type: 'bearer',
    expires_in: expiresIn,
    expires_at: now + expiresIn,
    user,
  }
}

export async function mockSupabase(
  page: Page,
  options: { signedIn?: boolean; admin?: boolean; empty?: boolean; authInvalid?: boolean } = {},
) {
  const state = {
    members: options.empty ? [] : structuredClone(records),
    requests: [] as { method: string; path: string; body: unknown }[],
    failWrite: false,
    failUpload: false,
    failDelete: false,
    failCleanup: false,
    failList: false,
    conflict: false,
    isAdmin: options.admin ?? true,
    authInvalid: options.authInvalid ?? false,
  }
  if (options.signedIn !== false)
    await page.addInitScript(
      (value) => localStorage.setItem('sb-portal-test-auth-token', JSON.stringify(value)),
      session(),
    )
  await page.route('https://portal-test.supabase.co/**', async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      method = request.method()
    const path = url.pathname
    let body: unknown = null
    try {
      body = request.postDataJSON()
    } catch {
      /* Uploads are binary. */
    }
    state.requests.push({ method, path, body })
    const respond = (json: unknown, status = 200) =>
      route.fulfill({
        status,
        json,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': '*',
          'access-control-expose-headers': 'content-range',
        },
      })
    if (method === 'OPTIONS')
      return route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': '*',
          'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
        },
      })
    if (path.endsWith('/auth/v1/user'))
      return state.authInvalid
        ? respond({ message: 'Invalid token', code: 'bad_jwt' }, 401)
        : respond(session().user)
    if (path.endsWith('/auth/v1/token')) {
      const login = body as { password?: string }
      return login?.password === 'wrong-password'
        ? respond({ error_code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400)
        : respond(session())
    }
    if (path.endsWith('/auth/v1/logout')) return route.fulfill({ status: 204 })
    if (path.endsWith('/rest/v1/rpc/is_admin')) return respond(state.isAdmin)
    if (path.includes('/storage/v1/object/public/'))
      return route.fulfill({ contentType: 'image/png', body: imageBytes })
    if (path.startsWith('/storage/v1/object/')) {
      if (method === 'DELETE')
        return state.failCleanup
          ? respond({ message: 'Unavailable' }, 503)
          : respond((body as { prefixes: string[] }).prefixes.map((name) => ({ name })))
      return state.failUpload
        ? respond({ statusCode: '403', message: 'Upload denied' }, 403)
        : respond({ Key: path.replace('/storage/v1/object/', '') })
    }
    if (path === '/rest/v1/team_members') {
      if (method === 'GET') {
        if (state.failList) return respond({ code: 'PGRST205', message: 'Table unavailable' }, 404)
        const start = Number(url.searchParams.get('offset') || 0),
          limit = Number(url.searchParams.get('limit') || 500)
        return respond(state.members.slice(start, start + limit))
      }
      if (state.failWrite || (method === 'DELETE' && state.failDelete))
        return respond({ code: '42501', message: 'Denied' }, 403)
      if (state.conflict) return respond(null)
      if (method === 'POST') {
        const member = {
          ...records[0],
          ...(body as object),
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        state.members.unshift(member)
        return respond(member, 201)
      }
      const id = url.searchParams.get('id')?.replace('eq.', '')
      const index = state.members.findIndex((member) => member.id === id)
      if (index === -1) return respond(null)
      if (method === 'PATCH') {
        state.members[index] = {
          ...state.members[index],
          ...(body as object),
          updated_at: new Date().toISOString(),
        }
        return respond(state.members[index])
      }
      if (method === 'DELETE') {
        const [member] = state.members.splice(index, 1)
        return respond({ id: member.id })
      }
    }
    return respond({ message: `Unmocked request: ${method} ${path}` }, 501)
  })
  return state
}
