// API base
const API = '';

// Auth helpers
const auth = {
  token: () => localStorage.getItem('neo_token'),
  user: () => JSON.parse(localStorage.getItem('neo_user') || 'null'),
  save: (token, user) => {
    localStorage.setItem('neo_token', token);
    localStorage.setItem('neo_user', JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('neo_token');
    localStorage.removeItem('neo_user');
  },
  isLoggedIn: () => !!localStorage.getItem('neo_token'),
  requireAuth: () => {
    if (!auth.isLoggedIn()) {
      window.location.href = '/';
      return false;
    }
    return true;
  },
  requireGuest: () => {
    if (auth.isLoggedIn()) {
      window.location.href = '/dashboard';
      return false;
    }
    return true;
  }
};

// API call helper
async function api(method, path, body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token()}`
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Alert helper
function showAlert(el, msg, type = 'error') {
  if (!el) return;
  el.textContent = msg;
  el.className = `alert show alert-${type}`;
  setTimeout(() => el.className = 'alert', 4000);
}

// Format currency - Naira default
function formatMoney(n) {
  return '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format date
function formatDate(d) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Countdown timer
function getCountdown(nextPayout) {
  const ms = new Date(nextPayout) - Date.now();
  if (ms <= 0) return 'Paying out...';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// Build sidebar nav
function buildSidebar(activePage) {
  const user = auth.user();
  const nav = [
    { href: '/dashboard', icon: '⬛', label: 'Dashboard' },
    { href: '/business', icon: '🏢', label: 'Businesses' },
    { href: '/shop', icon: '🛍️', label: 'Shop' },
    { href: '/cards', icon: '💳', label: 'Cards' },
    { href: '/transfer', icon: '↗️', label: 'Transfer' },
    { href: '/history', icon: '📋', label: 'History' },
    { href: '/profile', icon: '👤', label: 'Profile' }
  ];

  const navEl = document.getElementById('sidebar-nav');
  if (navEl) {
    navEl.innerHTML = nav.map(n => `
      <a href="${n.href}" class="nav-link ${n.href === activePage ? 'active' : ''}">
        <span style="font-size:16px">${n.icon}</span>
        <span>${n.label}</span>
      </a>
    `).join('');
  }

  if (user) {
    const avatar = document.getElementById('user-avatar');
    const name = document.getElementById('user-name');
    const email = document.getElementById('user-email');
    if (avatar) avatar.textContent = user.fullName?.[0]?.toUpperCase() || 'U';
    if (name) name.textContent = user.fullName || '';
    if (email) email.textContent = user.email || '';
  }
}

// Logout
function logout() {
  auth.clear();
  window.location.href = '/';
}

// Usage tracking ping every minute
let _pingInterval = null;
function startUsagePing() {
  if (_pingInterval) return;
  _pingInterval = setInterval(() => {
    api('POST', '/api/user/ping', { minutes: 1 }).catch(() => {});
  }, 60000);
}

// Format usage time
function formatUsage(minutes) {
  const virtualDays = Math.floor(minutes / 60);
  const virtualWeeks = Math.floor(virtualDays / 7);
  const virtualMonths = Math.floor(virtualDays / 30);
  const virtualYears = Math.floor(virtualDays / 365);
  return { realMinutes: minutes, virtualDays, virtualWeeks, virtualMonths, virtualYears };
}
