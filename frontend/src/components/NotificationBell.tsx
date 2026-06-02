'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
        aria-label="Notifications"
      >
        Notifications
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed left-4 right-4 top-20 z-20 max-h-[min(24rem,calc(100vh-6rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <span className="font-medium text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-slate-500">
                  No notifications
                </li>
              ) : (
                notifications.map((n) => (
                  <li
                    key={n._id}
                    className={`border-b px-4 py-3 text-sm last:border-0 ${!n.read ? 'bg-blue-50' : ''}`}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        if (!n.read) markRead(n._id);
                        setOpen(false);
                      }}
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="text-slate-600">{n.body}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
