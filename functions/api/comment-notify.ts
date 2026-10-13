interface CommentNotificationEnv {
    RESEND_API_KEY?: string
    COMMENT_NOTIFY_TO?: string
    COMMENT_NOTIFY_FROM?: string
    COMMENT_NOTIFY_ORIGIN?: string
}

interface CommentPayload {
    nick?: string
    mail?: string
    link?: string
    comment?: string
    url?: string
}

const recipient = '1490934761@qq.com'

function escapeHtml(value: unknown): string {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

function isPayload(value: unknown): value is CommentPayload {
    if (!value || typeof value !== 'object') return false
    const payload = value as CommentPayload
    return typeof payload.comment === 'string' && payload.comment.trim().length > 0 && payload.comment.length <= 10000
}

export async function onRequestPost({ request, env }: { request: Request; env: CommentNotificationEnv }): Promise<Response> {
    const origin = env.COMMENT_NOTIFY_ORIGIN
    if (!origin || request.headers.get('Origin') !== origin) return new Response('Forbidden', { status: 403 })
    if (!env.RESEND_API_KEY || !env.COMMENT_NOTIFY_FROM) return new Response('Mail service is not configured', { status: 503 })

    let payload: unknown
    try {
        payload = await request.json()
    } catch {
        return new Response('Invalid JSON', { status: 400 })
    }
    if (!isPayload(payload)) return new Response('Invalid comment', { status: 400 })

    const subject = `博客新留言：${String(payload.nick || '匿名用户').slice(0, 80)}`
    const text = [
        `留言人：${payload.nick || '匿名用户'}`,
        `邮箱：${payload.mail || '未填写'}`,
        `页面：${payload.url || '未知'}`,
        '',
        payload.comment,
    ].join('\n')
    const html = `<h2>${escapeHtml(subject)}</h2><p><strong>留言人：</strong>${escapeHtml(payload.nick || '匿名用户')}</p><p><strong>邮箱：</strong>${escapeHtml(payload.mail || '未填写')}</p><p><strong>页面：</strong>${escapeHtml(payload.url || '未知')}</p><hr><div>${escapeHtml(payload.comment).replace(/\n/g, '<br>')}</div>`
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: env.COMMENT_NOTIFY_FROM, to: [env.COMMENT_NOTIFY_TO || recipient], subject, text, html }),
    })
    if (!response.ok) return new Response('Mail service failed', { status: 502 })
    return new Response(null, { status: 204 })
}
