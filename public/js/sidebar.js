// Sidebar template - injected into pages
function injectSidebar() {
  const el = document.getElementById('sidebar');
  if (!el) return;
  el.innerHTML = `
    <div class="sidebar-logo">
      <div class="logo-icon">💎</div>
      <div class="logo-text">Neo<span>Bank</span></div>
    </div>
    <nav id="sidebar-nav"></nav>
    <div class="sidebar-bottom">
      <div class="user-chip">
        <div class="user-avatar" id="user-avatar">U</div>
        <div class="user-info">
          <div class="user-name" id="user-name"></div>
          <div class="user-email" id="user-email"></div>
        </div>
        <button class="btn-logout" onclick="logout()" title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}
