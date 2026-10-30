// Vercel Cron pings this endpoint so the free-tier Supabase project doesn't get paused for inactivity.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    return Response.json({ ok: false, error: 'Missing Supabase env vars' }, { status: 500 })
  }

  // RLS may return no rows for the anon key; the request still counts as database activity.
  const res = await fetch(`${url}/rest/v1/crops?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })

  if (!res.ok) {
    return Response.json({ ok: false, status: res.status }, { status: 502 })
  }
  return Response.json({ ok: true, timestamp: new Date().toISOString() })
}
