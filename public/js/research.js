document.addEventListener('DOMContentLoaded', () => {
  const researchForm = document.getElementById('research-form');
  const itemList = document.getElementById('item-list');
  const messageArea = document.getElementById('message-area');
  const itemTypeSelect = document.getElementById('item-type');
  const urlGroup = document.getElementById('url-group');

  const API_BASE_URL = '/api/research';
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
    setTimeout(() => messageArea.style.display = 'none', 3000);
  }

  // --- Render items ---
  const renderItems = (items) => {
    itemList.innerHTML = '';
    if (items.length === 0) {
      itemList.innerHTML = '<li>No items saved yet.</li>';
      return;
    }
    items.forEach(item => {
      const li = document.createElement('li');
      li.dataset.id = item._id;
      li.innerHTML = `
        <div>
          <span class="item-type">${item.type}</span>
          <span class="item-title">${item.title}</span>
          ${item.url ? `<br><a href="${item.url}" target="_blank">${item.url}</a>` : ''}
          ${item.excerpt ? `<p>${item.excerpt}</p>` : ''}
        </div>
        <button class="delete-btn">Delete</button>
      `;
      itemList.appendChild(li);
    });
  };

  // --- Fetch items ---
  const fetchItems = async () => {
    try {
      const response = await fetch(API_BASE_URL, { headers: authHeaders });
      if (!response.ok) throw new Error('Could not fetch research items.');
      const items = await response.json();
      renderItems(items);
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  // --- Create item ---
  researchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(researchForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to save item.');

      showMessage('Item saved successfully!', 'success');
      researchForm.reset();
      fetchItems(); // Refresh the list
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });

  // --- Delete item ---
  itemList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const li = e.target.closest('li');
      const itemId = li.dataset.id;
      if (confirm('Are you sure you want to delete this item?')) {
        try {
          const response = await fetch(`${API_BASE_URL}/${itemId}`, {
            method: 'DELETE',
            headers: authHeaders,
          });
          if (!response.ok) throw new Error('Failed to delete item.');

          li.remove();
          showMessage('Item deleted.', 'success');
        } catch (error) {
          showMessage(error.message, 'error');
        }
      }
    }
  });

  // --- Form logic for showing/hiding URL field ---
  itemTypeSelect.addEventListener('change', () => {
    urlGroup.style.display = itemTypeSelect.value === 'link' ? 'block' : 'none';
  });

  // Initial fetch
  fetchItems();
});
