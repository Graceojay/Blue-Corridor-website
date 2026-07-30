import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 8
const requestLog = new Map()

const LIMITS = {
  name: 120,
  email: 254,
  organization: 160,
  role: 120,
  interest: 120,
  message: 5000,
  pageUri: 2048,
  pageName: 160,
}

const ALLOWED_INTERESTS = new Set([
  'Executive Advisory',
  'Alignment Lab',
  'Legacy Advisory',
  'CHAPTERS Partnership',
  'CHAPTERS Deployment',
  'Speaking',
  'Founder or Media Inquiry',
  'Other',
])

function json(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function clean(value, maxLength) {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\u0000/g, '').slice(0, maxLength)
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= LIMITS.email
}

function splitName(fullName) {
  const parts = fullName.split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return { firstname: fullName, lastname: '' }
  return {
    firstname: parts.slice(0, -1).join(' '),
    lastname: parts.at(-1),
  }
}

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  return (forwarded?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim()
}

function isRateLimited(key) {
  const now = Date.now()
  const recent = (requestLog.get(key) || []).filter((timestamp) => now - timestamp < WINDOW_MS)
  recent.push(now)
  requestLog.set(key, recent)

  if (requestLog.size > 1000) {
    for (const [storedKey, timestamps] of requestLog.entries()) {
      if (!timestamps.some((timestamp) => now - timestamp < WINDOW_MS)) requestLog.delete(storedKey)
    }
  }

  return recent.length > MAX_REQUESTS
}

function cookieValue(cookieHeader, name) {
  if (!cookieHeader) return ''
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

async function verifyTurnstile(token, ipAddress) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false

  const formData = new FormData()
  formData.set('secret', secret)
  formData.set('response', token)
  if (ipAddress && ipAddress !== 'unknown') formData.set('remoteip', ipAddress)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
    cache: 'no-store',
  })

  if (!response.ok) return false
  const result = await response.json()
  return result.success === true
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return json({ ok: false, message: 'Invalid submission format.' }, 415)
    }

    const ipAddress = getClientIp(request)
    if (isRateLimited(ipAddress)) {
      return json({ ok: false, message: 'Too many attempts. Please wait and try again.' }, 429)
    }

    const body = await request.json()

    // Honeypot: legitimate visitors never complete this field.
    if (clean(body.botField, 200)) return json({ ok: true })

    const name = clean(body.name, LIMITS.name)
    const email = clean(body.email, LIMITS.email).toLowerCase()
    const organization = clean(body.organization, LIMITS.organization)
    const role = clean(body.role, LIMITS.role)
    const interest = clean(body.interest, LIMITS.interest)
    const message = clean(body.message, LIMITS.message)
    const pageUri = clean(body.pageUri, LIMITS.pageUri)
    const pageName = clean(body.pageName, LIMITS.pageName) || 'Blue Corridor Global Website Inquiry'
    const turnstileToken = clean(body.turnstileToken, 2048)
    const submittedHutk = clean(body.hutk, 200)

    if (!name || !email || !interest || !message) {
      return json({ ok: false, message: 'Please complete all required fields.' }, 400)
    }
    if (!isEmail(email)) {
      return json({ ok: false, message: 'Please enter a valid email address.' }, 400)
    }
    if (!ALLOWED_INTERESTS.has(interest)) {
      return json({ ok: false, message: 'Please select a valid area of interest.' }, 400)
    }

    const turnstileValid = await verifyTurnstile(turnstileToken, ipAddress)
    if (!turnstileValid) {
      return json({ ok: false, message: 'We could not verify this submission. Please refresh and try again.' }, 400)
    }

    const portalId = process.env.HUBSPOT_PORTAL_ID
    const formGuid = process.env.HUBSPOT_FORM_GUID
    const interestProperty = process.env.HUBSPOT_INTEREST_PROPERTY || 'service_interest'
    const messageProperty = process.env.HUBSPOT_MESSAGE_PROPERTY || 'website_inquiry_message'

    if (!portalId || !formGuid) {
      console.error('Missing HUBSPOT_PORTAL_ID or HUBSPOT_FORM_GUID')
      return json({ ok: false, message: 'The inquiry service is temporarily unavailable. Please email info@bluecorridorglobal.com.' }, 503)
    }

    const { firstname, lastname } = splitName(name)
    const fields = [
      { name: 'firstname', value: firstname },
      ...(lastname ? [{ name: 'lastname', value: lastname }] : []),
      { name: 'email', value: email },
      ...(organization ? [{ name: 'company', value: organization }] : []),
      ...(role ? [{ name: 'jobtitle', value: role }] : []),
      { name: interestProperty, value: interest },
      { name: messageProperty, value: message },
    ]

    const cookieHeader = request.headers.get('cookie') || ''
    const hutk = cookieValue(cookieHeader, 'hubspotutk') || submittedHutk
    const context = {
      pageName,
      ...(pageUri ? { pageUri } : {}),
      ...(hutk ? { hutk } : {}),
      ...(ipAddress !== 'unknown' ? { ipAddress } : {}),
    }

    const hubspotResponse = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(portalId)}/${encodeURIComponent(formGuid)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submittedAt: String(Date.now()),
          fields,
          context,
        }),
        cache: 'no-store',
      }
    )

    if (!hubspotResponse.ok) {
      const responseText = await hubspotResponse.text()
      console.error('HubSpot form submission failed', hubspotResponse.status, responseText)
      return json({ ok: false, message: 'Your inquiry could not be submitted. Please try again or email info@bluecorridorglobal.com.' }, 502)
    }

    return json({
      ok: true,
      message: 'Thank you. Your inquiry has been received and will be reviewed carefully.',
    })
  } catch (error) {
    console.error('Contact form error', error)
    return json({ ok: false, message: 'Something went wrong. Please try again or email info@bluecorridorglobal.com.' }, 500)
  }
}
