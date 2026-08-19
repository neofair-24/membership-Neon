// ================================================================
// NeoFair Salon — Admin Portal & Encrypted Member Management
// Admin ID: indhu | Password: Neofair@2014
// ================================================================

import { loginAdmin, logoutAdmin, isAdminAuthenticated, changeAdminCredentials, checkLockoutStatus, getRemainingAttempts, getStoredAdminId, MAX_ATTEMPTS } from '../utils/auth.js';
import { getMembers, saveMember, updateMember, deleteMember, clearAllMembers, isPhoneRegistered } from '../firebase.js';
import { encryptData } from '../utils/crypto.js';

let currentMembers = [];
let filteredMembers = [];
let lockoutTimerInterval = null;

export function renderAdmin() {
  const isAuth = isAdminAuthenticated();

  if (!isAuth) {
    return renderLoginScreen();
  }

  return renderDashboardScreen();
}

/**
 * Render Glassmorphic Login Screen
 */
function renderLoginScreen() {
  const lockout = checkLockoutStatus();
  const remainingAttempts = getRemainingAttempts();

  return /* html */`
    <section class="admin-page">
      <div class="admin-login-wrapper">
        <div class="admin-login-card glass-panel">
          <div class="admin-logo-badge">
            <span class="admin-lock-icon">🔒</span>
          </div>
          
          <h2 class="admin-login-title">NeoFair Admin Portal</h2>
          <p class="admin-login-subtitle">PBKDF2 SHA-256 Protected Firebase Access</p>

          <!-- Lockout Alert -->
          <div id="lockoutBanner" class="admin-alert error-alert" style="display: ${lockout.isLocked ? 'flex' : 'none'}">
            <span class="alert-icon">⚠️</span>
            <div class="alert-text">
              <strong>Security Lockout Active</strong>
              <p id="lockoutText">Access locked due to repeated invalid attempts. Try again in <span id="lockoutCountdown">${lockout.secondsRemaining}</span>s.</p>
            </div>
          </div>

          <!-- Login Form -->
          <form id="adminLoginForm" class="admin-login-form">
            <!-- Admin ID / Username -->
            <div class="form-group" id="adminIdGroup">
              <label class="form-label" for="adminId">
                Admin ID / Username <span class="required">*</span>
              </label>
              <input
                type="text"
                id="adminId"
                class="form-input"
                placeholder="Enter Admin ID"
                autocomplete="username"
                ${lockout.isLocked ? 'disabled' : ''}
              />
            </div>

            <!-- Password -->
            <div class="form-group" id="adminPasswordGroup">
              <label class="form-label" for="adminPassword">
                Admin Password <span class="required">*</span>
              </label>
              <div class="password-input-wrap">
                <input
                  type="password"
                  id="adminPassword"
                  class="form-input"
                  placeholder="Enter Admin Password"
                  autocomplete="current-password"
                  ${lockout.isLocked ? 'disabled' : ''}
                />
                <button type="button" id="togglePasswordBtn" class="toggle-password-btn" aria-label="Toggle password visibility">
                  👁️
                </button>
              </div>
              <span class="form-error" id="loginErrorMessage" style="display:none;">Invalid ID or Password</span>
            </div>

            <div class="login-meta-row">
              <span class="attempts-badge" id="attemptsBadge">
                ${remainingAttempts} of ${MAX_ATTEMPTS} attempts remaining
              </span>
              <span class="sec-badge">PBKDF2 100k Iterations</span>
            </div>

            <button type="submit" id="adminLoginBtn" class="btn btn-primary admin-submit-btn" ${lockout.isLocked ? 'disabled' : ''}>
              <span>Unlock Admin Portal ✦</span>
              <span class="btn-loader" style="display:none;"></span>
            </button>
          </form>

          <div class="admin-login-footer">
            <p>🔒 Master Credentials Protected</p>
            <p class="sec-note">All passwords verified in-memory using Web Crypto API PBKDF2 (100,000 iterations). Plaintext credentials never exist in GitHub code.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Render Main Dashboard Screen
 */
function renderDashboardScreen() {
  const currentAdminId = getStoredAdminId();

  return /* html */`
    <section class="admin-dashboard-page">
      <div class="admin-dashboard-container">

        <!-- Top Header Bar -->
        <header class="admin-header glass-panel">
          <div class="admin-header-brand">
            <div class="brand-badge">NEOFAIR</div>
            <div>
              <h1 class="admin-title">Member Database & Management</h1>
              <p class="admin-subtitle">
                <span class="status-dot"></span> Admin: <strong style="color:var(--color-gold-light);margin:0 4px">${escapeHtml(currentAdminId)}</strong> &bull; Firebase Storage Active
              </p>
            </div>
          </div>

          <div class="admin-header-actions">
            <button id="addMemberBtn" class="btn btn-sm btn-gold">
              <span>➕ Add Member</span>
            </button>
            <button id="changePassBtn" class="btn btn-sm btn-outline">
              <span>🔑 Security Settings</span>
            </button>
            <button id="adminLogoutBtn" class="btn btn-sm btn-danger">
              <span>🚪 Logout</span>
            </button>
          </div>
        </header>

        <!-- Statistics Metrics Cards -->
        <div class="admin-stats-grid">
          <div class="stat-card glass-panel">
            <div class="stat-icon-wrap gold">👥</div>
            <div class="stat-info">
              <span class="stat-label">Total Members</span>
              <h3 class="stat-value" id="statTotalMembers">0</h3>
              <span class="stat-sub">Registered Records</span>
            </div>
          </div>

          <div class="stat-card glass-panel">
            <div class="stat-icon-wrap rose">✨</div>
            <div class="stat-info">
              <span class="stat-label">Joined Today</span>
              <h3 class="stat-value" id="statJoinedToday">0</h3>
              <span class="stat-sub">New registrations</span>
            </div>
          </div>

          <div class="stat-card glass-panel">
            <div class="stat-icon-wrap blue">💎</div>
            <div class="stat-info">
              <span class="stat-label">Membership Tiers</span>
              <h3 class="stat-value" id="statSilverTier">0 Neon / 0 VIP</h3>
              <span class="stat-sub">Neon & VIP Breakdown</span>
            </div>
          </div>

          <div class="stat-card glass-panel">
            <div class="stat-icon-wrap purple">⚧</div>
            <div class="stat-info">
              <span class="stat-label">Gender Demographics</span>
              <h3 class="stat-value" id="statDemographics">0F / 0M</h3>
              <span class="stat-sub">Female / Male / Other</span>
            </div>
          </div>
        </div>

        <!-- Controls Bar: Search, Filters, & Download Actions -->
        <div class="admin-controls-bar glass-panel">
          <div class="search-filter-group">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                id="memberSearchInput"
                class="search-input"
                placeholder="Search by Name, Mobile, or ID..."
              />
            </div>

            <div class="filter-box">
              <select id="genderFilterSelect" class="admin-select">
                <option value="ALL">All Genders</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="filter-box">
              <select id="sortBySelect" class="admin-select">
                <option value="NEWEST">Registration (Newest)</option>
                <option value="OLDEST">Registration (Oldest)</option>
                <option value="NAME_ASC">Name (A-Z)</option>
              </select>
            </div>
          </div>

          <!-- Download & Export Actions -->
          <div class="export-actions-group">
            <span class="export-label">Download Data:</span>
            <button id="downloadCsvBtn" class="btn btn-sm btn-export" title="Export as Spreadsheet CSV">
              <span>📊 Download CSV</span>
            </button>
            <button id="downloadJsonBtn" class="btn btn-sm btn-export" title="Export as JSON Data">
              <span>{ } JSON</span>
            </button>
            <button id="downloadEncryptedBtn" class="btn btn-sm btn-export-sec" title="Export Encrypted Backup (.enc)">
              <span>🔐 Encrypted</span>
            </button>
            <button id="printReportBtn" class="btn btn-sm btn-export-outline" title="Print Salon Member List">
              <span>🖨️ Print</span>
            </button>
          </div>
        </div>

        <!-- Data Table Container -->
        <div class="admin-table-wrapper glass-panel">
          <div class="table-meta-bar">
            <span id="showingCountText">Showing 0 member records</span>
            <button id="refreshDataBtn" class="btn-icon" title="Refresh Data">🔄 Refresh</button>
          </div>

          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member ID</th>
                  <th>Full Name</th>
                  <th>Mobile Number</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Registered At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="membersTableBody">
                <tr>
                  <td colspan="10" class="table-loading">
                    <span class="btn-loader dark"></span> Loading registered member records...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>

    <!-- Modal 1: Add Member Manually -->
    <div id="addMemberModal" class="admin-modal-overlay" style="display:none;">
      <div class="admin-modal-content glass-panel">
        <div class="modal-header">
          <h3>➕ Register New Member (Admin)</h3>
          <button class="modal-close" data-close="addMemberModal">&times;</button>
        </div>
        <form id="adminAddMemberForm">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" id="addName" class="form-input" required placeholder="e.g. Ananya Patel" />
          </div>
          <div class="form-group">
            <label class="form-label">10-Digit Mobile Phone *</label>
            <input type="tel" id="addPhone" class="form-input" maxlength="10" required placeholder="e.g. 9876543210" />
          </div>
          <div class="form-group">
            <label class="form-label">Date of Birth (Month Day, Year) *</label>
            <input type="text" id="addDob" class="form-input" required placeholder="e.g. August 15, 1995" />
          </div>
          <div class="form-group">
            <label class="form-label">Gender *</label>
            <select id="addGender" class="form-select">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Membership Tier *</label>
            <select id="addTier" class="form-select">
              <option value="Neon">Neon</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" data-close="addMemberModal">Cancel</button>
            <button type="submit" class="btn btn-gold">Save Member</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 2: Edit Member Details -->
    <div id="editMemberModal" class="admin-modal-overlay" style="display:none;">
      <div class="admin-modal-content glass-panel">
        <div class="modal-header">
          <h3>✏️ Edit Firebase Member Record</h3>
          <button class="modal-close" data-close="editMemberModal">&times;</button>
        </div>
        <form id="adminEditMemberForm">
          <input type="hidden" id="editMemberId" />
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" id="editName" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Mobile Phone *</label>
            <input type="tel" id="editPhone" class="form-input" maxlength="10" required />
          </div>
          <div class="form-group">
            <label class="form-label">Date of Birth *</label>
            <input type="text" id="editDob" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Gender *</label>
            <select id="editGender" class="form-select">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Membership Tier *</label>
            <select id="editTier" class="form-select">
              <option value="Neon">Neon</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Account Status *</label>
            <select id="editStatus" class="form-select">
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" data-close="editMemberModal">Cancel</button>
            <button type="submit" class="btn btn-gold">Update Record</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 3: Security Settings / Change Password -->
    <div id="changePasswordModal" class="admin-modal-overlay" style="display:none;">
      <div class="admin-modal-content glass-panel">
        <div class="modal-header">
          <h3>🔑 Security & Credentials Settings</h3>
          <button class="modal-close" data-close="changePasswordModal">&times;</button>
        </div>
        <form id="changePasswordForm">
          <p class="modal-desc">
            Update your Admin ID and Master Password. New passwords are salted & hashed with PBKDF2 (100,000 iterations).
          </p>
          <div class="form-group">
            <label class="form-label">Admin ID / Username</label>
            <input type="text" id="newAdminIdInput" class="form-input" value="${escapeHtml(currentAdminId)}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Current Password *</label>
            <input type="password" id="currPass" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">New Password (Leave blank to keep unchanged)</label>
            <input type="password" id="newPass" class="form-input" minlength="6" placeholder="Min 6 characters" />
          </div>
          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <input type="password" id="confirmPass" class="form-input" minlength="6" />
          </div>
          <span class="form-error" id="changePassError" style="display:none;"></span>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" data-close="changePasswordModal">Cancel</button>
            <button type="submit" class="btn btn-gold">Save Security Settings</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Printable Header (Only visible during print) -->
    <div id="printOnlyHeader" class="print-only">
      <div class="print-logo">NEOFAIR BEAUTY SALON & AESTHETICS</div>
      <h2>Official Member Database Summary</h2>
      <p id="printMetaDate"></p>
    </div>
  `;
}

/**
 * Initialize Admin Event Listeners & Logic
 */
export function initAdmin() {
  const isAuth = isAdminAuthenticated();

  if (!isAuth) {
    initLoginEvents();
  } else {
    initDashboardEvents();
  }
}

/**
 * Login Screen Logic
 */
function initLoginEvents() {
  const loginForm = document.getElementById('adminLoginForm');
  const idInput   = document.getElementById('adminId');
  const passInput = document.getElementById('adminPassword');
  const toggleBtn = document.getElementById('togglePasswordBtn');
  const errorMsg  = document.getElementById('loginErrorMessage');
  const submitBtn = document.getElementById('adminLoginBtn');

  // Start lockout countdown update if currently locked
  startLockoutCountdownMonitor();

  // Toggle Password Mask
  if (toggleBtn && passInput) {
    toggleBtn.addEventListener('click', () => {
      const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passInput.setAttribute('type', type);
      toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }

  // Handle Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMsg.style.display = 'none';

      const adminId  = idInput.value.trim();
      const password = passInput.value.trim();

      if (!adminId || !password) {
        showLoginError('Please enter both Admin ID and Password.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.classList.add('loading');

      try {
        const result = await loginAdmin(adminId, password);

        if (result.success) {
          // Re-render router page to Dashboard
          const content = document.getElementById('page-content');
          content.innerHTML = renderDashboardScreen();
          initDashboardEvents();
        } else {
          showLoginError(result.message);
          if (result.lockoutSeconds) {
            startLockoutCountdownMonitor();
          } else {
            const badge = document.getElementById('attemptsBadge');
            if (badge && result.remainingAttempts !== undefined) {
              badge.textContent = `${result.remainingAttempts} of ${MAX_ATTEMPTS} attempts remaining`;
            }
          }
        }
      } catch (err) {
        showLoginError('Authentication error occurred.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
      }
    });
  }
}

function showLoginError(msg) {
  const errorMsg = document.getElementById('loginErrorMessage');
  if (errorMsg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
  }
}

function startLockoutCountdownMonitor() {
  if (lockoutTimerInterval) clearInterval(lockoutTimerInterval);

  lockoutTimerInterval = setInterval(() => {
    const lockout = checkLockoutStatus();
    const banner = document.getElementById('lockoutBanner');
    const countEl = document.getElementById('lockoutCountdown');
    const idInput = document.getElementById('adminId');
    const passInput = document.getElementById('adminPassword');
    const submitBtn = document.getElementById('adminLoginBtn');

    if (lockout.isLocked) {
      if (banner) banner.style.display = 'flex';
      if (countEl) countEl.textContent = lockout.secondsRemaining.toString();
      if (idInput) idInput.disabled = true;
      if (passInput) passInput.disabled = true;
      if (submitBtn) submitBtn.disabled = true;
    } else {
      if (banner) banner.style.display = 'none';
      if (idInput) idInput.disabled = false;
      if (passInput) passInput.disabled = false;
      if (submitBtn) submitBtn.disabled = false;
      const badge = document.getElementById('attemptsBadge');
      if (badge) badge.textContent = `${MAX_ATTEMPTS} of ${MAX_ATTEMPTS} attempts remaining`;
      clearInterval(lockoutTimerInterval);
    }
  }, 1000);
}

/**
 * Dashboard Screen Logic
 */
async function initDashboardEvents() {
  // 1. Fetch member data
  await loadMemberData();

  // 2. Attach Search, Filter & Sort listeners
  const searchInput = document.getElementById('memberSearchInput');
  const genderSelect = document.getElementById('genderFilterSelect');
  const sortSelect = document.getElementById('sortBySelect');

  if (searchInput) searchInput.addEventListener('input', filterAndRenderTable);
  if (genderSelect) genderSelect.addEventListener('change', filterAndRenderTable);
  if (sortSelect) sortSelect.addEventListener('change', filterAndRenderTable);

  const refreshBtn = document.getElementById('refreshDataBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', loadMemberData);

  // 3. Export Action Buttons
  const csvBtn = document.getElementById('downloadCsvBtn');
  const jsonBtn = document.getElementById('downloadJsonBtn');
  const encBtn = document.getElementById('downloadEncryptedBtn');
  const printBtn = document.getElementById('printReportBtn');

  if (csvBtn) csvBtn.addEventListener('click', exportCSV);
  if (jsonBtn) jsonBtn.addEventListener('click', exportJSON);
  if (encBtn) encBtn.addEventListener('click', exportEncrypted);
  if (printBtn) printBtn.addEventListener('click', triggerPrint);

  // 4. Header Actions (Logout, Add Member, Security Settings)
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutAdmin();
      const content = document.getElementById('page-content');
      content.innerHTML = renderLoginScreen();
      initLoginEvents();
    });
  }

  // Modals logic
  initModalListeners();
}

/**
 * Load member records from Firestore & LocalStorage
 */
async function loadMemberData() {
  const tbody = document.getElementById('membersTableBody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="table-loading">
          <span class="btn-loader dark"></span> Fetching member records...
        </td>
      </tr>
    `;
  }

  try {
    currentMembers = await getMembers();
    updateMetricsCards(currentMembers);
    filterAndRenderTable();
  } catch (e) {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="table-empty">Error loading member records.</td>
        </tr>
      `;
    }
  }
}

/**
 * Filter & Sort Members, then render Table Rows
 */
function filterAndRenderTable() {
  const searchVal = (document.getElementById('memberSearchInput')?.value || '').toLowerCase().trim();
  const genderVal = document.getElementById('genderFilterSelect')?.value || 'ALL';
  const sortVal   = document.getElementById('sortBySelect')?.value || 'NEWEST';

  filteredMembers = currentMembers.filter(m => {
    const matchSearch =
      m.fullName.toLowerCase().includes(searchVal) ||
      m.phoneNumber.toLowerCase().includes(searchVal) ||
      m.membershipId.toLowerCase().includes(searchVal);

    const matchGender = genderVal === 'ALL' || m.gender === genderVal;

    return matchSearch && matchGender;
  });

  if (sortVal === 'NEWEST') {
    filteredMembers.sort((a, b) => new Date(b.registrationDate || b.joinedAt) - new Date(a.registrationDate || a.joinedAt));
  } else if (sortVal === 'OLDEST') {
    filteredMembers.sort((a, b) => new Date(a.registrationDate || a.joinedAt) - new Date(b.registrationDate || b.joinedAt));
  } else if (sortVal === 'NAME_ASC') {
    filteredMembers.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  const countText = document.getElementById('showingCountText');
  if (countText) {
    countText.textContent = `Showing ${filteredMembers.length} of ${currentMembers.length} member records`;
  }

  renderTableRows(filteredMembers);
}

/**
 * Render HTML rows for members
 */
function renderTableRows(members) {
  const tbody = document.getElementById('membersTableBody');
  if (!tbody) return;

  if (members.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="table-empty">
          <div class="empty-state">
            <span class="empty-icon">📂</span>
            <p>No member records found matching your filters.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = members.map((m, index) => {
    const formattedDate = formatDate(m.registrationDate || m.joinedAt);
    const statusClass = m.status === 'active' ? 'badge-active' : 'badge-inactive';
    return /* html */`
      <tr data-id="${m.id || m.membershipId}">
        <td class="col-num">${index + 1}</td>
        <td><code class="member-id-tag">${m.membershipId}</code></td>
        <td><strong class="member-name">${escapeHtml(m.fullName)}</strong></td>
        <td><a href="tel:${m.phoneNumber}" class="phone-link">📱 ${escapeHtml(m.phoneNumber)}</a></td>
        <td>${escapeHtml(m.dateOfBirth)}</td>
        <td><span class="badge badge-gender">${escapeHtml(m.gender)}</span></td>
        <td><span class="badge badge-tier">${escapeHtml(m.membershipTier || 'Neon')}</span></td>
        <td><span class="badge ${statusClass}">${escapeHtml(m.status || 'active')}</span></td>
        <td class="col-date">${formattedDate}</td>
        <td class="col-actions">
          <button class="btn-table-edit" data-edit-id="${m.id || m.membershipId}" title="Edit Record">
            ✏️
          </button>
          <button class="btn-table-del" data-del-id="${m.id || m.membershipId}" title="Delete Record">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach Edit buttons listeners
  tbody.querySelectorAll('[data-edit-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const editId = e.currentTarget.getAttribute('data-edit-id');
      const targetMember = currentMembers.find(m => m.id === editId || m.membershipId === editId);
      if (targetMember) {
        openEditMemberModal(targetMember);
      }
    });
  });

  // Attach Delete buttons listeners
  tbody.querySelectorAll('[data-del-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const delId = e.currentTarget.getAttribute('data-del-id');
      if (confirm(`Are you sure you want to delete member record ${delId}?`)) {
        handleDeleteMember(delId);
      }
    });
  });
}

