/**
 * LangSwitch
 * Charge static/fr.json ou static/en.json
 * et applique les traductions via [data-i18n].
 *
 * Les clés utilisent la notation :
 * data-i18n="header_buttons.projects"
 * data-i18n="introduction.title"
 * etc.
 */

const LangSwitch = (() => {
  const STORAGE_KEY = 'site-lang';
  const DEFAULT_LANG = 'fr';
  const SUPPORTED = ['fr', 'en'];

  let translations = {};
  let currentLang = DEFAULT_LANG;
  let loading = false;

  async function loadLang(lang) {
    const response = await fetch(`./static/${lang}.json`, {
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(
        `Impossible de charger ./static/${lang}.json (HTTP ${response.status})`
      );
    }

    const data = await response.json();

    if (!data || typeof data !== 'object') {
      throw new Error(`Le fichier ${lang}.json n'est pas un objet JSON valide.`);
    }

    return data;
  }

  /**
   * Récupère une valeur dans un objet avec une clé du type :
   * "header_buttons.projects"
   */
  function getValue(object, path) {
    if (!path) return undefined;

    return path.split('.').reduce((value, key) => {
      if (
        value !== null &&
        typeof value === 'object' &&
        Object.prototype.hasOwnProperty.call(value, key)
      ) {
        return value[key];
      }

      return undefined;
    }, object);
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      const value = getValue(translations, key);

      if (typeof value === 'string' || typeof value === 'number') {
        element.textContent = String(value);
      } else if (value === undefined) {
        console.warn(
          `[LangSwitch] Traduction manquante : "${key}" (${currentLang})`
        );
      } else {
        console.warn(
          `[LangSwitch] La clé "${key}" ne contient pas une valeur textuelle.`
        );
      }
    });

    document.documentElement.lang = currentLang;

    // Met à jour éventuellement le titre de la page
    const pageTitle = getValue(translations, 'site.title');
    if (typeof pageTitle === 'string') {
      document.title = pageTitle;
    }
  }

  function updateToggleUI() {
    document
      .querySelectorAll('.lang-toggle button[data-lang]')
      .forEach((button) => {
        const isActive =
          button.getAttribute('data-lang') === currentLang;

        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
  }

  async function setLang(lang) {
    if (!SUPPORTED.includes(lang)) {
      console.error(`[LangSwitch] Langue non supportée : "${lang}"`);
      return;
    }

    // Évite deux chargements simultanés
    if (loading) return;

    // Rien à faire si la langue est déjà chargée
    if (lang === currentLang && Object.keys(translations).length > 0) {
      updateToggleUI();
      return;
    }

    loading = true;

    try {
      const newTranslations = await loadLang(lang);

      // On ne change la langue qu'après un chargement réussi
      translations = newTranslations;
      currentLang = lang;

      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (error) {
        console.warn(
          '[LangSwitch] Impossible d’utiliser localStorage.'
        );
      }

      applyTranslations();
      updateToggleUI();

    } catch (error) {
      console.error(
        '[LangSwitch] Échec du changement de langue :',
        error
      );

    } finally {
      loading = false;
    }
  }

  function getSavedLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (SUPPORTED.includes(saved)) {
        return saved;
      }
    } catch (error) {
      // localStorage indisponible
    }

    return null;
  }

  function guessInitialLang() {
    const savedLang = getSavedLang();

    if (savedLang) {
      return savedLang;
    }

    const browserLang = (
      navigator.language ||
      navigator.userLanguage ||
      ''
    )
      .slice(0, 2)
      .toLowerCase();

    if (SUPPORTED.includes(browserLang)) {
      return browserLang;
    }

    return DEFAULT_LANG;
  }

  function initLangToggle() {
    const buttons = document.querySelectorAll(
      '.lang-toggle button[data-lang]'
    );

    if (!buttons.length) {
      console.warn(
        '[LangSwitch] Aucun bouton de langue trouvé.'
      );
      return;
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const lang = button.getAttribute('data-lang');

        if (lang && lang !== currentLang) {
          setLang(lang);
        }
      });
    });

    // Charge la langue initiale
    setLang(guessInitialLang());
  }

  return {
    initLangToggle,
    setLang,

    get currentLang() {
      return currentLang;
    }
  };
})();