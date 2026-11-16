(function () {
  const DEFAULT = 'it';
  const inFloors = window.location.pathname.includes('/floors/');
  const base = inFloors ? '../' : '';

  // Cache-buster: il webview di Obsidian Custom Frames (Electron) tiene in
  // cache HTTP le risposte fetch. Senza questo, le modifiche ai JSON delle
  // traduzioni non si vedono finché non si svuota la cache. Il timestamp al
  // caricamento forza il riscaricamento a ogni avvio della pagina.
  const bust = '?v=' + Date.now();

  function getLocale() {
    return localStorage.getItem('locale') || DEFAULT;
  }

  const loaded = {};

  function loadScript(path) {
    if (!loaded[path]) {
      loaded[path] = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = base + path + bust;
        s.onload = resolve;
        s.onerror = () => { delete loaded[path]; reject(new Error('Failed to load ' + path)); };
        document.head.appendChild(s);
      });
    }
    return loaded[path];
  }

  function applyUI(lang) {
    return loadScript('locales/' + lang + '.js')
      .then(() => window.I18N_UI[lang])
      .then(t => {
        document.querySelectorAll('[data-i18n]').forEach(el => {
          if (t[el.dataset.i18n] !== undefined)
            el.textContent = t[el.dataset.i18n];
        });
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
          if (t[el.dataset.i18nPh] !== undefined)
            el.placeholder = t[el.dataset.i18nPh];
        });
        document.querySelectorAll('.lang-btn').forEach(btn => {
          btn.classList.toggle('lang-active', btn.dataset.lang === lang);
        });
      });
  }

  function applyRooms(lang) {
    if (lang === 'en') {
      window.ROOMS_LOCALE = {};
      return Promise.resolve();
    }
    return loadScript('locales/rooms.' + lang + '.js')
      .then(() => { window.ROOMS_LOCALE = window.I18N_ROOMS[lang] || {}; })
      .catch(() => { window.ROOMS_LOCALE = {}; });
  }

  function rerenderOpenRoom() {
    const codeEl = document.getElementById('room-code');
    const room = codeEl && codeEl.innerText.trim();
    if (room && typeof window.show === 'function') window.show(room);
  }

  function applyLocale(lang) {
    document.documentElement.lang = lang;
    Promise.all([applyUI(lang), applyRooms(lang)])
      .then(rerenderOpenRoom)
      .catch(err => console.error(err));
  }

  window.i18nSet = function (lang) {
    localStorage.setItem('locale', lang);
    applyLocale(lang);
  };

  document.addEventListener('DOMContentLoaded', function () {
    applyLocale(getLocale());
  });
})();
