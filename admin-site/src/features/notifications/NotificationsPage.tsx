import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { getRelativeTime, cn } from '../../lib/utils'
import { BellOff, Loader2, Trash2, Check, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  read: boolean
  action_url?: string
  created_at: string
}

const typeConfig = {
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
  success: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const [data, countData] = await Promise.all([
        api.getNotifications(),
        api.getUnreadNotificationCount(),
      ])
      setNotifications(data)
      setUnreadCount(countData.count)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markRead = async (id: string) => {
    await api.markNotificationRead(id)
    await loadNotifications()
  }

  const markAllRead = async () => {
    await api.markAllNotificationsRead()
    await loadNotifications()
  }

  const deleteNotification = async (id: string) => {
    await api.deleteNotification(id)
    await loadNotifications()
  }

  return (
    <div className="page-container max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-sm">
            <Check size={16} />
            Mark all read
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="text-surface-400 animate-spin" />
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
              <BellOff size={24} className="text-surface-400" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No notifications</h3>
            <p className="text-surface-500 mt-2 text-center">You're all caught up!</p>
          </div>
        </div>
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config = typeConfig[n.type]
            const Icon = config.icon
            return (
              <div
                key={n.id}
                className={cn(
                  'card p-4 flex items-start gap-3',
                  !n.read && 'border-l-4 border-l-brand-500'
                )}
              >
                <div className={cn('p-2 rounded-lg', config.bg)}>
                  <Icon size={16} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', n.read ? 'text-surface-700' : 'text-surface-900')}>
                    {n.title}
                  </p>
                  {n.message && <p className="text-sm text-surface-500 mt-0.5">{n.message}</p>}
                  <p className="text-xs text-surface-400 mt-1">{getRelativeTime(n.created_at)}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} className="p-1.5 hover:bg-surface-100 rounded" title="Mark as read">
                      <Check size={14} className="text-surface-400" />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} className="p-1.5 hover:bg-red-50 rounded" title="Delete">
                    <Trash2 size={14} className="text-surface-400" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
