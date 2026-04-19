import React, { useEffect, useMemo, useState } from 'react';
import { MessageSquare, ThumbsUp, Reply } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:5001/api';

export default function DiscussionForum({ problemId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [likingCommentId, setLikingCommentId] = useState(null);
  const [error, setError] = useState('');

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }, []);

  const currentUserId = currentUser?._id || currentUser?.id || null;

  const getToken = () => localStorage.getItem('token');

  const getDisplayName = (userLike) => {
    if (!userLike) return 'Unknown User';
    if (typeof userLike === 'string') return userLike;
    return (
      userLike.username ||
      [userLike.firstName, userLike.lastName].filter(Boolean).join(' ').trim() ||
      'Unknown User'
    );
  };

  const getInitials = (name) => {
    const safeName = String(name || 'U').trim();
    if (!safeName) return 'U';

    const parts = safeName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  };

  const formatTimestamp = (value) => {
    if (!value) return 'just now';

    try {
      const date = new Date(value);
      const diffMs = Date.now() - date.getTime();

      if (Number.isNaN(diffMs)) return 'just now';

      const seconds = Math.floor(diffMs / 1000);
      if (seconds < 60) return 'just now';

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

      const days = Math.floor(hours / 24);
      if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

      return date.toLocaleString();
    } catch (error) {
      return 'just now';
    }
  };

  const buildDiscussionTitle = (content) => {
    const cleaned = String(content || '').replace(/\s+/g, ' ').trim();
    if (!cleaned) return 'Problem Discussion';
    if (cleaned.length <= 80) return cleaned;
    return `${cleaned.slice(0, 77)}...`;
  };

  const isLikedByCurrentUser = (comment) => {
    if (!Array.isArray(comment?.upvotedBy) || !currentUserId) return false;
    return comment.upvotedBy.some((id) => String(id) === String(currentUserId));
  };

  const fetchComments = async () => {
    if (!problemId) {
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_BASE}/discussions?problem=${encodeURIComponent(problemId)}&limit=100`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load discussions');
      }

      setComments(data.discussions || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setError(error.message || 'Failed to load discussions');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [problemId]);

  const handleAddComment = async () => {
    const content = newComment.trim();
    const token = getToken();

    if (!content) return;

    if (!token) {
      setError('Please login first to post a comment.');
      return;
    }

    try {
      setSubmittingComment(true);
      setError('');

      const response = await fetch(`${API_BASE}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: buildDiscussionTitle(content),
          content,
          category: 'Problems',
          problem: problemId,
          tags: []
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to post comment');
      }

      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Error posting discussion:', error);
      setError(error.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddReply = async (commentId) => {
    const content = replyText.trim();
    const token = getToken();

    if (!content) return;

    if (!token) {
      setError('Please login first to reply.');
      return;
    }

    try {
      setSubmittingReply(true);
      setError('');

      const response = await fetch(`${API_BASE}/discussions/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to post reply');
      }

      setReplyText('');
      setReplyingTo(null);
      await fetchComments();
    } catch (error) {
      console.error('Error posting reply:', error);
      setError(error.message || 'Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleToggleLike = async (commentId) => {
    const token = getToken();

    if (!token) {
      setError('Please login first to like a comment.');
      return;
    }

    try {
      setLikingCommentId(commentId);
      setError('');

      const response = await fetch(`${API_BASE}/discussions/${commentId}/upvote`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update like');
      }

      await fetchComments();
    } catch (error) {
      console.error('Error toggling like:', error);
      setError(error.message || 'Failed to update like');
    } finally {
      setLikingCommentId(null);
    }
  };

  const ReplyItem = ({ reply }) => {
    const replyAuthor = getDisplayName(reply?.authorId);
    const replyAvatar = getInitials(replyAuthor);

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="ml-6 border-l-2 border-gray-300 dark:border-gray-700 pl-4"
      >
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-gray-950 flex items-center justify-center text-xs font-bold">
              {replyAvatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {replyAuthor}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimestamp(reply?.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {reply?.content}
          </p>
        </div>
      </motion.div>
    );
  };

  const CommentItem = ({ comment }) => {
    const commentAuthor = getDisplayName(comment?.author);
    const commentAvatar = getInitials(commentAuthor);
    const liked = isLikedByCurrentUser(comment);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-gray-950 flex items-center justify-center text-xs font-bold">
              {commentAvatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {commentAuthor}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimestamp(comment?.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-relaxed whitespace-pre-wrap">
            {comment?.content}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleToggleLike(comment._id)}
              disabled={likingCommentId === comment._id}
              className={`flex items-center gap-1 text-xs transition ${
                liked
                  ? 'text-yellow-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              } disabled:opacity-60`}
            >
              <ThumbsUp size={14} fill={liked ? 'currentColor' : 'none'} />
              {comment?.upvotes || 0}
            </button>

            <button
              onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              <Reply size={14} />
              Reply
            </button>
          </div>

          {replyingTo === comment._id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-yellow-400 resize-none"
                rows="2"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleAddReply(comment._id)}
                  disabled={!replyText.trim() || submittingReply}
                  className="px-3 py-1 bg-yellow-400 text-gray-950 rounded text-xs font-medium hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReply ? 'Replying...' : 'Reply'}
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-xs font-medium hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {Array.isArray(comment?.replies) && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {comment.replies.map((reply) => (
                <ReplyItem key={reply._id || `${comment._id}-${reply.createdAt}`} reply={reply} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={20} className="text-yellow-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Discussion ({comments.length})
        </h3>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your approach or ask a question..."
          className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 resize-none"
          rows="3"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || submittingComment}
            className="px-4 py-2 bg-yellow-400 text-gray-950 rounded-lg font-medium hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading discussions...
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="mx-auto mb-2 opacity-50" />
            <p>No discussions yet. Be the first to start!</p>
          </div>
        )}
      </div>
    </div>
  );
}