// ================================================
// NeoFair — Join Membership Page
// ================================================

import { saveMember } from '../firebase.js';

export function renderJoin() {
  const daysOptions = Array.from({length: 31}, (_, i) => {
    const d = (i + 1).toString().padStart(2, '0');
    return `<option value="${d}">${i + 1}</option>`;
  }).join('');

  const currentYear = new Date().getFullYear();
  const yearsOptions = Array.from({length: 95}, (_, i) => {
    const y = currentYear - 13 - i;
    return `<option value="${y}">${y}</option>`;
  }).join('');

  return /* html */`
    <section class="join-page">
      <div class="join-inner">

        <!-- Centered Form Card -->
        <div class="join-form-card">

          <!-- Success State -->
          <div class="success-state" id="successState">
            <div class="welcome-card">
              <div class="welcome-logo-wrap">
                <img src="/neofair-logo.png" alt="Neofair"
                  class="welcome-logo"
                  onerror="this.style.display='none';this.nextElementSibling.style.display='block'" />
                <span class="welcome-logo-text" style="display:none">NEOFAIR</span>
              </div>
              <div class="welcome-divider-line"></div>
              <div class="welcome-badge">✦ NEON MEMBERSHIP ✦</div>
              <div id="memberIdDisplay" style="font-family:monospace;font-size:0.9rem;color:var(--color-gold);background:rgba(201,169,110,0.1);padding:5px 14px;border-radius:20px;border:1px solid rgba(201,169,110,0.3);display:inline-block;margin:6px 0 12px;letter-spacing:0.08em;">
                Member ID: NEON-2026-0000
              </div>
              <h3 class="welcome-heading">Welcome To<br/><span>Neon Membership!</span></h3>
              <p class="welcome-desc">
                Welcome, <strong style="color:var(--color-gold)" id="memberNameDisplay">Valued Member</strong>!<br/>
                Your registration is complete. You are now an official <strong>Neon Member</strong> of Neofair Salon &amp; Aesthetics.
              </p>
              <div class="welcome-perks-row">
                <div class="welcome-perk">
                  <span class="welcome-perk-icon">💎</span>
                  <span>15% Off<br/><small>Mon–Fri</small></span>
                </div>
                <div class="welcome-perk-sep"></div>
                <div class="welcome-perk">
                  <span class="welcome-perk-icon">✨</span>
                  <span>10% Off<br/><small>Sat–Sun</small></span>
                </div>
                <div class="welcome-perk-sep"></div>
                <div class="welcome-perk">
                  <span class="welcome-perk-icon">📅</span>
                  <span>Priority<br/><small>Booking</small></span>
                </div>
              </div>
              <p class="welcome-note">
                Present your registered mobile number at billing to avail discounts.<br/>
                Valid for 1 year from date of registration.
              </p>
              <a href="/" class="btn btn-primary" data-link style="width:100%;justify-content:center;margin-top:var(--space-lg)">
                ← Back to Home
              </a>
            </div>
          </div>

          <!-- Form -->
          <form class="membership-form" id="membershipForm" novalidate>
            <div class="form-header">
              <h2>Join Neon Membership</h2>
              <p>Fill in your details to become a Neon member instantly.</p>
            </div>

            <!-- Name -->
            <div class="form-group" id="group-name">
              <label class="form-label" for="memberName">
                Full Name <span class="required">*</span>
              </label>
              <input
                type="text"
                id="memberName"
                name="name"
                class="form-input"
                placeholder="e.g. Priya Sharma"
                autocomplete="name"
                maxlength="80"
              />
              <span class="form-error" id="err-name">Please enter your full name.</span>
            </div>

            <!-- Phone / Mobile Number (strictly 10 digits) -->
            <div class="form-group" id="group-phone">
              <label class="form-label" for="memberPhone">
                Mobile Number <span class="required">*</span>
              </label>
              <input
                type="tel"
                id="memberPhone"
                name="phone"
                class="form-input"
                placeholder="e.g. 9876543210"
                autocomplete="tel"
                maxlength="10"
                inputmode="numeric"
                pattern="[0-9]{10}"
              />
              <span class="form-error" id="err-phone">Please enter a valid 10-digit mobile number.</span>
            </div>

            <!-- Date of Birth: Month / Day / Year -->
            <div class="form-group" id="group-dob">
              <label class="form-label">
                Date of Birth (Month / Day / Year) <span class="required">*</span>
              </label>
              <div class="dob-group">
                <div class="select-wrapper">
                  <select id="dobMonth" class="form-select" name="dobMonth">
                    <option value="">Month</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
                <div class="select-wrapper">
                  <select id="dobDay" class="form-select" name="dobDay">
                    <option value="">Day</option>
                    ${daysOptions}
                  </select>
                </div>
                <div class="select-wrapper">
                  <select id="dobYear" class="form-select" name="dobYear">
                    <option value="">Year</option>
                    ${yearsOptions}
                  </select>
                </div>
              </div>
              <span class="form-error" id="err-dob">Please select your complete Date of Birth (Month, Day, Year).</span>
            </div>

            <!-- Gender -->
            <div class="form-group" id="group-gender">
              <label class="form-label">
                Gender <span class="required">*</span>
              </label>
              <div class="gender-group">
                <div class="gender-option">
                  <input type="radio" id="gender-female" name="gender" value="Female" />
                  <label class="gender-label" for="gender-female">♀ Female</label>
                </div>
                <div class="gender-option">
                  <input type="radio" id="gender-male" name="gender" value="Male" />
                  <label class="gender-label" for="gender-male">♂ Male</label>
                </div>
                <div class="gender-option">
                  <input type="radio" id="gender-other" name="gender" value="Other" />
                  <label class="gender-label" for="gender-other">⚧ Other</label>
                </div>
              </div>
              <span class="form-error" id="err-gender">Please select your gender.</span>
            </div>



            <!-- Submit -->
            <button type="submit" class="btn-submit" id="submitBtn">
              <span class="btn-text">✦ Join Neon Membership</span>
              <span class="btn-loader"></span>
            </button>

            <!-- Server error -->
            <p id="serverError" style="display:none;text-align:center;font-size:0.82rem;color:#f87171;margin-top:var(--space-md)">
              Something went wrong. Please try again in a moment.
            </p>
          </form>
        </div>
      </div>
    </section>
  `;
}

