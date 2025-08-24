document.addEventListener('DOMContentLoaded', async () => {
  const contentGrid = document.getElementById('content-grid');

  const renderCards = (items) => {
    if (!items || items.length === 0) {
      contentGrid.innerHTML = '<p>No public content found.</p>';
      return;
    }

    contentGrid.innerHTML = items.map(item => `
      <div class="content-card">
        <a href="/content.html?id=${item._id}" class="card-link">
          <div class="card-body">
            <h3>${item.title}</h3>
            <p>${item.summary.substring(0, 150)}${item.summary.length > 150 ? '...' : ''}</p>
          </div>
          <div class="card-footer">
            <span>By ${item.authorId.name || 'Anonymous'}</span> |
            <span>${new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        </a>
      </div>
    `).join('');
  };

  try {
    contentGrid.innerHTML = '<p>Loading content...</p>';
    const response = await fetch('/api/content');
    if (!response.ok) {
      throw new Error('Failed to fetch content.');
    }
    const contentItems = await response.json();
    renderCards(contentItems);
  } catch (error) {
    contentGrid.innerHTML = `<p style="color: var(--accent-red);">${error.message}</p>`;
  }
});
