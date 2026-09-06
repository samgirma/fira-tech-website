import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate, cn } from '../../lib/utils'
import {
  Search,
  Loader2,
  Trash2,
  Mail,
  MailOpen,
  MessageSquare,
  X,
} from 'lucide-react'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export default function RequestsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const data = await api.getContactMessages()
      setMessages(data)
    } catch (error) {
      console.error('Failed to load contact messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleRead = async (id: string, isRead: boolean) => {
    try {
      await api.markContactRead(id, isRead)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, is_read: isRead } : msg
        )
      )
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, is_read: isRead } : null))
      }
    } catch (error) {
      console.error('Failed to update read status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return
    setDeletingId(id)
    try {
      await api.deleteContactMessage(id)
      setMessages((prev) => prev.filter((msg) => msg.id !== id))
      if (selectedMessage?.id === id) {
        setSelectedMessage(null)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const unreadCount = messages.filter((msg) => !msg.is_read).length

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-surface-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Service Requests</h1>
          <p className="page-subtitle">
            Contact form submissions from your website
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {messages.length > 0 && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={cn(
                      'cursor-pointer hover:bg-surface-50 transition-colors',
                      !msg.is_read && 'bg-blue-50/50'
                    )}
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        {!msg.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                        <div>
                          <p className={cn('text-sm', !msg.is_read ? 'font-semibold text-surface-900' : 'font-medium text-surface-700')}>
                            {msg.name}
                          </p>
                          <p className="text-xs text-surface-500">{msg.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className={cn('text-sm truncate max-w-[200px]', !msg.is_read ? 'font-medium text-surface-900' : 'text-surface-700')}>
                        {msg.subject}
                      </p>
                    </td>
                    <td>
                      <p className="text-sm text-surface-500 truncate max-w-[300px]">
                        {msg.message.length > 100
                          ? `${msg.message.substring(0, 100)}...`
                          : msg.message}
                      </p>
                    </td>
                    <td>
                      <span className="text-sm text-surface-500">{formatDate(msg.created_at)}</span>
                    </td>
                    <td>
                      {msg.is_read ? (
                        <span className="badge bg-surface-100 text-surface-600">
                          <MailOpen size={12} className="mr-1" />
                          Read
                        </span>
                      ) : (
                        <span className="badge bg-blue-100 text-blue-700">
                          <Mail size={12} className="mr-1" />
                          Unread
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleRead(msg.id, !msg.is_read)}
                          className="p-1 hover:bg-surface-100 rounded"
                          title={msg.is_read ? 'Mark as unread' : 'Mark as read'}
                        >
                          {msg.is_read ? (
                            <Mail size={14} className="text-surface-400" />
                          ) : (
                            <MailOpen size={14} className="text-blue-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          disabled={deletingId === msg.id}
                          className="p-1 hover:bg-red-50 rounded"
                        >
                          {deletingId === msg.id ? (
                            <Loader2 size={14} className="text-red-400 animate-spin" />
                          ) : (
                            <Trash2 size={14} className="text-surface-400" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {messages.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-surface-400" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No requests yet</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              When visitors submit the contact form on your website, the messages will appear here.
            </p>
          </div>
        </div>
      )}

      {/* No search results */}
      {messages.length > 0 && filteredMessages.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-12">
            <Search size={24} className="text-surface-300 mb-3" />
            <p className="text-surface-500">No requests match your search.</p>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-surface-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
                  <MessageSquare size={18} className="text-brand-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-surface-900">{selectedMessage.subject}</h2>
                  <p className="text-sm text-surface-500">
                    From {selectedMessage.name} &lt;{selectedMessage.email}&gt;
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 hover:bg-surface-100 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-surface-600 mb-4">
                Received on {formatDate(selectedMessage.created_at)}
              </p>
              <div className="bg-surface-50 rounded-lg p-4">
                <p className="text-sm text-surface-700 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  handleToggleRead(selectedMessage.id, !selectedMessage.is_read)
                }}
                className="btn-ghost"
              >
                {selectedMessage.is_read ? (
                  <>
                    <Mail size={16} />
                    Mark as Unread
                  </>
                ) : (
                  <>
                    <MailOpen size={16} />
                    Mark as Read
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedMessage.id)
                }}
                disabled={deletingId === selectedMessage.id}
                className="btn-ghost text-red-600 hover:bg-red-50"
              >
                {deletingId === selectedMessage.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