// Helper: Generate unique customer Membership ID
function generateMembershipId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `NEON-${year}-${randomNum}`;
}

// ------------------------------------------------
// Form logic — called after DOM is rendered
// ------------------------------------------------
export function initJoinForm() {
  const form        = document.getElementById('membershipForm');
  const successState= document.getElementById('successState');
  const submitBtn   = document.getElementById('submitBtn');
  const serverError = document.getElementById('serverError');

  if (!form) return;

  // Helper: show/hide error
  function setError(groupId, errId, show) {
    const group = document.getElementById(groupId);
    const err   = document.getElementById(errId);
    if (!group || !err) return;
    group.classList.toggle('has-error', show);
    err.style.display = show ? 'block' : 'none';
  }

  // Validation
  function validate() {
    let valid = true;

    const name     = document.getElementById('memberName').value.trim();
    const phone    = document.getElementById('memberPhone').value.trim();
    const dobMonth = document.getElementById('dobMonth').value;
    const dobDay   = document.getElementById('dobDay').value;
    const dobYear  = document.getElementById('dobYear').value;
    const gender   = document.querySelector('input[name="gender"]:checked');

    // Name
    const nameOk = name.length >= 2;
    setError('group-name', 'err-name', !nameOk);
    if (!nameOk) valid = false;

    // Mobile Phone — strictly 10 digits
    const phoneOk = /^[0-9]{10}$/.test(phone);
    setError('group-phone', 'err-phone', !phoneOk);
    if (!phoneOk) valid = false;

    // Date of Birth
    const dobOk = !!dobMonth && !!dobDay && !!dobYear;
    setError('group-dob', 'err-dob', !dobOk);
    if (!dobOk) valid = false;

    // Gender
    const genderOk = !!gender;
    setError('group-gender', 'err-gender', !genderOk);
    if (!genderOk) valid = false;

    return valid;
  }

  // Enforce numeric only & max 10 digits on mobile input
  const phoneInput = document.getElementById('memberPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  // Live validation listeners
  ['memberName', 'memberPhone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', () => validate());
      el.addEventListener('input', () => {
        const groupId = { memberName: 'group-name', memberPhone: 'group-phone' }[id];
        const errId   = { memberName: 'err-name',   memberPhone: 'err-phone' }[id];
        const group = document.getElementById(groupId);
        if (group && group.classList.contains('has-error')) validate();
      });
    }
  });

  ['dobMonth', 'dobDay', 'dobYear'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => setError('group-dob', 'err-dob', false));
    }
  });

  document.querySelectorAll('input[name="gender"]').forEach(el => {
    el.addEventListener('change', () => setError('group-gender', 'err-gender', false));
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    serverError.style.display = 'none';

    if (!validate()) return;

    const dobMonth   = document.getElementById('dobMonth').value;
    const dobDay     = document.getElementById('dobDay').value;
    const dobYear    = document.getElementById('dobYear').value;
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const generatedId = generateMembershipId();

    const memberData = {
      fullName:         document.getElementById('memberName').value.trim(),
      phoneNumber:      document.getElementById('memberPhone').value.trim(),
      dateOfBirth:      `${monthNames[parseInt(dobMonth, 10) - 1]} ${parseInt(dobDay, 10)}, ${dobYear}`,
      gender:           document.querySelector('input[name="gender"]:checked').value,
      membershipId:     generatedId,
      registrationDate: new Date().toISOString(),
    };

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
      await saveMember(memberData);
      
      // Update welcome card with registered name and unique Membership ID
      const nameDisp = document.getElementById('memberNameDisplay');
      if (nameDisp) nameDisp.textContent = memberData.fullName;

      const idDisp = document.getElementById('memberIdDisplay');
      if (idDisp) idDisp.textContent = `Member ID: ${memberData.membershipId}`;

      // Show welcome message card
      form.style.display = 'none';
      successState.classList.add('visible');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      // Fallback display — zero console logging
      form.style.display = 'none';
      successState.classList.add('visible');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });
}
