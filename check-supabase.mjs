// Standalone check — no Next, no bundler. Run: node check-supabase.mjs
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => {
      const i = line.indexOf('=')
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    }),
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

console.log('URL  :', JSON.stringify(url))
console.log('key  :', key ? `${key.slice(0, 12)}... (${key.length} chars)` : 'MISSING')

if (!url || !key) process.exit(1)

const parsed = new URL(url)
if (parsed.pathname !== '/' && parsed.pathname !== '') {
  console.log(`\n>>> PROBLEM: URL has a path ("${parsed.pathname}"). This causes PGRST125.`)
  console.log(`>>> Should be: ${parsed.protocol}//${parsed.host}`)
}

const target = `${parsed.protocol}//${parsed.host}/rest/v1/gifts?select=id&limit=1`
console.log('\nGET', target)

const res = await fetch(target, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
})

console.log('status:', res.status)
console.log('body  :', await res.text())
