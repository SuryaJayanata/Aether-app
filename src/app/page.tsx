'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import MessageCard from '@/components/MessageCard'
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

type SortOption = 'newest' | 'popular' | 'oldest'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set())
  const [likesTableExists, setLikesTableExists] = useState<boolean>(true)
  const [isProcessingLike, setIsProcessingLike] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    
    const getSessionId = () => {
      if (typeof window !== 'undefined') {
        let sessionId = localStorage.getItem('aether_session_id')
        if (!sessionId) {
          sessionId = crypto.randomUUID()
          localStorage.setItem('aether_session_id', sessionId)
        }
        setSessionId(sessionId)
        return sessionId
      }
      return ''
    }

    const fetchMessagesAndLikes = async () => {
      try {
        const sessionId = getSessionId()
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })

        if (messagesError) {
          console.error('Error fetching messages:', messagesError)
        } else {
          setMessages(messagesData || [])
        }

        // Fetch user's likes
        let likedMessageIds: string[] = []
        try {
          const { data: likesData, error: likesError } = await supabase
            .from('likes')
            .select('message_id')
            .eq('session_id', sessionId)

          if (likesError) {
            console.warn('Likes table might not exist, using localStorage fallback')
            setLikesTableExists(false)
            const savedLikes = localStorage.getItem(`aether_likes_${sessionId}`)
            likedMessageIds = savedLikes ? JSON.parse(savedLikes) : []
          } else {
            likedMessageIds = likesData?.map(like => like.message_id) || []
          }
        } catch (error) {
          console.warn('Failed to fetch likes, using localStorage')
          setLikesTableExists(false)
          const savedLikes = localStorage.getItem(`aether_likes_${sessionId}`)
          likedMessageIds = savedLikes ? JSON.parse(savedLikes) : []
        }

        setUserLikes(new Set(likedMessageIds))
        
      } catch (error) {
        console.error('Error in fetchMessagesAndLikes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessagesAndLikes()

    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchMessagesAndLikes()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLike = async (messageId: string) => {
    if (isProcessingLike === messageId) return
    setIsProcessingLike(messageId)

    const message = messages.find(m => m.id === messageId)
    if (!message) {
      setIsProcessingLike(null)
      return
    }

    const alreadyLiked = userLikes.has(messageId)
    const newLikeCount = alreadyLiked ? Math.max(0, message.likes - 1) : message.likes + 1

    // Optimistic UI update
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, likes: newLikeCount } : m
    ))

    setUserLikes(prev => {
      const newLikes = new Set(prev)
      if (alreadyLiked) {
        newLikes.delete(messageId)
      } else {
        newLikes.add(messageId)
      }
      return newLikes
    })

    try {
      // Update message likes count
      const { error: messageError } = await supabase
        .from('messages')
        .update({ likes: newLikeCount })
        .eq('id', messageId)

      if (messageError) throw messageError

      // Update likes table
      if (likesTableExists) {
        if (alreadyLiked) {
          await supabase
            .from('likes')
            .delete()
            .eq('message_id', messageId)
            .eq('session_id', sessionId)
        } else {
          await supabase
            .from('likes')
            .insert([{
              message_id: messageId,
              session_id: sessionId
            }])
        }
      }

      // Update localStorage
      const currentUserLikes = new Set(userLikes)
      if (alreadyLiked) {
        currentUserLikes.delete(messageId)
      } else {
        currentUserLikes.add(messageId)
      }
      localStorage.setItem(`aether_likes_${sessionId}`, JSON.stringify([...currentUserLikes]))

    } catch (error) {
      console.error('Like operation failed:', error)
      // Rollback
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, likes: message.likes } : m
      ))
      setUserLikes(prev => new Set(prev))
    } finally {
      setIsProcessingLike(null)
    }
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      setMessages(prev => prev.filter(m => m.id !== messageId))
      setUserLikes(prev => {
        const newLikes = new Set(prev)
        newLikes.delete(messageId)
        return newLikes
      })

    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete message. Please try again.')
    }
  }

  const getSortedMessages = () => {
    const sorted = [...messages]
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'popular':
        return sorted.sort((a, b) => b.likes - a.likes || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      default:
        return sorted
    }
  }

  const sortedMessages = getSortedMessages()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Blobs dengan animasi kaya */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6ba8d1]/5 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#a8d8f0]/8 rounded-full blur-3xl animate-float-medium"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--gold)]/3 rounded-full blur-3xl animate-float-fast"></div>
      </div>

      {/* Floating Particles yang lebih banyak */}
      {isClient && (
        <div className="fixed inset-0 -z-10 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[var(--accent-blue)]/60 rounded-full shadow-lg animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${8 + Math.random() * 12}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 max-w-6xl">
        <Navbar />
        <Hero />
        
        {/* Messages Grid */}
        <section className="my-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="font-cinzel text-3xl font-bold text-[var(--text-dark)] mb-4 md:mb-0">
              Public Whispers
            </h2>
            
            {/* Sorting Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[var(--text-light)]">Sort by:</span>
              <div className="flex bg-white/50 backdrop-blur-sm rounded-lg p-1 border border-white/30">
                {[
                  { value: 'newest' as SortOption, label: 'Newest' },
                  { value: 'popular' as SortOption, label: 'Popular' },
                  { value: 'oldest' as SortOption, label: 'Oldest' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                      sortBy === option.value
                        ? 'bg-[var(--primary-blue)] text-white shadow-sm'
                        : 'text-[var(--text-light)] hover:text-[var(--text-dark)] hover:bg-white/60'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)]"></div>
              <p className="mt-4 text-[var(--text-light)]">Loading messages...</p>
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-[var(--text-light)] italic mb-8">
                No messages yet. Be the first to share your thoughts...
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105">
                    <div className="text-lg italic text-gray-500 mb-4">
                      "Your message could appear here..."
                    </div>
                    <div className="text-sm text-gray-400 text-right">
                      From: Anonymous
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedMessages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  currentSessionId={sessionId}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  isLiked={userLikes.has(message.id)}
                  isProcessing={isProcessingLike === message.id}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="text-center py-12 mt-20 border-t border-[#6ba8d1]/10 relative">
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--primary-blue)] to-transparent opacity-30"></div>
          <p className="text-[var(--text-light)]">
            Aether &copy; 2025 - Where Secret Words Find Their Voice
          </p>
          <p className="text-sm text-[var(--text-light)] mt-2">
            Send messages safely, anonymously, and freely
          </p>
        </footer>
      </div>
    </div>
  )
}