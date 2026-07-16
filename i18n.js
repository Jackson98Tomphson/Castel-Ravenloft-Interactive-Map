(function () {
  const DEFAULT = 'it';
  const inFloors = window.location.pathname.includes('/floors/');
  const base = inFloors ? '../' : '';

  // Cache-buster: il webview di Obsidian Custom Frames (Electron) tiene in
  // cache HTTP le risposte fetch. Senza questo, le modifiche ai JSON delle
  // traduzioni non si vedono finché non si svuota la cache. Il timestamp al
  // caricamento forza il riscaricamento a ogni avvio della pagina.
  const bust = '?v=' + Date.now();

  // Embedded UI strings — used as a fallback when the page is opened directly
  // from disk (file://), where browsers block fetch() of local JSON files.
  // When the site is served over http(s) or run in Obsidian, the JSON files in
  // locales/ are fetched instead and remain the source of truth.
  const UI_FALLBACK = {
    en: {
      "h1_title": "Castle Ravenloft",
      "subtitle_interface": "Interactive Dungeon Master Map Interface",
      "subtitle_chapter": "Curse of Strahd – Chapter 4",
      "nav_enter_castle": "Enter Castle Ravenloft",
      "footer_dm_only": "Built for Dungeon Master use only.",
      "nav_enter": "Enter Castle",
      "nav_up": "Go Upstairs",
      "nav_down": "Go Downstairs",
      "nav_exit": "Exit Castle",
      "search_placeholder": "Search...",
      "click_hint": "Click a number."
    },
    it: {
      "h1_title": "Castel Ravenloft",
      "subtitle_interface": "Interfaccia Interattiva per il Dungeon Master",
      "subtitle_chapter": "La Maledizione di Strahd – Capitolo 4",
      "nav_enter_castle": "Entra in Castel Ravenloft",
      "footer_dm_only": "Solo per uso del Dungeon Master.",
      "nav_enter": "Entra nel Castello",
      "nav_up": "Sali",
      "nav_down": "Scendi",
      "nav_exit": "Esci dal Castello",
      "search_placeholder": "Cerca...",
      "click_hint": "Clicca un numero."
    }
  };

  function getLocale() {
    return localStorage.getItem('locale') || DEFAULT;
  }

  function applyUI(lang) {
    function render(t) {
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
    }

    fetch(base + 'locales/' + lang + '.json' + bust)
      .then(r => r.json())
      .then(render)
      .catch(() => {
        // fetch is blocked when opened from disk (file://); use embedded copy
        render(UI_FALLBACK[lang] || UI_FALLBACK[DEFAULT]);
      });
  }

  function applyRooms(lang) {
    if (lang === 'en') {
      window.ROOMS_LOCALE = {};
      return;
    }
    fetch(base + 'locales/rooms.' + lang + '.json' + bust)
      .then(r => r.json())
      .then(data => { window.ROOMS_LOCALE = data; })
      .catch(() => { window.ROOMS_LOCALE = {}; });
  }

  window.i18nSet = function (lang) {
    localStorage.setItem('locale', lang);
    applyUI(lang);
    applyRooms(lang);
  };

  document.addEventListener('DOMContentLoaded', function () {
    const lang = getLocale();
    applyUI(lang);
    applyRooms(lang);
  });
})();
