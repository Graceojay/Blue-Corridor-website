"use client"

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

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

    return () => {
      window.removeEventListener('scroll', syncHeader)
      if (menuToggle) menuToggle.removeEventListener('click', toggleMenu)
      mobileLinks.forEach((link) => link.removeEventListener('click', closeMenu))
      window.removeEventListener('keydown', keyHandler)
      if (observer) observer.disconnect()
      document.body.classList.remove('nav-open')
    }
  }, [pathname, searchParams])

  return null
}
