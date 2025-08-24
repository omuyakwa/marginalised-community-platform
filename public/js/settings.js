document.addEventListener('DOMContentLoaded', async () => {
  const settingsForm = document.getElementById('settings-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const localeSelect = document.getElementById('locale');
  const communitySegmentSelect = document.getElementById('community-segment');
  const messageArea = document.getElementById('message-area');

  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    window.location.href = '/login.html';
    return;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };

  function showMessage(text, type) {
    messageArea.textContent = text;
    messageArea.className = type;
    messageArea.style.display = 'block';
    setTimeout(() => { messageArea.style.display = 'none'; messageArea.textContent = ''; }, 3000);
  }

  // --- Fetch and populate user data ---
  try {
    const response = await fetch('/api/users/me', { headers: authHeaders });
    if (!response.ok) throw new Error('Could not load your profile.');
    const user = await response.json();

    nameInput.value = user.name;
    emailInput.value = user.email;
    localeSelect.value = user.locale;
    communitySegmentSelect.value = user.communitySegment || 'Not Specified';
  } catch (error) {
    showMessage(error.message, 'error');
  }

  // --- Handle form submission ---
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: nameInput.value,
      locale: localeSelect.value,
      communitySegment: communitySegmentSelect.value,
    };

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update profile.');

      showMessage(result.message, 'success');
      // Also update the language in i18n if it changed
      if (localStorage.getItem('golekaab-lang') !== data.locale) {
        // The i18n script would need a global function to call here, e.g., window.setLanguage(data.locale)
        localStorage.setItem('golekaab-lang', data.locale);
        location.reload(); // Simple way to apply language change
      }

    } catch (error) {
      showMessage(error.message, 'error');
    }
  });
});
