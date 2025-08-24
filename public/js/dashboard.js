document.addEventListener('DOMContentLoaded', async () => {
  const messageArea = document.getElementById('message-area');

  const accessToken = localStorage.getItem('accessToken');
  // In a real app, we'd also check the user's role from the JWT or localStorage.
  if (!accessToken) {
    window.location.href = '/login.html';
    return;
  }

  function showMessage(text, type) {
    messageArea.textContent = text;
    messageArea.className = type;
    messageArea.style.display = 'block';
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Fetch Metrics Data (Admin Route)
  try {
    const metricsResponse = await fetch('/api/metrics', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (metricsResponse.status === 403) {
        showMessage('Access Denied. You do not have permission to view this page.', 'error');
        return;
    }
    if (!metricsResponse.ok) {
        throw new Error('Failed to load dashboard metrics.');
    }

    const metrics = await metricsResponse.json();

    // Populate KPI cards
    document.getElementById('total-users').textContent = metrics.users.total;
    document.getElementById('total-content').textContent = metrics.content.total;
    document.getElementById('total-uploads').textContent = metrics.uploads.total;
    document.getElementById('storage-usage').textContent = `${formatBytes(metrics.uploads.storageUsage)} Used`;

    // Render Chart
    const ctx = document.getElementById('content-chart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Users', 'Content Items', 'Uploads'],
        datasets: [{
          label: 'Total Count',
          data: [metrics.users.total, metrics.content.total, metrics.uploads.total],
          backgroundColor: [
            'rgba(65, 137, 221, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(75, 192, 192, 0.7)',
          ],
          borderColor: [
            'rgba(65, 137, 221, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

  } catch (error) {
    showMessage(error.message, 'error');
  }

  // Fetch Summary Data (Public Route)
  try {
    const summaryResponse = await fetch('/api/summaries?lang=en');
    if (!summaryResponse.ok) {
      document.getElementById('summary-text').textContent = 'Could not load summary.';
    } else {
      const summary = await summaryResponse.json();
      document.getElementById('summary-text').textContent = summary.summaryText;
    }
  } catch (error) {
    document.getElementById('summary-text').textContent = 'Could not load summary.';
  }

});
