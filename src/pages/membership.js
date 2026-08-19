// ================================================
// NeoFair — Membership Privileges Page (Neon Membership)
// ================================================

export function renderMembership() {
  return /* html */`
    <!-- HERO -->
    <section class="membership-hero">
      <div class="container membership-hero-content">
        <span class="section-tag">Exclusive Benefits</span>
        <h1 class="section-title" style="font-size:clamp(2.5rem,5vw,4rem)">
          Neon Membership <span class="highlight">Privileges</span>
        </h1>
        <p class="section-subtitle" style="margin:0 auto;font-size:1.1rem;max-width:600px">
          Enjoy exclusive flat discounts on our premium Hair &amp; Skin Care services —
          curated just for Neon members.
        </p>
      </div>
    </section>

    <!-- DISCOUNT CARDS -->
    <section style="padding:var(--space-4xl) 0;background:var(--color-bg-2)">
      <div class="container">

        <div class="text-center" style="margin-bottom:var(--space-3xl)">
          <span class="section-tag">Member Discounts</span>
          <h2 class="section-title">
            Your <span class="highlight">Neon Savings</span>
          </h2>
          <p class="section-subtitle" style="margin:0 auto">
            Valid on all regular Hair &amp; Skin Care services at Neofair Salon &amp; Aesthetics.
          </p>
        </div>

        <div class="discount-cards-grid">

          <!-- WEEKDAY CARD -->
          <div class="discount-card weekday reveal">
            <div class="discount-card-glow"></div>
            <div class="discount-day-badge">Monday — Friday</div>
            <div class="discount-percent">15<span class="discount-symbol">%</span></div>
            <div class="discount-label">Flat Discount</div>
            <div class="discount-service-label">on regular Hair &amp; Skin Care services</div>
            <div class="discount-divider"></div>
            <div class="discount-days-row">
              <span class="day-chip active">Mon</span>
              <span class="day-chip active">Tue</span>
              <span class="day-chip active">Wed</span>
              <span class="day-chip active">Thu</span>
              <span class="day-chip active">Fri</span>
              <span class="day-chip">Sat</span>
              <span class="day-chip">Sun</span>
            </div>
            <a href="/join" class="btn btn-primary" data-link style="width:100%;justify-content:center;margin-top:var(--space-xl)">
              ✦ Join Neon Membership
            </a>
          </div>

          <!-- WEEKEND CARD -->
          <div class="discount-card weekend reveal reveal-delay-1">
            <div class="discount-card-glow weekend-glow"></div>
            <div class="discount-day-badge weekend-badge">Saturday — Sunday</div>
            <div class="discount-percent weekend-percent">10<span class="discount-symbol">%</span></div>
            <div class="discount-label">Flat Discount</div>
            <div class="discount-service-label">on regular Hair &amp; Skin Care services</div>
            <div class="discount-divider"></div>
            <div class="discount-days-row">
              <span class="day-chip">Mon</span>
              <span class="day-chip">Tue</span>
              <span class="day-chip">Wed</span>
              <span class="day-chip">Thu</span>
              <span class="day-chip">Fri</span>
              <span class="day-chip active weekend-day">Sat</span>
              <span class="day-chip active weekend-day">Sun</span>
            </div>
            <a href="/join" class="btn btn-outline" data-link style="width:100%;justify-content:center;margin-top:var(--space-xl)">
              ✦ Join Neon Membership
            </a>
          </div>

        </div>
      </div>
    </section>

    <!-- TERMS & CONDITIONS -->
    <section style="padding:var(--space-4xl) 0;background:var(--color-bg)">
      <div class="container">
        <div class="terms-grid">

          <!-- T&C -->
          <div class="terms-card reveal">
            <div class="terms-card-top">
              <span class="terms-icon">📋</span>
              <h2 class="terms-heading">Membership Terms &amp; Conditions</h2>
            </div>
            <ul class="terms-list">
              <li>
                <span class="terms-dot gold"></span>
                Valid for <strong>1 year</strong> from the date of issue.
              </li>
              <li>
                <span class="terms-dot gold"></span>
                Valid for the cardholder and their <strong>family members</strong>.
              </li>
              <li>
                <span class="terms-dot gold"></span>
                Membership is <strong>non-transferable</strong>.
              </li>
              <li>
                <span class="terms-dot gold"></span>
                <strong>Card or Registered Mobile Number</strong> must be presented before billing.
              </li>
              <li>
                <span class="terms-dot gold"></span>
                Cannot be combined with any other offers, packages, memberships, or promotions.
              </li>
              <li>
                <span class="terms-dot gold"></span>
                Membership benefits are applicable only on <strong>eligible services</strong>.
              </li>
              <li>
                <span class="terms-dot gold"></span>
                <strong>Advance booking</strong> is recommended.
              </li>
              <li>
                <span class="terms-dot gold"></span>
                Neofair Salon &amp; Aesthetics reserves the right to <strong>modify the terms and benefits</strong> without prior notice.
              </li>
            </ul>
          </div>

          <!-- NOT APPLICABLE -->
          <div class="terms-card not-applicable reveal reveal-delay-1">
            <div class="terms-card-top">
              <span class="terms-icon">🚫</span>
              <h2 class="terms-heading">Not Applicable On</h2>
            </div>
            <ul class="not-applicable-list">
              <li>
                <span class="na-icon">💍</span>
                <span>Bridal services</span>
              </li>
              <li>
                <span class="na-icon">💅</span>
                <span>Nail services</span>
              </li>
              <li>
                <span class="na-icon">🛍️</span>
                <span>Retail products</span>
              </li>
              <li>
                <span class="na-icon">✨</span>
                <span>Hair extensions</span>
              </li>
              <li>
                <span class="na-icon">💋</span>
                <span>PMU (Permanent Makeup)</span>
              </li>
              <li>
                <span class="na-icon">🎁</span>
                <span>Gift Cards</span>
              </li>
              <li>
                <span class="na-icon">📦</span>
                <span>Special Packages</span>
              </li>
            </ul>

            <div class="na-note">
              <span>ℹ️</span>
              Discount valid only on regular priced Hair &amp; Skin Care services as listed in the menu.
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- CTA BANNER -->
    <section style="padding:var(--space-4xl) 0;background:var(--color-bg-2)">
      <div class="container">
        <div class="cta-inner">
          <span class="section-tag">Exclusive Offer</span>
          <h2 class="section-title">Ready to Start <span class="highlight">Saving?</span></h2>
          <p class="section-subtitle" style="margin:0 auto;margin-bottom:var(--space-2xl)">
            Join Neon Membership today. Fill in your details 
            and start enjoying exclusive discounts on your very next visit.
          </p>
          <a href="/join" class="btn btn-primary" data-link style="font-size:1rem;padding:16px 40px">
            ✦ Join Neon Membership
          </a>
        </div>
      </div>
    </section>
  `;
}
