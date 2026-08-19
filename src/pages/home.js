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
            ✦ Join Neon Membership
          </a>
          <a href="/membership" class="btn btn-outline" data-link>
            Explore Privileges
          </a>
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
            <a href="/join" class="btn btn-primary" data-link>✦ Join Neon Membership</a>
            <a href="/membership" class="btn btn-ghost" data-link>See All Privileges</a>
          </div>
        </div>
      </div>
    </section>
  `;
}
