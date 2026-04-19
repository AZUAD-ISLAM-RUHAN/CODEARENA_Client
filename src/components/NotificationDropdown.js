import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const unreadCount = notifications.filter(
    (n) => n.type === 'battle_invite' || !n.read
  ).length;

  const formatTime = (value) => {
    if (!value) return 'Just now';
    try {
      return new Date(value).toLocaleString();
    } catch (error) {
      return 'Just now';
    }
  };

  const getToken = () => localStorage.getItem('token');

  const buildActionFromRelatedEntity = (relatedEntity) => {
    if (!relatedEntity?.entityId) return '/dashboard';

    const entityId =
      typeof relatedEntity.entityId === 'object'
        ? relatedEntity.entityId._id || relatedEntity.entityId.id
        : relatedEntity.entityId;

    if (relatedEntity.entityType === 'Problem') {
      return `/problem/${entityId}`;
    }

    return '/dashboard';
  };

  const mapStoredNotifications = (items = []) => {
    return items.map((item) => ({
      id: item._id,
      read: Boolean(item.isRead),
      type: item.type,
      title: item.title,
      message: item.message,
      time: formatTime(item.createdAt),
      createdAt: item.createdAt,
      action: item.actionUrl || buildActionFromRelatedEntity(item.relatedEntity),
    }));
  };

  const mapBattleInvitesToNotifications = (invites = []) => {
    return invites.map((battle) => {
      const inviter =
        battle?.invitedBy?.username ||
        battle?.invitedBy?.name ||
        'Someone';

      return {
        id: battle._id,
        battleId: battle._id,
        read: false,
        type: 'battle_invite',
        title: 'Battle Invite',
        message: `${inviter} invited you to a ${battle?.battleType || 'battle'} battle`,
        time: formatTime(battle?.createdAt),
        createdAt: battle?.createdAt,
        action: `/battle/${battle._id}`,
        inviterName: inviter,
        problemTitle: battle?.problem?.title || 'Random problem',
      };
    });
  };

  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) {
        setNotifications([]);
        return;
      }

      const [battleInviteResult, storedNotificationResult] = await Promise.allSettled([
        fetch(`${API_BASE}/battles/invites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      let battleInviteNotifications = [];
      let storedNotifications = [];

      if (
        battleInviteResult.status === 'fulfilled' &&
        battleInviteResult.value.ok
      ) {
        const battleInviteData = await battleInviteResult.value.json();
        battleInviteNotifications = mapBattleInvitesToNotifications(
          battleInviteData?.invites || []
        );
      }

      if (
        storedNotificationResult.status === 'fulfilled' &&
        storedNotificationResult.value.ok
      ) {
        const storedNotificationData = await storedNotificationResult.value.json();
        storedNotifications = mapStoredNotifications(
          storedNotificationData?.notifications || []
        );
      }

      const merged = [...battleInviteNotifications, ...storedNotifications].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      setNotifications(merged);
    } catch (error) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      const token = getToken();
      if (!token) return;

      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.type === 'battle_invite'
          ? n
          : { ...n, read: true }
      )
    );

    try {
      const token = getToken();
      if (!token) return;

      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
    }
  };

  const handleNotificationClick = async (notif) => {
    if (notif.type === 'battle_invite') return;

    await markAsRead(notif.id);
    setIsOpen(false);
    navigate(notif.action || '/dashboard');
  };

  const handleBattleInviteResponse = async (battleId, response) => {
    try {
      const token = getToken();
      if (!token) return;

      setActionLoadingId(battleId);

      const res = await fetch(`${API_BASE}/battles/${battleId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response }),
      });

      const data = await res.json();

      if (!res.ok) {
        return;
      }

      await fetchNotifications();

      if (response === 'accept' && data?.battle?._id) {
        setIsOpen(false);
        navigate(`/battle/${data.battle._id}`);
      }
    } catch (error) {
    } finally {
      setActionLoadingId(null);
    }
  };

  const getIcon = (type) => {
    const icons = {
      battle_invite: '⚔️',
      discussion_comment: '💬',
      discussion_reply: '↩️',
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
      discussion_comment: 'text-blue-400 bg-blue-400/10',
      discussion_reply: 'text-cyan-400 bg-cyan-400/10',
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-96 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950">
              <h3 className="font-semibold text-white">Notifications</h3>
              {notifications.some((n) => n.type !== 'battle_invite' && !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition"
                >
                  Mark all as read
                </button>
              )}
            </div>

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
                    className={`p-4 border-b border-gray-800 transition ${
                      notif.type === 'battle_invite'
                        ? 'bg-red-400/5'
                        : `cursor-pointer hover:bg-gray-800/50 ${!notif.read ? 'bg-yellow-400/5' : ''}`
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getColor(notif.type)}`}>
                        {getIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-medium text-sm ${!notif.read || notif.type === 'battle_invite' ? 'text-white' : 'text-gray-300'}`}>
                            {notif.title}
                          </h4>

                          {(notif.type === 'battle_invite' || !notif.read) && (
                            <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>

                        <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>

                        {notif.type === 'battle_invite' && (
                          <p className="text-gray-500 text-xs mt-1">
                            Problem: {notif.problemTitle}
                          </p>
                        )}

                        <p className="text-gray-500 text-xs mt-1">{notif.time}</p>

                        {notif.type === 'battle_invite' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBattleInviteResponse(notif.battleId, 'accept');
                              }}
                              disabled={actionLoadingId === notif.battleId}
                              className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Accept
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBattleInviteResponse(notif.battleId, 'reject');
                              }}
                              disabled={actionLoadingId === notif.battleId}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-800 bg-gray-950">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
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