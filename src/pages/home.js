// ================================================
// NeoFair — Home Page
// ================================================

export function renderHome() {
  return /* html */`
    <!-- HERO SECTION -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-orb hero-orb-1"></div>
        <div class="hero-orb hero-orb-2"></div>
        <div class="hero-orb hero-orb-3"></div>
        <div class="hero-grid"></div>
      </div>

      <div class="hero-content">
        <!-- 1. Logo in front / top -->
        <div class="hero-visual">
          <div class="hero-logo-showcase">
            <div class="hero-logo-ring"></div>
            <div class="hero-logo-ring"></div>
            <div class="hero-logo-ring"></div>
            <div class="hero-logo-center">
              <img src="/neofair-logo.png" alt="Neofair"
                onerror="this.style.display='none';this.nextElementSibling.style.display='block'" />
              <span class="hero-logo-fallback" style="display:none">NEOFAIR</span>
            </div>
          </div>
        </div>

        <!-- 2. Badge -->
        <div class="hero-text">
          <div class="hero-badge">
            <div class="hero-badge-dot"></div>
            <span>A Luxury Salon Experience</span>
          </div>
        </div>

        <!-- 3. Vertical Buttons below -->
        <div class="hero-actions">
          <a href="/join" class="btn btn-primary" data-link>
            ✦ Join Membership
          </a>
          <a href="tel:7448668744" class="btn btn-outline">
            📞 Call: +91 74486 68744
          </a>
        </div>

        <!-- 4. Membership Privileges Preview (below call button) -->
        <div class="hero-privileges">
          <div class="hero-privileges-label">✦ Neon Member Privileges</div>
          <div class="hero-priv-cards">
            <div class="hero-priv-card hero-priv-weekday">
              <div class="hero-priv-percent">15<span>%</span></div>
              <div class="hero-priv-days">Mon – Fri</div>
              <div class="hero-priv-desc">Flat Discount</div>
            </div>
            <div class="hero-priv-divider"></div>
            <div class="hero-priv-card hero-priv-weekend">
              <div class="hero-priv-percent hero-priv-percent-weekend">10<span>%</span></div>
              <div class="hero-priv-days">Sat – Sun</div>
              <div class="hero-priv-desc">Flat Discount</div>
            </div>
          </div>
          <p class="hero-priv-note">On regular Hair &amp; Skin Care services · Valid 1 year · Family eligible</p>
          <a href="/membership" class="hero-priv-link" data-link>See all privileges →</a>
        </div>
      </div>

      </div>
    </section>

    <!-- SERVICES SECTION -->
    <section class="services">
      <div class="container">
        <div class="services-header">
          <span class="section-tag">Our Services</span>
          <h2 class="section-title">Crafted for <span class="highlight">Perfection</span></h2>
          <p class="section-subtitle" style="margin:0 auto">
            From transformative hair artistry to rejuvenating skin care — every service 
            is a masterpiece tailored exclusively for you.
          </p>
        </div>

        <div class="services-grid">
          <div class="service-card reveal">
            <div class="service-icon">💇‍♀️</div>
            <h3 class="service-name">Hair Artistry</h3>
            <p class="service-desc">Precision cuts, vivid colors, and luxurious treatments by our master stylists using world-class products.</p>
          </div>
          <div class="service-card reveal reveal-delay-1">
            <div class="service-icon">💅</div>
            <h3 class="service-name">Nail Studio</h3>
            <p class="service-desc">From classic manicures to intricate nail art — every detail perfected with premium lacquers and care.</p>
          </div>
          <div class="service-card reveal reveal-delay-2">
            <div class="service-icon">✨</div>
            <h3 class="service-name">Skin Radiance</h3>
            <p class="service-desc">Advanced facials, glow treatments, and bespoke skin therapies that reveal your most luminous self.</p>
          </div>
          <div class="service-card reveal reveal-delay-3">
            <div class="service-icon">💄</div>
            <h3 class="service-name">Bridal Beauty</h3>
            <p class="service-desc">Make your most important day unforgettable with our exclusive bridal packages and trial sessions.</p>
          </div>
        </div>
      </div>
    </section>



    <!-- CTA BANNER -->
    <section class="cta-banner">
      <div class="container">
        <div class="cta-inner">
          <span class="section-tag">Exclusive Access</span>
          <h2 class="section-title">Become a <span class="highlight">Neon Member</span></h2>
          <p class="section-subtitle">
            Unlock exclusive privileges, priority appointments, and special discounts
            reserved only for our cherished Neon members.
          </p>
          <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem">
            <a href="/join" class="btn btn-primary" data-link>✦ Join Membership</a>
            <a href="/membership" class="btn btn-ghost" data-link>See All Privileges</a>
          </div>
        </div>
      </div>
    </section>

    <!-- LOCATION & MAP SECTION -->
    <section class="location-section" style="padding:4rem 1.5rem;background:var(--color-bg-2)">
      <div class="container">
        <div class="services-header">
          <span class="section-tag">Visit Our Salon</span>
          <h2 class="section-title">Location & <span class="highlight">Directions</span></h2>
          <p class="section-subtitle">
            Experience luxury beauty treatments at Neofair Salon & Aesthetics in Pallavaram, Chennai.
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:2rem;align-items:center;margin-top:2rem;">
          <!-- Address Card -->
          <div class="glass-panel" style="padding:2rem;">
            <h3 style="font-family:var(--font-display);color:var(--color-gold-light);margin-bottom:1rem;font-size:1.4rem;">
              📍 Neofair Salon & Aesthetics
            </h3>
            <p style="color:var(--color-text-muted);line-height:1.6;margin-bottom:1.25rem;">
              <strong>Address:</strong><br/>
              KFC Upstairs, Vaidhyalingam Complex,<br/>
              200 feet Radial Road, Thiyagi P.V,<br/>
              Pallavaram, Chennai, Tamil Nadu 600117
            </p>
            <p style="color:var(--color-text-muted);margin-bottom:1.5rem;">
              <strong>Appointments & Contact:</strong><br/>
              📞 <a href="tel:7448668744" style="color:var(--color-gold);font-weight:600;">+91 74486 68744</a>
            </p>
            <a href="https://www.google.com/maps/search/?api=1&query=Neofair+Salon+KFC+Upstairs+Vaidhyalingam+Complex+200+feet+Radial+Road+Pallavaram+Chennai+600117"
               target="_blank" rel="noopener" class="btn btn-primary" style="display:inline-flex;">
              🗺️ Open Directions on Google Maps
            </a>
          </div>

          <!-- Google Maps Embed -->
          <div class="glass-panel" style="overflow:hidden;border-radius:var(--radius-lg);height:360px;">
            <iframe
              title="Neofair Salon Location Map"
              src="https://maps.google.com/maps?q=Neofair+Salon+KFC+Upstairs+Vaidhyalingam+Complex+200+feet+Radial+Road+Pallavaram+Chennai+600117&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style="border:0;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
      </div>
    </section>
  `;
}
