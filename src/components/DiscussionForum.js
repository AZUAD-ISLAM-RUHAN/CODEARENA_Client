import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Reply, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DiscussionForum({ problemId }) {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Alice Johnson',
      avatar: 'AJ',
      content: 'I solved this using a hash map approach for O(n) time complexity. Here\'s my solution...',
      timestamp: '2 hours ago',
      likes: 12,
      liked: false,
      replies: [
        {
          id: 11,
          author: 'Bob Smith',
          avatar: 'BS',
          content: 'Great approach! Much better than my initial solution.',
          timestamp: '1 hour ago',
          likes: 3,
          liked: false,
        }
      ]
    },
    {
      id: 2,
      author: 'Charlie Brown',
      avatar: 'CB',
      content: 'Anyone else struggling with the edge cases? The example with empty array is tricky.',
      timestamp: '45 minutes ago',
      likes: 5,
      liked: false,
      replies: []
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Math.max(...comments.map(c => c.id), 0) + 1,
        author: 'You',
        avatar: 'YO',
        content: newComment,
        timestamp: 'just now',
        likes: 0,
        liked: false,
        replies: []
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const handleAddReply = (commentId) => {
    if (replyText.trim()) {
      setComments(comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [
              ...c.replies,
              {
                id: Math.max(...c.replies.map(r => r.id), commentId * 10),
                author: 'You',
                avatar: 'YO',
                content: replyText,
                timestamp: 'just now',
                likes: 0,
                liked: false,
              }
            ]
          };
        }
        return c;
      }));
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleToggleLike = (commentId, replyId = null) => {
    if (replyId) {
      setComments(comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: c.replies.map(r => {
              if (r.id === replyId) {
                return {
                  ...r,
                  liked: !r.liked,
                  likes: r.liked ? r.likes - 1 : r.likes + 1
                };
              }
              return r;
            })
          };
        }
        return c;
      }));
    } else {
      setComments(comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            liked: !c.liked,
            likes: c.liked ? c.likes - 1 : c.likes + 1
          };
        }
        return c;
      }));
    }
  };

  const CommentItem = ({ comment, depth = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-4 ${depth > 0 ? 'ml-6 border-l-2 border-gray-300 dark:border-gray-700 pl-4' : ''}`}
    >
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-yellow-400 text-gray-950 flex items-center justify-center text-xs font-bold">
            {comment.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {comment.author}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {comment.timestamp}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-relaxed">
          {comment.content}
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => handleToggleLike(comment.id)}
            className={`flex items-center gap-1 text-xs transition ${
              comment.liked
                ? 'text-yellow-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <ThumbsUp size={14} fill={comment.liked ? 'currentColor' : 'none'} />
            {comment.likes}
          </button>
          <button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
          >
            <Reply size={14} />
            Reply
          </button>
        </div>

        {/* Reply Input */}
        {replyingTo === comment.id && (
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
                onClick={() => handleAddReply(comment.id)}
                className="px-3 py-1 bg-yellow-400 text-gray-950 rounded text-xs font-medium hover:bg-yellow-500 transition"
              >
                Reply
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

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-2">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* Discussion Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={20} className="text-yellow-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
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
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-yellow-400 text-gray-950 rounded-lg font-medium hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post Comment
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MessageSquare className="mx-auto mb-2 opacity-50" />
          <p>No discussions yet. Be the first to start!</p>
        </div>
      )}
    </div>
  );
}
