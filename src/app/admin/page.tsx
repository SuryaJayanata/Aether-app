'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Trash2, 
  Search, 
  MessageCircle, 
  User, 
  Heart, 
  AlertTriangle,
  Music,
  LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface Message {
  id: string
  message: string
  from_name?: string
  to_name?: string
  spotify_track_id?: string
  spotify_data?: any
  likes: number
  session_id: string
  created_at: string
}

export default function AdminPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    withSpotify: 0,
    withNames: 0,
    totalLikes: 0
  })

  const { user, logout } = useAuth()
  const router = useRouter()

  // Redirect jika tidak authenticated
  useEffect(() => {
    if (!user) {
      router.push('/admin/login')
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      fetchMessages()
    }
  }, [user])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching messages:', error)
        return
      }

      setMessages(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error in fetchMessages:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (messagesData: Message[]) => {
    const total = messagesData.length
    const withSpotify = messagesData.filter(m => m.spotify_track_id).length
    const withNames = messagesData.filter(m => m.from_name).length
    const totalLikes = messagesData.reduce((sum, m) => sum + m.likes, 0)

    setStats({
      total,
      withSpotify,
      withNames,
      totalLikes
    })
  }

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  const filteredMessages = messages.filter(message =>
    message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.from_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.to_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectMessage = (messageId: string) => {
    const newSelected = new Set(selectedMessages)
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId)
    } else {
      newSelected.add(messageId)
    }
    setSelectedMessages(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedMessages.size === filteredMessages.length) {
      setSelectedMessages(new Set())
    } else {
      setSelectedMessages(new Set(filteredMessages.map(m => m.id)))
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    setDeleteLoading(messageId)
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      setMessages(prev => prev.filter(m => m.id !== messageId))
      setSelectedMessages(prev => {
        const newSelected = new Set(prev)
        newSelected.delete(messageId)
        return newSelected
      })
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Failed to delete message. Please try again.')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMessages.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedMessages.size} messages? This action cannot be undone.`)) return

    setBulkDeleteLoading(true)
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .in('id', Array.from(selectedMessages))

      if (error) throw error

      setMessages(prev => prev.filter(m => !selectedMessages.has(m.id)))
      setSelectedMessages(new Set())
      
      alert(`Successfully deleted ${selectedMessages.size} messages.`)
    } catch (error) {
      console.error('Error bulk deleting messages:', error)
      alert('Failed to delete messages. Please try again.')
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  const handleDeleteAllMessages = async () => {
    if (!confirm('⚠️ DANGER: Are you absolutely sure you want to delete ALL messages? This action cannot be undone!')) return

    setBulkDeleteLoading(true)
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .neq('id', '')

      if (error) throw error

      setMessages([])
      setSelectedMessages(new Set())
      alert('All messages have been deleted successfully.')
    } catch (error) {
      console.error('Error deleting all messages:', error)
      alert('Failed to delete all messages. Please try again.')
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)] mx-auto"></div>
          <p className="mt-4 text-[var(--text-light)]">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 -z-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6ba8d1]/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#a8d8f0]/8 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)]"></div>
            <p className="mt-4 text-[var(--text-light)]">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6ba8d1]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#a8d8f0]/8 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="my-8"
        >
          {/* Header dengan Logout */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div></div>
              <h1 className="font-cinzel text-4xl font-bold text-[var(--text-dark)]">
                Admin Dashboard
              </h1>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
            <p className="text-lg text-[var(--text-light)]">
              Welcome back, {user.email}
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-light)]">Total Messages</p>
                  <p className="text-3xl font-bold text-[var(--text-dark)]">{stats.total}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-[var(--primary-blue)]" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-light)]">With Spotify</p>
                  <p className="text-3xl font-bold text-[var(--text-dark)]">{stats.withSpotify}</p>
                </div>
                <Music className="w-8 h-8 text-[#1DB954]" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-light)]">With Names</p>
                  <p className="text-3xl font-bold text-[var(--text-dark)]">{stats.withNames}</p>
                </div>
                <User className="w-8 h-8 text-[var(--gold)]" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-light)]">Total Likes</p>
                  <p className="text-3xl font-bold text-[var(--text-dark)]">{stats.totalLikes}</p>
                </div>
                <Heart className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-light)] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search messages, names..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#8bc5e8]/30 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                />
              </div>

              {/* Bulk Actions */}
              <div className="flex gap-3 w-full lg:w-auto">
                {selectedMessages.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleteLoading}
                    className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedMessages.size})
                    {bulkDeleteLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  </button>
                )}

                <button
                  onClick={handleDeleteAllMessages}
                  disabled={messages.length === 0 || bulkDeleteLoading}
                  className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Delete All Messages
                </button>
              </div>
            </div>
          </div>

          {/* Messages Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg overflow-hidden">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-[var(--text-light)] mx-auto mb-4 opacity-50" />
                <p className="text-lg text-[var(--text-light)]">
                  {searchTerm ? 'No messages found matching your search.' : 'No messages yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#8bc5e8]/30">
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedMessages.size === filteredMessages.length && filteredMessages.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-[var(--primary-blue)] rounded focus:ring-[var(--primary-blue)]"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-dark)]">Message</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-dark)]">From</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-dark)]">To</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-dark)]">Likes</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-dark)]">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-dark)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#8bc5e8]/20">
                    {filteredMessages.map((message) => (
                      <tr key={message.id} className="hover:bg-[var(--light-blue)]/30 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedMessages.has(message.id)}
                            onChange={() => handleSelectMessage(message.id)}
                            className="w-4 h-4 text-[var(--primary-blue)] rounded focus:ring-[var(--primary-blue)]"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-[var(--text-dark)] line-clamp-2">
                              {message.message}
                            </p>
                            {message.spotify_track_id && (
                              <span className="inline-block mt-1 px-2 py-1 bg-[#1DB954]/10 text-[#1DB954] text-xs rounded-full">
                                🎵 Has Spotify
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[var(--text-dark)]">
                            {message.from_name || 'Anonymous'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[var(--text-dark)]">
                            {message.to_name || 'Someone'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-[var(--text-dark)]">{message.likes}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[var(--text-light)]">
                            {formatDate(message.created_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            disabled={deleteLoading === message.id}
                            className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                            {deleteLoading === message.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="text-center mt-6">
            <p className="text-sm text-[var(--text-light)]">
              Showing {filteredMessages.length} of {messages.length} messages
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}