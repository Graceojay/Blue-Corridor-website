"use client"

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const DEFAULT_FORM_NOTE = 'Private inquiries are reviewed directly. Response time is typically within two business days.'

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

async function getTurnstileToken() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!siteKey || !window.turnstile) return ''

  return new Promise((resolve, reject) => {
    let widgetId
    const container = document.createElement('div')
    container.style.display = 'none'
    document.body.appendChild(container)

    const cleanup = () => {
      try { if (widgetId !== undefined) window.turnstile.remove(widgetId) } catch {}
      container.remove()
    }

    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error('Verification timed out'))
    }, 15000)

    widgetId = window.turnstile.render(container, {
      sitekey: siteKey,
      size: 'invisible',
      callback: (token) => {
        window.clearTimeout(timeout)
        cleanup()
        resolve(token)
      },
      'error-callback': () => {
        window.clearTimeout(timeout)
        cleanup()
        reject(new Error('Verification failed'))
      },
    })

    window.turnstile.execute(widgetId)
  })
}

export default function SiteRuntime() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const header = document.querySelector('.site-header')
    const menuToggle = document.querySelector('.menu-toggle')
    const mobileNav = document.querySelector('.mobile-nav')

    const syncHeader = () => {
      if (header) header.classList.toggle('scrolled', window.scrollY > 24)
    }
    syncHeader()
    window.addEventListener('scroll', syncHeader, { passive: true })

    let closeMenu = () => {}
    let toggleMenu = () => {}
    let keyHandler = () => {}
    const mobileLinks = mobileNav ? Array.from(mobileNav.querySelectorAll('a')) : []

    if (menuToggle && mobileNav) {
      closeMenu = () => {
        menuToggle.classList.remove('open')
        menuToggle.setAttribute('aria-expanded', 'false')
        mobileNav.classList.remove('open')
        document.body.classList.remove('nav-open')
      }
      toggleMenu = () => {
        const isOpen = menuToggle.classList.toggle('open')
        menuToggle.setAttribute('aria-expanded', String(isOpen))
        mobileNav.classList.toggle('open', isOpen)
        document.body.classList.toggle('nav-open', isOpen)
      }
      keyHandler = (event) => { if (event.key === 'Escape') closeMenu() }
      menuToggle.addEventListener('click', toggleMenu)
      mobileLinks.forEach((link) => link.addEventListener('click', closeMenu))
      window.addEventListener('keydown', keyHandler)
    }

    const revealItems = document.querySelectorAll('[data-reveal]')
    let observer
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      }, { threshold: 0.12 })
      revealItems.forEach((item) => observer.observe(item))
    } else {
      revealItems.forEach((item) => item.classList.add('visible'))
    }

    const interest = new URLSearchParams(window.location.search).get('interest')
    const interestSelect = document.querySelector('#interest')
    if (interest && interestSelect) {
      const match = Array.from(interestSelect.options).find(
        (option) => option.value.toLowerCase() === interest.toLowerCase()
      )
      if (match) interestSelect.value = match.value
    }

    document.querySelectorAll('[data-year]').forEach((element) => {
      element.textContent = new Date().getFullYear()
    })

    const contactForm = document.querySelector('[data-contact-form]')
    const submitButton = contactForm?.querySelector('button[type="submit"]')
    const formNote = contactForm?.querySelector('.form-note')
    const originalButtonHtml = submitButton?.innerHTML || ''

    const submitContactForm = async (event) => {
      event.preventDefault()
      if (!contactForm || !submitButton || contactForm.dataset.submitting === 'true') return

      if (!contactForm.reportValidity()) return

      contactForm.dataset.submitting = 'true'
      submitButton.disabled = true
      submitButton.setAttribute('aria-busy', 'true')
      submitButton.textContent = 'Submitting…'
      if (formNote) {
        formNote.textContent = 'Submitting your inquiry securely…'
        formNote.setAttribute('role', 'status')
        formNote.setAttribute('aria-live', 'polite')
      }

      try {
        const data = new FormData(contactForm)
        let turnstileToken = ''
        try { turnstileToken = await getTurnstileToken() } catch {}

        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: data.get('name') || '',
            email: data.get('email') || '',
            organization: data.get('organization') || '',
            role: data.get('role') || '',
            interest: data.get('interest') || '',
            message: data.get('message') || '',
            botField: data.get('bot-field') || '',
            turnstileToken,
            pageUri: window.location.href,
            pageName: document.title || 'Blue Corridor Global Website Inquiry',
            hutk: getCookie('hubspotutk'),
          }),
        })

        const result = await response.json().catch(() => ({}))
        if (!response.ok || !result.ok) {
          throw new Error(result.message || 'Your inquiry could not be submitted. Please try again.')
        }

        contactForm.reset()
        if (formNote) formNote.textContent = result.message || 'Thank you. Your inquiry has been received and will be reviewed carefully.'
        submitButton.textContent = 'Inquiry Submitted ✓'
      } catch (error) {
        if (formNote) {
          formNote.textContent = error.message || 'Something went wrong. Please try again or email info@bluecorridorglobal.com.'
          formNote.setAttribute('role', 'alert')
        }
        submitButton.innerHTML = originalButtonHtml
        submitButton.disabled = false
        submitButton.removeAttribute('aria-busy')
        contactForm.dataset.submitting = 'false'
      }
    }

    if (contactForm) {
      if (formNote && !formNote.textContent.trim()) formNote.textContent = DEFAULT_FORM_NOTE
      contactForm.addEventListener('submit', submitContactForm)
    }

    return () => {
      window.removeEventListener('scroll', syncHeader)
      if (menuToggle) menuToggle.removeEventListener('click', toggleMenu)
      mobileLinks.forEach((link) => link.removeEventListener('click', closeMenu))
      window.removeEventListener('keydown', keyHandler)
      if (observer) observer.disconnect()
      if (contactForm) contactForm.removeEventListener('submit', submitContactForm)
      document.body.classList.remove('nav-open')
    }
  }, [pathname, searchParams])

  return null
}
