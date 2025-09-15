// auth-ui.js
(() => {
    // --- 注入必要樣式（不改你的 CSS 檔） ---
    const STYLE_ID = 'auth-ui-style';
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement('style');
      s.id = STYLE_ID;
      s.textContent = `
        .account{position:relative;display:none}
        .account-btn{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.85);font-size:16px;padding:8px 0}
        .account-btn:hover{color:#fff;transform:translateY(-2px)}
        .account-menu{position:absolute;top:110%;right:0;min-width:180px;background:rgba(0,0,0,.95);
          border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:8px;backdrop-filter:blur(10px);display:none;z-index:1500}
        .account-menu.open{display:block}
        .account-item{display:block;width:100%;text-align:left;padding:10px 12px;border-radius:8px;color:rgba(255,255,255,.85);
          text-decoration:none;background:none;border:none;cursor:pointer}
        .account-item:hover{background:rgba(255,255,255,.08);color:#fff}
      `;
      document.head.appendChild(s);
    }
  
    // --- 小工具：讀/寫登入狀態 ---
    const isAuthed   = () => !!localStorage.getItem('authUser');
    const setAuthed  = (u) => localStorage.setItem('authUser', u);
    const clearAuthed= () => localStorage.removeItem('authUser');
  
    // --- 建立/取得 Login 連結與 Account 下拉 ---
    function ensureNavBits() {
      const nav = document.getElementById('mainMenu');
      if (!nav) return {};
  
      // 找現有的 Login 連結（不強迫你加 id），若沒有就建立
      let loginLink = document.getElementById('loginNav') || nav.querySelector('a[href$="login.html"]');
      if (!loginLink) {
        loginLink = document.createElement('a');
        loginLink.href = 'login.html';
        loginLink.className = 'menu-item external';
        loginLink.id = 'loginNav';
        loginLink.textContent = 'Login';
        nav.appendChild(loginLink);
      }
  
      // 沒有 Account 容器就注入一個
      let accountNav = document.getElementById('accountNav');
      if (!accountNav) {
        accountNav = document.createElement('div');
        accountNav.className = 'account';
        accountNav.id = 'accountNav';
        accountNav.innerHTML = `
          <button class="menu-item account-btn" id="accountBtn" aria-haspopup="menu" aria-expanded="false">Account ▾</button>
          <div class="account-menu" id="accountMenu" role="menu" aria-labelledby="accountBtn" aria-hidden="true">
            <a href="#" role="menuitem" class="account-item">Dashboard</a>
            <a href="#" role="menuitem" class="account-item">Manage AI Coach</a>
            <a href="#" role="menuitem" class="account-item">History</a>
            <a href="#" role="menuitem" class="account-item">Setting</a>
            <button type="button" role="menuitem" class="account-item" id="logoutBtn">Logout</button>
          </div>
        `;
        nav.appendChild(accountNav);
      }
  
      // 點 Login 前記錄回跳頁（可選）
      loginLink.addEventListener('click', () => {
        sessionStorage.setItem('returnTo', location.pathname + location.search + location.hash);
      });
  
      return { loginLink, accountNav };
    }
  
    // --- 依登入狀態切換 header ---
    function syncHeader() {
      const { loginLink, accountNav } = ensureNavBits();
      if (!loginLink || !accountNav) return;
      const on = isAuthed();
      loginLink.style.display = on ? 'none' : '';
      accountNav.style.display = on ? 'inline-block' : 'none';
    }
  
    // --- 下拉選單互動（ARIA） ---
    function wireDropdown() {
      const accountBtn  = document.getElementById('accountBtn');
      const accountMenu = document.getElementById('accountMenu');
      const logoutBtn   = document.getElementById('logoutBtn');
      if (!accountBtn || !accountMenu) return;
  
      accountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = !accountMenu.classList.contains('open');
        accountMenu.classList.toggle('open', open);
        accountBtn.setAttribute('aria-expanded', String(open));
        accountMenu.setAttribute('aria-hidden', String(!open));
      });
  
      document.addEventListener('click', (e) => {
        if (accountMenu.classList.contains('open') && !document.getElementById('accountNav').contains(e.target)) {
          accountMenu.classList.remove('open');
          accountBtn.setAttribute('aria-expanded', 'false');
          accountMenu.setAttribute('aria-hidden', 'true');
        }
      });
  
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && accountMenu.classList.contains('open')) {
          accountMenu.classList.remove('open');
          accountBtn.setAttribute('aria-expanded', 'false');
          accountMenu.setAttribute('aria-hidden', 'true');
        }
      });
  
      logoutBtn?.addEventListener('click', () => {
        clearAuthed();
        syncHeader();
        // 登出導回登入頁
        window.location.href = 'login.html';
      });
    }
  
    // --- 啟動 ---
    window.addEventListener('DOMContentLoaded', () => {
      ensureNavBits();
      syncHeader();
      wireDropdown();
  
      // 提供全域 API 給 login.html 呼叫
      window.AUTH = {
        set: (u) => setAuthed(u),
        clear: () => clearAuthed(),
        isAuthed: () => isAuthed(),
        sync: () => syncHeader(),
        redirectAfterLogin: () => {
          const r = sessionStorage.getItem('returnTo');
          sessionStorage.removeItem('returnTo');
          return r || 'index.html';
        }
      };
    });
  })();
  