const API_BASE = 'https://daring-embrace-production.up.railway.app/api/posts';

// Get post interactions (likes and comments)
export async function getPostInteractions(postId) {
  console.log('🔍 Getting interactions for post:', postId);
  const res = await fetch(`${API_BASE}/${postId}/interactions`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ getPostInteractions API error:', res.status, errorText);
    throw new Error(
      `HTTP ${res.status}: ${errorText || 'Không lấy được thông tin tương tác'}`
    );
  }

  const data = await res.json();
  console.log('✅ API Response - getPostInteractions:', {
    postId,
    likes: data.likes,
    userLiked: data.likes?.userLiked,
    likeCount: data.likes?.count,
    comments: data.comments?.count,
    fullResponse: data,
  });
  return data;
}

// Toggle like (like if not liked, unlike if liked)
export async function toggleLike(postId) {
  console.log('🔄 API: Toggling like for post:', postId);
  const res = await fetch(`${API_BASE}/${postId}/toggle-like`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ toggleLike API error:', res.status, errorText);
    throw new Error(
      `HTTP ${res.status}: ${errorText || 'Không thể thay đổi trạng thái thích'}`
    );
  }

  const data = await res.json();
  console.log('✅ API Response - toggleLike:', {
    liked: data.liked,
    likeCount: data.likeCount,
    message: data.message,
    fullResponse: data,
  });
  return data;
}

// Like a post
export async function likePost(postId) {
  console.log('👍 Liking post:', postId);
  const res = await fetch(`${API_BASE}/${postId}/like`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ likePost API error:', res.status, errorText);
    throw new Error(
      `HTTP ${res.status}: ${errorText || 'Không thể thích bài viết'}`
    );
  }

  const data = await res.json();
  console.log('✅ likePost API response:', data);
  return data;
}

// Unlike a post
export async function unlikePost(postId) {
  console.log('👎 Unliking post:', postId);
  const res = await fetch(`${API_BASE}/${postId}/like`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ unlikePost API error:', res.status, errorText);
    throw new Error(
      `HTTP ${res.status}: ${errorText || 'Không thể bỏ thích bài viết'}`
    );
  }

  const data = await res.json();
  console.log('✅ unlikePost API response:', data);
  return data;
}

// Add comment to post
export async function addComment(postId, content) {
  console.log('💬 Adding comment to post:', postId, content);
  const res = await fetch(`${API_BASE}/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ addComment API error:', res.status, errorText);
    throw new Error(
      `HTTP ${res.status}: ${errorText || 'Không thể thêm comment'}`
    );
  }

  const data = await res.json();
  console.log('✅ addComment API response:', data);
  return data;
}

// Delete comment
export async function deleteComment(commentId) {
  console.log('🗑️ Deleting comment:', commentId);
  const res = await fetch(`${API_BASE}/comments/${commentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ deleteComment API error:', res.status, errorText);
    throw new Error(
      `HTTP ${res.status}: ${errorText || 'Không thể xóa comment'}`
    );
  }

  const data = await res.json();
  console.log('✅ deleteComment API response:', data);
  return data;
}