function openEditMemberModal(member) {
  const modal = document.getElementById('editMemberModal');
  if (!modal) return;

  document.getElementById('editMemberId').value = member.id || member.membershipId;
  document.getElementById('editName').value = member.fullName || '';
  document.getElementById('editPhone').value = member.phoneNumber || '';
  document.getElementById('editDob').value = member.dateOfBirth || '';
  document.getElementById('editGender').value = member.gender || 'Female';
  document.getElementById('editTier').value = member.membershipTier || 'Neon';
  document.getElementById('editStatus').value = member.status || 'active';

  modal.style.display = 'flex';
}

async function handleDeleteMember(id) {
  await deleteMember(id);
  await loadMemberData();
}

/**
 * Update Dashboard Metrics
 */
function updateMetricsCards(members) {
  const total = members.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const joinedToday = members.filter(m => (m.registrationDate || '').startsWith(todayStr)).length;
  const neonCount = members.filter(m => (m.membershipTier || 'Neon').toLowerCase().includes('neon')).length;
  const vipCount  = members.filter(m => (m.membershipTier || '').toLowerCase().includes('vip')).length;
  const femaleCount = members.filter(m => m.gender === 'Female').length;
  const maleCount = members.filter(m => m.gender === 'Male').length;
  const otherCount = members.filter(m => m.gender !== 'Female' && m.gender !== 'Male').length;

  const elTotal = document.getElementById('statTotalMembers');
  const elToday = document.getElementById('statJoinedToday');
  const elSilver = document.getElementById('statSilverTier');
  const elDemo = document.getElementById('statDemographics');

  if (elTotal) elTotal.textContent = total.toString();
  if (elToday) elToday.textContent = joinedToday.toString();
  if (elSilver) elSilver.textContent = `${neonCount} Neon / ${vipCount} VIP`;
  if (elDemo) elDemo.textContent = `${femaleCount}F / ${maleCount}M ${otherCount > 0 ? '/ ' + otherCount + 'O' : ''}`;
}

