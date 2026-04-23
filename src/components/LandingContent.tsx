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
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#who">For who</a>
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
            <div className="hero-trust">
              <div className="trust-item">
                <span className="trust-num">10k+</span>
                <span className="trust-label">Happy customers</span>
              </div>
              <div className="trust-item">
                <span className="trust-num">200+</span>
                <span className="trust-label">Stores on platform</span>
              </div>
              <div className="trust-item">
                <span className="trust-num">24min</span>
                <span className="trust-label">Avg delivery time</span>
              </div>
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

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="section-inner">
          <div className="reveal">
            <div className="section-label">Simple as 1, 2, 3</div>
            <h2 className="section-title">Order in under<br />60 seconds.</h2>
            <p className="section-sub">Three taps and your order is on the way. No apps to install, no accounts to verify — just open, order, done.</p>
          </div>
          <div className="steps-grid reveal">
            <div className="step-card">
              <span className="step-num">01</span>
              <span className="step-icon">🔍</span>
              <div className="step-title">Browse & pick</div>
              <p className="step-desc">Search restaurants, pharmacies, shops and grocery stores near you. Filter by zone, category, or what's open right now.</p>
            </div>
            <div className="step-card">
              <span className="step-num">02</span>
              <span className="step-icon">📱</span>
              <div className="step-title">Pay with M-Pesa</div>
              <p className="step-desc">One tap STK push to your phone. Enter your PIN and payment is confirmed in seconds. No card details, no cash needed.</p>
            </div>
            <div className="step-card">
              <span className="step-num">03</span>
              <span className="step-icon">🏍</span>
              <div className="step-title">Track your rider</div>
              <p className="step-desc">Watch your boda rider in real time on the map. Chat directly or call them. Know the exact minute your order arrives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features" style={{ paddingTop: 0 }}>
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

      {/* MPESA SECTION */}
      <section className="mpesa-section" id="mpesa">
        <div className="mpesa-inner">
          <div className="reveal">
            <div className="section-label">Payments</div>
            <h2 className="section-title">Built on<br /><span style={{ color: 'var(--green)' }}>M-Pesa.</span></h2>
            <p className="section-sub" style={{ marginTop: '16px' }}>Safaricom Daraja API powers every payment. STK push goes to your phone the moment you confirm an order. No typing numbers, no redirects — just your PIN.</p>
            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--muted)' }}>
                <span style={{ color: 'var(--green)' }}>✓</span> STK Push — payment prompt on your phone
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--muted)' }}>
                <span style={{ color: 'var(--green)' }}>✓</span> Instant confirmation — order placed on payment
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--muted)' }}>
                <span style={{ color: 'var(--green)' }}>✓</span> Vendor payouts every Friday via M-Pesa
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--muted)' }}>
                <span style={{ color: 'var(--green)' }}>✓</span> Rider earnings paid direct to M-Pesa
              </div>
            </div>
          </div>
          <div className="mpesa-visual reveal">
            <div className="phone-prompt">
              <div className="pp-title">M-Pesa Payment Request</div>
              <div className="pp-amount">KES 1,430</div>
              <div className="pp-desc">Java House Westlands · Order #SHP-00482</div>
              <div className="pp-input">
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Enter M-Pesa PIN</span>
                <div className="pp-dots">
                  <div className="pp-dot"></div>
                  <div className="pp-dot"></div>
                  <div className="pp-dot"></div>
                  <div className="pp-dot"></div>
                </div>
              </div>
              <button className="pp-btn">Confirm payment</button>
            </div>
            <div className="mpesa-card">
              <div className="mpesa-logo">M-PESA</div>
              <div>
                <div className="mpesa-card-title">Payment confirmed</div>
                <div className="mpesa-card-sub">Ref: QK7X2M9P · Java House</div>
              </div>
              <div className="mpesa-amount">✓</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOR WHO */}
      <section className="section" id="who">
        <div className="section-inner">
          <div className="reveal">
            <div className="section-label">Who it's for</div>
            <h2 className="section-title">Everyone wins<br />on Shop.</h2>
          </div>
          <div className="roles-grid reveal">
            <div className="role-card">
              <span className="role-emoji">🛍</span>
              <div className="role-title">Customers</div>
              <p className="role-desc">Order from any store in your zone. Pay with M-Pesa. Track your rider live. Rate and reorder with one tap.</p>
              <ul className="role-perks">
                <li>Real-time order tracking</li>
                <li>Chat with rider + vendor</li>
                <li>Saved addresses & M-Pesa</li>
                <li>Full order history</li>
              </ul>
              <div className="role-glow"></div>
            </div>
            <div className="role-card">
              <span className="role-emoji">🏪</span>
              <div className="role-title">Vendors</div>
              <p className="role-desc">Register your restaurant, pharmacy or shop. Manage orders from a dashboard. Get paid every Friday.</p>
              <ul className="role-perks">
                <li>Order dashboard live</li>
                <li>Menu item toggles</li>
                <li>Earnings analytics</li>
                <li>Weekly M-Pesa payouts</li>
              </ul>
              <div className="role-glow"></div>
            </div>
            <div className="role-card">
              <span className="role-emoji">🏍</span>
              <div className="role-title">Boda Riders</div>
              <p className="role-desc">Accept deliveries near you. Earn on your own schedule. Paid direct to M-Pesa per delivery.</p>
              <ul className="role-perks">
                <li>Choose your zone</li>
                <li>Accept or decline requests</li>
                <li>Earnings per km</li>
                <li>Same-day M-Pesa pay</li>
              </ul>
              <div className="role-glow"></div>
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
