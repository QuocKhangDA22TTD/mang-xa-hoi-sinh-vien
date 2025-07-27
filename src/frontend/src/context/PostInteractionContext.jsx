import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { getPostInteractions } from '../api/postInteractions';

const PostInteractionContext = createContext();

export const usePostInteraction = () => {
  const context = useContext(PostInteractionContext);
  if (!context) {
    throw new Error(
      'usePostInteraction must be used within PostInteractionProvider'
    );
  }
  return context;
};

export const PostInteractionProvider = ({ children }) => {
  const { socket } = useSocket();
  const [postInteractions, setPostInteractions] = useState({});
  const [loading, setLoading] = useState({});

  // Load interactions for a specific post
  const loadPostInteractions = async (postId) => {
    if (postInteractions[postId]) {
      return postInteractions[postId]; // Return cached data
    }

    setLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      console.log('📊 Context: Loading interactions for post:', postId);
      const interactions = await getPostInteractions(postId);

      console.log('📊 Context: Received interactions:', {
        postId,
        userLiked: interactions.likes?.userLiked,
        likeCount: interactions.likes?.count,
        fullData: interactions,
      });

      setPostInteractions((prev) => ({
        ...prev,
        [postId]: interactions,
      }));

      return interactions;
    } catch (error) {
      console.error('❌ Error loading post interactions:', error);
      return {
        likes: { count: 0, userLiked: false },
        comments: { count: 0, data: [] },
      };
    } finally {
      setLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Update like count for a post
  const updateLikeCount = (postId, likeCount, userLiked) => {
    console.log(`🔄 Context: updateLikeCount called:`, {
      postId,
      likeCount,
      userLiked,
      currentState: postInteractions[postId]?.likes,
    });

    setPostInteractions((prev) => {
      const newState = {
        ...prev,
        [postId]: {
          ...prev[postId],
          likes: {
            count: likeCount,
            userLiked: userLiked,
          },
        },
      };

      console.log(`✅ Context: Updated state for post ${postId}:`, {
        oldLikes: prev[postId]?.likes,
        newLikes: newState[postId].likes,
      });

      return newState;
    });
  };

  // Update comment count for a post
  const updateCommentCount = (postId, commentCount) => {
    setPostInteractions((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        comments: {
          ...prev[postId]?.comments,
          count: commentCount,
        },
      },
    }));
  };

  // Add new comment to post
  const addCommentToPost = (postId, comment) => {
    setPostInteractions((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        comments: {
          count: (prev[postId]?.comments?.count || 0) + 1,
          data: [...(prev[postId]?.comments?.data || []), comment],
        },
      },
    }));
  };

  // Remove comment from post
  const removeCommentFromPost = (postId, commentId) => {
    setPostInteractions((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        comments: {
          count: Math.max(0, (prev[postId]?.comments?.count || 0) - 1),
          data: (prev[postId]?.comments?.data || []).filter(
            (comment) => comment.id !== commentId
          ),
        },
      },
    }));
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Handle post liked
    const handlePostLiked = (data) => {
      console.log('👍 Real-time: Post liked', data);

      // Always reload to get accurate user like status
      loadPostInteractions(data.postId);
    };

    // Handle post unliked
    const handlePostUnliked = (data) => {
      console.log('👎 Real-time: Post unliked', data);

      // Always reload to get accurate user like status
      loadPostInteractions(data.postId);
    };

    // Handle comment added
    const handleCommentAdded = (data) => {
      console.log('💬 Real-time: Comment added', data);
      addCommentToPost(data.postId, data.comment);
    };

    // Handle comment deleted
    const handleCommentDeleted = (data) => {
      console.log('🗑️ Real-time: Comment deleted', data);
      removeCommentFromPost(data.postId, data.commentId);
    };

    // Register socket listeners
    socket.on('post_liked', handlePostLiked);
    socket.on('post_unliked', handlePostUnliked);
    socket.on('comment_added', handleCommentAdded);
    socket.on('comment_deleted', handleCommentDeleted);

    // Cleanup
    return () => {
      socket.off('post_liked', handlePostLiked);
      socket.off('post_unliked', handlePostUnliked);
      socket.off('comment_added', handleCommentAdded);
      socket.off('comment_deleted', handleCommentDeleted);
    };
  }, [socket]);

  // Get interactions for a specific post
  const getInteractions = (postId) => {
    return (
      postInteractions[postId] || {
        likes: { count: 0, userLiked: false },
        comments: { count: 0, data: [] },
      }
    );
  };

  // Check if post interactions are loading
  const isLoading = (postId) => {
    return loading[postId] || false;
  };

  // Clear interactions cache (useful when navigating away)
  const clearCache = () => {
    setPostInteractions({});
    setLoading({});
  };

  // Refresh interactions for a specific post
  const refreshPostInteractions = async (postId) => {
    // Remove from cache and reload
    setPostInteractions((prev) => {
      const newState = { ...prev };
      delete newState[postId];
      return newState;
    });

    return await loadPostInteractions(postId);
  };

  const value = {
    // Data
    postInteractions,

    // Methods
    loadPostInteractions,
    getInteractions,
    isLoading,
    clearCache,
    refreshPostInteractions,

    // Update methods (for optimistic updates)
    updateLikeCount,
    updateCommentCount,
    addCommentToPost,
    removeCommentFromPost,
  };

  return (
    <PostInteractionContext.Provider value={value}>
      {children}
    </PostInteractionContext.Provider>
  );
};
