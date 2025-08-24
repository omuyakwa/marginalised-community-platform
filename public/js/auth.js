document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const messageArea = document.getElementById('message-area');

  const API_BASE_URL = 'http://localhost:3000/api';

  /**
   * Displays a message to the user.
   * @param {string} text - The message text.
   * @param {('success'|'error')} type - The message type.
   */
  function showMessage(text, type) {
    messageArea.textContent = text;
    messageArea.className = type;
    messageArea.style.display = 'block';
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          showMessage('Registration successful! You can now log in.', 'success');
          setTimeout(() => window.location.href = '/login.html', 2000);
        } else {
          const errorMessage = result.details ? result.details[0].message : result.message;
          showMessage(`Error: ${errorMessage}`, 'error');
        }
      } catch (error) {
        showMessage('An unexpected error occurred. Please try again.', 'error');
        console.error('Registration fetch error:', error);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          showMessage('Login successful! Please check your email for a magic link to complete sign-in.', 'success');
          loginForm.reset();
        } else {
          showMessage(`Error: ${result.message}`, 'error');
        }
      } catch (error) {
        showMessage('An unexpected error occurred. Please try again.', 'error');
        console.error('Login fetch error:', error);
      }
    });
  }
});
