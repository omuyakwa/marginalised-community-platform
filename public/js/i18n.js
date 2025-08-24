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

  // --- High Contrast Mode ---
  const highContrastToggle = document.createElement('button');
  highContrastToggle.id = 'high-contrast-toggle';
  highContrastToggle.textContent = 'HC'; // Simple text for now
  highContrastToggle.style.marginLeft = '1rem';
  highContrastToggle.title = 'Toggle High Contrast';

  const applyHighContrast = (isHc) => {
    if (isHc) {
      document.body.classList.add('high-contrast');
      localStorage.setItem('golekaab-hc', 'true');
    } else {
      document.body.classList.remove('high-contrast');
      localStorage.setItem('golekaab-hc', 'false');
    }
  };

  highContrastToggle.addEventListener('click', () => {
    const isHighContrast = document.body.classList.contains('high-contrast');
    applyHighContrast(!isHighContrast);
  });

  // --- Font Size Controls ---
  const FONT_STEP = 1; // 1px
  const MIN_FONT_SIZE = 12;
  const MAX_FONT_SIZE = 24;

  const createFontSizeControls = () => {
    const decreaseBtn = document.createElement('button');
    decreaseBtn.textContent = 'A-';
    decreaseBtn.title = 'Decrease font size';
    decreaseBtn.addEventListener('click', () => changeFontSize(-FONT_STEP));

    const increaseBtn = document.createElement('button');
    increaseBtn.textContent = 'A+';
    increaseBtn.title = 'Increase font size';
    increaseBtn.addEventListener('click', () => changeFontSize(FONT_STEP));

    return [decreaseBtn, increaseBtn];
  };

  const changeFontSize = (step) => {
    const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    let newSize = currentSize + step;
    if (newSize < MIN_FONT_SIZE) newSize = MIN_FONT_SIZE;
    if (newSize > MAX_FONT_SIZE) newSize = MAX_FONT_SIZE;

    document.documentElement.style.fontSize = `${newSize}px`;
    localStorage.setItem('golekaab-fontsize', newSize);
  };

  const applySavedFontSize = () => {
    const savedSize = localStorage.getItem('golekaab-fontsize');
    if (savedSize) {
      document.documentElement.style.fontSize = `${savedSize}px`;
    }
  };

  // --- Accessibility Controls Container ---
  const createAccessibilityControls = () => {
    const nav = document.querySelector('header nav');
    if (nav) {
      const [decreaseBtn, increaseBtn] = createFontSizeControls();
      nav.appendChild(decreaseBtn);
      nav.appendChild(increaseBtn);

      // Language switcher
      const langSwitcher = document.createElement('select');
      langSwitcher.id = 'language-switcher';
      langSwitcher.innerHTML = `<option value="en">English</option><option value="so">Soomaali</option>`;
      langSwitcher.value = getLanguagePreference();
      langSwitcher.addEventListener('change', (e) => setLanguage(e.target.value));

      nav.appendChild(langSwitcher);
      nav.appendChild(highContrastToggle);
    }
  };

  // --- Initial Load ---
  applySavedFontSize();
  createAccessibilityControls();
  setLanguage(getLanguagePreference());

  const savedHc = localStorage.getItem('golekaab-hc') === 'true';
  applyHighContrast(savedHc);

});
