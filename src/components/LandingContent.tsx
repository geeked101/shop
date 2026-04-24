'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import '@/app/landing.css'

export default function LandingContent() {
  const [scrolled, setScrolled] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Nav scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll)
    
    // Custom cursor effect
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX - 6}px`
        cursorRef.current.style.top = `${e.clientY - 6}px`
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    
    // Cursor hover expansion
    const handleMouseEnter = () => cursorRef.current?.classList.add('big')
    const handleMouseLeave = () => cursorRef.current?.classList.remove('big')
    
    const interactiveElements = document.querySelectorAll('a, button, .zone-chip, .step-card, .feature-card, .role-card')
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })
    
    // Scroll reveal observer
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        }
      })
    }, { threshold: 0.12 })
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [])

  return (
    <div className="landing-body">
      <div className="cursor" id="cursor" ref={cursorRef}></div>
      <div className="noise-overlay"></div>

      {/* NAV */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link href="/" className="nav-logo">sh<span>o</span>p</Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#zones">Zones</a>
          <Link href="/auth/login" className="nav-cta">Get started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">Now live in Nairobi 🇰🇪</div>
            <h1 className="hero-title">
              Order<br />
              <span className="accent">anything.</span><br />
              <span className="line2">Delivered.</span>
            </h1>
            <p className="hero-sub">
              Food, groceries, medicine — from your favourite stores in Nairobi, straight to your door. Pay with M-Pesa. Track in real time.
            </p>
            <div className="hero-buttons">
              <Link href="/auth/login" className="btn-primary">Order now →</Link>
              <Link href="/auth/login" className="btn-secondary">Register your store</Link>
            </div>
          </div>

          <div className="phone-wrap">
            <div className="float-badge fb-1">
              <div className="fb-icon">✅</div>
              <div className="fb-text">
                <strong>Order confirmed</strong>
                <span>Java House · KES 1,430</span>
              </div>
            </div>
            <div className="float-badge fb-2">
              <div className="fb-icon">🏍</div>
              <div className="fb-text">
                <strong>James is 2min away</strong>
                <span>Your boda rider</span>
              </div>
            </div>
            <div className="float-badge fb-3">
              <div className="fb-icon">📱</div>
              <div className="fb-text">
                <strong>M-Pesa sent</strong>
                <span>KES 1,430 confirmed</span>
              </div>
            </div>

            <div className="phone-frame">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="p-topbar">
                  <div>
                    <div className="p-logo">sh<span>o</span>p</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>📍 Westlands, Nairobi</div>
                  </div>
                  <div className="p-avatar">PK</div>
                </div>
                <div className="p-search">
                  <div className="p-search-bar">⌕ &nbsp;Search food, stores, meds...</div>
                </div>
                <div className="p-promo">
                  <div>
                    <div className="p-promo-text">Free delivery today</div>
                    <div className="p-promo-sub">On your first 3 orders</div>
                  </div>
                  <div className="p-promo-btn">Order now</div>
                </div>
                <div className="p-cats">
                  <div className="p-cat">
                    <div className="p-cat-icon a">🍔</div>
                    <div className="p-cat-lbl" style={{ color: '#FF385C' }}>Food</div>
                  </div>
                  <div className="p-cat">
                    <div className="p-cat-icon">🛒</div>
                    <div className="p-cat-lbl">Shops</div>
                  </div>
                  <div className="p-cat">
                    <div className="p-cat-icon">💊</div>
                    <div className="p-cat-lbl">Pharmacy</div>
                  </div>
                  <div className="p-cat">
                    <div className="p-cat-icon">🥕</div>
                    <div className="p-cat-lbl">Grocery</div>
                  </div>
                </div>
                <div className="p-store">
                  <div className="p-store-banner">
                    <div className="p-store-badge">20–30 min · KES 80 delivery</div>
                  </div>
                  <div className="p-store-info">
                    <div className="p-store-name">Java House Westlands</div>
                    <div className="p-store-meta"><span>★ 4.8</span> · Restaurant · Burgers · Coffee</div>
                  </div>
                </div>
                <div style={{ height: '16px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="reveal">
            <div className="section-label">Built for Nairobi</div>
            <h2 className="section-title">Everything you need,<br />nothing you don't.</h2>
          </div>
          <div className="features-grid reveal">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <div className="feature-title">Real-time everything</div>
              <p className="feature-desc">Live order status, rider location on the map, instant chat. You're never left wondering where your order is.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💚</div>
              <div className="feature-title">M-Pesa native</div>
              <p className="feature-desc">STK push payments baked in from day one. No card forms, no third-party redirects — pay the Kenyan way.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏪</div>
              <div className="feature-title">Every store type</div>
              <p className="feature-desc">Restaurants, pharmacies, supermarkets, hardware shops — if it's in your zone, you can order it through Shop.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <div className="feature-title">Zone by zone</div>
              <p className="feature-desc">Coverage built zone by zone. CBD, Westlands, Roysambu, Kilimani and more — with new zones added monthly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ZONES */}
      <section className="section" id="zones" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          <div className="reveal">
            <div className="section-label">Coverage</div>
            <h2 className="section-title">Are we in<br />your zone?</h2>
            <p className="section-sub">We're live across 12 zones in Nairobi and growing. Select a zone below or tell us where you are.</p>
          </div>
          <div className="zones-wrap reveal">
            <div className="zones-map-label">Active zones in Nairobi</div>
            <div className="zones-chips">
              {['CBD', 'Westlands', 'Roysambu', 'Kilimani', 'Lavington', 'South B', 'South C', 'Parklands', 'Kasarani', 'Eastleigh', 'Ngong Rd'].map(zone => (
                <div key={zone} className="zone-chip active">{zone}</div>
              ))}
              <div className="zone-chip" style={{ opacity: 0.5 }}>Mutomo <span style={{ fontSize: '10px' }}>coming soon</span></div>
            </div>
            <div className="zones-coming">
              <span>Thika, Ruiru, Kiambu, Rongai, Syokimau</span> — coming soon. <a href="#" style={{ color: 'var(--red)', textDecoration: 'none' }}>Request your area →</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner reveal">
          <div className="section-label" style={{ justifyContent: 'center', display: 'flex' }}>Ready?</div>
          <h2 className="cta-title">Order your first<br />delivery today.</h2>
          <p className="cta-sub">Join thousands of Nairobians already on Shop. Takes 30 seconds to sign up with your M-Pesa number.</p>
          <div className="cta-buttons">
            <Link href="/auth/login" className="btn-primary" style={{ fontSize: '16px', padding: '18px 36px' }}>Start ordering →</Link>
            <Link href="/auth/login" className="btn-secondary" style={{ fontSize: '16px', padding: '18px 36px' }}>Register your store</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-logo">sh<span>o</span>p</div>
              <div className="footer-tagline">Nairobi's delivery platform. Food, groceries, medicine — delivered.</div>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>Platform</h4>
                <Link href="/auth/login">For customers</Link>
                <Link href="/auth/login">For vendors</Link>
                <Link href="/auth/login">For riders</Link>
                <a href="#">Pricing</a>
              </div>
              <div className="footer-col">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#zones">Zones</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
              </div>
              <div className="footer-col">
                <h4>Legal</h4>
                <a href="#">Terms</a>
                <a href="#">Privacy</a>
                <a href="#">Vendor terms</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2025 Shop. Built in Nairobi 🇰🇪</div>
            <div className="footer-mpesa">
              Payments powered by <span className="mpesa-pill">M-PESA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
