# Blue Corridor Global — Original Next.js V7 with HubSpot Form Repair

This is the original approved Next.js V7 build with a narrowly scoped form repair. No page copy, visual CSS, imagery, spacing, routes or existing interactions were redesigned.

## What changed

- Replaced the inactive Netlify form attributes on the Contact page with the existing form posting through `/api/contact`.
- Added `app/api/contact/route.js` for validation, honeypot screening, best-effort rate limiting and HubSpot Forms API submission.
- Added inline success and failure messaging through the form's existing note element.
- Added optional HubSpot site tracking when `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` is configured.
- Added optional invisible Cloudflare Turnstile support. It remains disabled unless both Turnstile environment variables are supplied.

The original build contains one actual inquiry form: the Contact page. Other site buttons link visitors to that form with an area-of-interest value.

## HubSpot receiving form

The published HubSpot form should be named:

`Blue Corridor Global | Website Inquiry`

It must include these contact properties:

- `firstname`
- `lastname`
- `email`
- `company`
- `jobtitle`
- `service_interest`
- `website_inquiry_message`

The website retains its single Full name field. The server sends the final word to `lastname` and the preceding words to `firstname`.

Configure the HubSpot form's internal submission notification recipient as `info@bluecorridorglobal.com`. HubSpot, not the website server, sends that internal notification after accepting the submission.

## Required Vercel environment variables

Add these under **Vercel → Project → Settings → Environment Variables**:

```bash
HUBSPOT_PORTAL_ID=your_hubspot_account_id
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=your_hubspot_account_id
HUBSPOT_FORM_GUID=your_published_form_guid
HUBSPOT_INTEREST_PROPERTY=service_interest
HUBSPOT_MESSAGE_PROPERTY=website_inquiry_message
```

Set them for Production. Set them for Preview too if the form will be tested on a Vercel preview deployment.

Do not put quotation marks around the values.

## Optional Turnstile protection

After the basic form is confirmed working, create an Invisible Cloudflare Turnstile widget and add both:

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_public_site_key
TURNSTILE_SECRET_KEY=your_private_secret_key
```

If these are omitted, the form still uses a hidden honeypot, server-side validation, field limits and best-effort request throttling.

## Deploy safely

1. Back up or retain the current production deployment in Vercel.
2. Deploy this folder to the existing Vercel project.
3. Add the required environment variables.
4. Build and deploy.
5. Submit a real test inquiry from `/contact`.
6. Confirm the contact and form activity in HubSpot.
7. Confirm the HubSpot internal notification reaches `info@bluecorridorglobal.com`.

## Local check

```bash
npm install
cp .env.example .env.local
npm run dev
```

Production build:

```bash
npm run build
npm start
```
