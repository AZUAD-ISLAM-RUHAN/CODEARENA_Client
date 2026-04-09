import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch real notifications from API when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // For now, show empty notifications
        // When API is ready: const response = await fetch('http://localhost:5001/api/notifications', { headers: { 'Authorization': `Bearer ${token}` }});
        setNotifications([]);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      }
    };
    
    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setIsOpen(false);
    navigate(notif.action);
  };

  const getIcon = (type) => {
    const icons = {
      battle_invite: '⚔️',
      badge_earned: '🏅',
      contest_reminder: '🏆',
      submission_accepted: '✅',
      level_up: '⬆️',
      system: '🔔'
    };
    return icons[type] || '🔔';
  };

  const getColor = (type) => {
    const colors = {
      battle_invite: 'text-red-400 bg-red-400/10',
      badge_earned: 'text-purple-400 bg-purple-400/10',
      contest_reminder: 'text-yellow-400 bg-yellow-400/10',
      submission_accepted: 'text-green-400 bg-green-400/10',
      level_up: 'text-blue-400 bg-blue-400/10',
      system: 'text-gray-400 bg-gray-400/10'
    };
    return colors[type] || 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">🔔</div>
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 border-b border-gray-800 cursor-pointer transition hover:bg-gray-800/50 ${
                      !notif.read ? 'bg-yellow-400/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getColor(notif.type)}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-medium text-sm ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-gray-500 text-xs mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-800 bg-gray-950">
              <button 
                onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                className="w-full text-center text-sm text-gray-400 hover:text-white transition"
              >
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationDropdown;