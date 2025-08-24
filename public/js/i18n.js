document.addEventListener('DOMContentLoaded', () => {
  let translations = {};

  const getLanguagePreference = () => {
    return localStorage.getItem('golekaab-lang') || navigator.language.split('-')[0] || 'en';
  };

  const translatePage = () => {
    document.querySelectorAll('[data-i18n-key]').forEach(element => {
      const key = element.getAttribute('data-i18n-key');
      const translation = translations[key];
      if (translation) {
        // Handle different element types, e.g., placeholders, titles
        if (element.placeholder) {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      }
    });
  };

  const fetchTranslations = async (lang) => {
    try {
      const response = await fetch(`/i18n/${lang}.json`);
      if (!response.ok) {
        console.error(`Could not load ${lang}.json. Falling back to English.`);
        const fallbackResponse = await fetch('/i18n/en.json');
        translations = await fallbackResponse.json();
      } else {
        translations = await response.json();
      }
      translatePage();
    } catch (error) {
      console.error('Translation fetch error:', error);
    }
  };

  const setLanguage = (lang) => {
    localStorage.setItem('golekaab-lang', lang);
    document.documentElement.lang = lang;
    fetchTranslations(lang);
  };

  // --- Create and inject the language switcher ---
  const createLanguageSwitcher = () => {
    const nav = document.querySelector('header nav');
    if (nav) {
      const switcher = document.createElement('select');
      switcher.id = 'language-switcher';
      switcher.innerHTML = `
        <option value="en">English</option>
        <option value="so">Soomaali</option>
      `;
      switcher.value = getLanguagePreference();

      switcher.addEventListener('change', (e) => {
        setLanguage(e.target.value);
      });

      nav.appendChild(switcher);
    }
  };

  createLanguageSwitcher();
  setLanguage(getLanguagePreference());
});