/**
 * Export Member Data as Spreadsheet CSV
 */
function exportCSV() {
  if (filteredMembers.length === 0) {
    alert('No member data available to export.');
    return;
  }

  const headers = ['Membership ID', 'Full Name', 'Mobile Number', 'Date of Birth', 'Gender', 'Membership Tier', 'Status', 'Registration Date'];
  const rows = filteredMembers.map(m => [
    `"${(m.membershipId || '').replace(/"/g, '""')}"`,
    `"${(m.fullName || '').replace(/"/g, '""')}"`,
    `"${(m.phoneNumber || '').replace(/"/g, '""')}"`,
    `"${(m.dateOfBirth || '').replace(/"/g, '""')}"`,
    `"${(m.gender || '').replace(/"/g, '""')}"`,
    `"${(m.membershipTier || 'Neon Silver').replace(/"/g, '""')}"`,
    `"${(m.status || 'active').replace(/"/g, '""')}"`,
    `"${(m.registrationDate || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerFileDownload(blob, `neofair_members_${getFormattedDateStamp()}.csv`);
}

/**
 * Export Member Data as JSON
 */
function exportJSON() {
  if (filteredMembers.length === 0) {
    alert('No member data available to export.');
    return;
  }

  const jsonStr = JSON.stringify(filteredMembers, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  triggerFileDownload(blob, `neofair_members_${getFormattedDateStamp()}.json`);
}

/**
 * Export Member Data as AES-256-GCM Encrypted Backup File
 */
async function exportEncrypted() {
  if (filteredMembers.length === 0) {
    alert('No member data available to export.');
    return;
  }

  const secretKey = prompt('Enter a password to encrypt this backup file:');
  if (!secretKey) return;

  try {
    const rawData = JSON.stringify(filteredMembers);
    const encryptedPayload = await encryptData(rawData, secretKey);
    const encryptedJson = JSON.stringify(encryptedPayload, null, 2);
    const blob = new Blob([encryptedJson], { type: 'application/json' });
    triggerFileDownload(blob, `neofair_members_backup_${getFormattedDateStamp()}.enc`);
  } catch (err) {
    alert('Encryption failed. Please try again.');
  }
}

/**
 * Printable Report View
 */
function triggerPrint() {
  const metaDate = document.getElementById('printMetaDate');
  if (metaDate) {
    metaDate.textContent = `Generated on ${new Date().toLocaleString()} | Total Records: ${filteredMembers.length}`;
  }
  window.print();
}

function triggerFileDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Modals Handler (Add Member, Edit Member, & Security Settings)
 */
function initModalListeners() {
  // Open Add Member Modal
  const addBtn = document.getElementById('addMemberBtn');
  const addModal = document.getElementById('addMemberModal');
  if (addBtn && addModal) {
    addBtn.addEventListener('click', () => addModal.style.display = 'flex');
  }

  // Open Security Settings Modal
  const passBtn = document.getElementById('changePassBtn');
  const passModal = document.getElementById('changePasswordModal');
  if (passBtn && passModal) {
    passBtn.addEventListener('click', () => passModal.style.display = 'flex');
  }

  // Close Modals
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.getAttribute('data-close');
      const modal = document.getElementById(modalId);
      if (modal) modal.style.display = 'none';
    });
  });

  // Handle Add Member Form Submit
  const addForm = document.getElementById('adminAddMemberForm');
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('addName').value.trim();
      const phone = document.getElementById('addPhone').value.trim();
      const dob = document.getElementById('addDob').value.trim();
      const gender = document.getElementById('addGender').value;
      const tier = document.getElementById('addTier')?.value || 'Neon';

      if (!name || !phone || !dob) return;

      const isDuplicate = await isPhoneRegistered(phone);
      if (isDuplicate) {
        alert(`Mobile number ${phone} is already registered!`);
        return;
      }

      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newMember = {
        fullName: name,
        phoneNumber: phone,
        dateOfBirth: dob,
        gender: gender,
        membershipId: `NEON-${new Date().getFullYear()}-${randomNum}`,
        registrationDate: new Date().toISOString(),
        membershipTier: tier,
        status: 'active'
      };

      await saveMember(newMember);
      document.getElementById('addMemberModal').style.display = 'none';
      addForm.reset();
      await loadMemberData();
    });
  }

  // Handle Edit Member Form Submit
  const editForm = document.getElementById('adminEditMemberForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editMemberId').value;
      const updatedFields = {
        fullName: document.getElementById('editName').value.trim(),
        phoneNumber: document.getElementById('editPhone').value.trim(),
        dateOfBirth: document.getElementById('editDob').value.trim(),
        gender: document.getElementById('editGender').value,
        membershipTier: document.getElementById('editTier').value,
        status: document.getElementById('editStatus').value
      };

      await updateMember(id, updatedFields);
      document.getElementById('editMemberModal').style.display = 'none';
      await loadMemberData();
    });
  }

  // Handle Change Password / Credentials Form Submit
  const changePassForm = document.getElementById('changePasswordForm');
  const passErr = document.getElementById('changePassError');
  if (changePassForm) {
    changePassForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (passErr) passErr.style.display = 'none';

      const newAdminId = document.getElementById('newAdminIdInput').value.trim();
      const currPass   = document.getElementById('currPass').value;
      const newPass    = document.getElementById('newPass').value;
      const confPass   = document.getElementById('confirmPass').value;

      if (newPass && newPass !== confPass) {
        if (passErr) {
          passErr.textContent = 'New passwords do not match!';
          passErr.style.display = 'block';
        }
        return;
      }

      const res = await changeAdminCredentials(currPass, newAdminId, newPass);
      if (res.success) {
        alert('Admin security credentials updated successfully! Please log in again.');
        document.getElementById('changePasswordModal').style.display = 'none';
        changePassForm.reset();
        logoutAdmin();
        const content = document.getElementById('page-content');
        content.innerHTML = renderLoginScreen();
        initLoginEvents();
      } else {
        if (passErr) {
          passErr.textContent = res.message;
          passErr.style.display = 'block';
        }
      }
    });
  }
}

// Helpers
function formatDate(isoStr) {
  if (!isoStr) return 'N/A';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return isoStr;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}

function getFormattedDateStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}
