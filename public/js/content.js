document.addEventListener('DOMContentLoaded', async () => {
  const contentArea = document.getElementById('content-area');
  const commentThread = document.getElementById('comment-thread');
  const mainCommentForm = document.getElementById('comment-form');
  const messageArea = document.getElementById('message-area');

  const accessToken = localStorage.getItem('accessToken');
  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get('id');

  if (!contentId) {
    contentArea.innerHTML = '<h2>Content not found.</h2><p>No content ID was provided in the URL.</p>';
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

  // --- Data Fetching ---
  const fetchContent = () => fetch(`/api/content/${contentId}`).then(res => res.json());
  const fetchComments = () => fetch(`/api/content/${contentId}/comments`).then(res => res.json());

  // --- Rendering ---
  const renderContent = (content) => {
    document.title = `${content.title} - Gole Kaab`;
    let attachmentsHtml = '<h4>No attachments</h4>';
    if (content.attachments && content.attachments.length > 0) {
        attachmentsHtml = `<h4>Attachments</h4><p><a href="/api/uploads/${content.attachments[0].fileId}" target="_blank" class="btn-primary">Download File</a></p>`;
    }
    contentArea.innerHTML = `
      <div class="content-body">
        <h2>${content.title}</h2>
        <p class="content-meta">By ${content.authorId.name} on ${new Date(content.createdAt).toLocaleDateString()}</p>
        <p>${content.summary}</p>
        ${attachmentsHtml}
        <div class="social-share" style="margin-top: 2rem;">
          <h4>Share this content</h4>
          <button class="share-btn" data-platform="twitter">Share on X</button>
          <button class="share-btn" data-platform="facebook">Share on Facebook</button>
          <button class="share-btn" data-platform="whatsapp">Share on WhatsApp</button>
        </div>
      </div>
    `;
  };

  const createCommentsHtml = (comments) => {
    return comments.map(comment => `
      <li class="comment" data-id="${comment._id}">
        <p class="comment-author">${comment.authorId.name || 'Anonymous'}</p>
        <p class="comment-text">${comment.text}</p>
        <div class="comment-actions">
          <button class="like-btn">Like (${comment.reactions.likes})</button>
          <button class="reply-btn">Reply</button>
          <button class="flag-btn">Flag</button>
        </div>
        <div class="reply-form-container" style="display:none;"></div>
        ${comment.children.length > 0 ? `<ul class="comment-replies">${createCommentsHtml(comment.children)}</ul>` : ''}
      </li>
    `).join('');
  };

  const renderCommentTree = (comments) => {
    const commentMap = {};
    comments.forEach(comment => {
      commentMap[comment._id] = { ...comment, children: [] };
    });
    const tree = [];
    comments.forEach(comment => {
      if (comment.parentId && commentMap[comment.parentId]) {
        commentMap[comment.parentId].children.push(commentMap[comment._id]);
      } else {
        tree.push(commentMap[comment._id]);
      }
    });
    commentThread.innerHTML = createCommentsHtml(tree);
  };

  // --- Event Handling ---
  const postComment = async (text, parentId = null) => {
    if (!accessToken) return showMessage('You must be logged in to comment.', 'error');
    if (!text) return;

    try {
      const response = await fetch(`/api/content/${contentId}/comments`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ text, parentId }),
      });
      if (!response.ok) throw new Error('Failed to post comment.');

      const comments = await fetchComments();
      renderCommentTree(comments);
      return true;
    } catch (error) {
      showMessage(error.message, 'error');
      return false;
    }
  };

  mainCommentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const textArea = document.getElementById('comment-text');
    if (await postComment(textArea.value)) {
      textArea.value = '';
    }
  });

  commentThread.addEventListener('click', async (e) => {
    if (!accessToken) return showMessage('You must be logged in to interact.', 'error');

    const target = e.target;
    const commentLi = target.closest('.comment');
    if (!commentLi) return;
    const commentId = commentLi.dataset.id;

    // Handle Reply
    if (target.classList.contains('reply-btn')) {
      const replyContainer = commentLi.querySelector('.reply-form-container');
      if (replyContainer.style.display === 'none') {
        replyContainer.style.display = 'block';
        replyContainer.innerHTML = `
          <form class="reply-form">
            <div class="form-group">
              <textarea rows="2" placeholder="Write a reply..."></textarea>
            </div>
            <button type="submit" class="btn-primary">Submit Reply</button>
          </form>
        `;
      } else {
        replyContainer.style.display = 'none';
        replyContainer.innerHTML = '';
      }
    }

    // Handle Like
    if (target.classList.contains('like-btn')) {
      try {
        const response = await fetch(`/api/comments/${commentId}/react`, {
          method: 'POST', headers: authHeaders, body: JSON.stringify({ reactionType: 'likes' })
        });
        if (!response.ok) throw new Error('Failed to like comment.');
        const reactions = await response.json();
        target.textContent = `Like (${reactions.likes})`;
      } catch (error) { showMessage(error.message, 'error'); }
    }

    // Handle Flag
    if (target.classList.contains('flag-btn')) {
      const reason = prompt('Please provide a reason for flagging this comment:');
      if (reason) {
        try {
          const response = await fetch(`/api/comments/${commentId}/flag`, {
            method: 'POST', headers: authHeaders, body: JSON.stringify({ reason })
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message);
          showMessage('Comment flagged for review.', 'success');
        } catch (error) { showMessage(error.message, 'error'); }
      }
    }
  });

  commentThread.addEventListener('submit', async(e) => {
    if (e.target.classList.contains('reply-form')) {
      e.preventDefault();
      const parentComment = e.target.closest('.comment');
      const parentId = parentComment.dataset.id;
      const textArea = e.target.querySelector('textarea');
      if (await postComment(textArea.value, parentId)) {
        parentComment.querySelector('.reply-form-container').style.display = 'none';
      }
    }
  });

  contentArea.addEventListener('click', (e) => {
    if (e.target.classList.contains('share-btn')) {
      const platform = e.target.dataset.platform;
      const contentTitle = contentArea.querySelector('h2').textContent;
      const pageUrl = window.location.href;
      let shareUrl = '';

      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(contentTitle)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
          break;
        case 'whatsapp':
          shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(contentTitle + ' ' + pageUrl)}`;
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    }
  });

  // --- Initialization ---
  let loadedContent;
  const init = async () => {
    const [content, comments] = await Promise.all([fetchContent(), fetchComments()]);
    if (content) {
      loadedContent = content;
      renderContent(content);
    }
    if (comments) renderCommentTree(comments);
  };

  init();
});
