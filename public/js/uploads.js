document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('upload-form');
  const messageArea = document.getElementById('message-area');
  const submitBtn = document.getElementById('submit-btn');

  const API_BASE_URL = 'http://localhost:3000/api';

  // For this page, we assume the user is logged in.
  // A real app would have a global auth state manager.
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    window.location.href = '/login.html';
    return;
  }

  /**
   * Displays a message to the user.
   */
  function showMessage(text, type) {
    messageArea.textContent = text;
    messageArea.className = type;
    messageArea.style.display = 'block';
  }

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';
    showMessage('Step 1: Uploading file...', 'success');

    const formData = new FormData(uploadForm);
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];

    // --- Step 1: Upload the file ---
    const fileUploadData = new FormData();
    fileUploadData.append('file', file);

    let uploadedFile;
    try {
      const uploadResponse = await fetch(`${API_BASE_URL}/uploads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: fileUploadData, // Browser will set Content-Type to multipart/form-data
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.message || 'File upload failed');
      }

      uploadedFile = uploadResult.file;
      showMessage('Step 2: Creating content record...', 'success');

    } catch (error) {
      showMessage(`Error during file upload: ${error.message}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Upload Content';
      return;
    }

    // --- Step 2: Create the content document ---
    try {
      const contentData = {
        title: formData.get('title'),
        summary: formData.get('summary'),
        tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean),
        language: formData.get('language'),
        attachment: {
          id: uploadedFile.id,
          name: uploadedFile.name,
          mimetype: uploadedFile.mimetype,
          size: uploadedFile.size,
        },
      };

      const contentResponse = await fetch(`${API_BASE_URL}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(contentData),
      });

      const contentResult = await contentResponse.json();

      if (!contentResponse.ok) {
        throw new Error(contentResult.message || 'Content creation failed');
      }

      showMessage('Upload successful! Content has been created.', 'success');
      uploadForm.reset();

    } catch (error) {
      showMessage(`Error during content creation: ${error.message}`, 'error');
      // Here, we should ideally delete the orphaned file from GridFS.
      // This requires another API endpoint, e.g., DELETE /api/uploads/:id
      console.error('Orphaned file may exist:', uploadedFile.id);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Upload Content';
    }
  });
});
