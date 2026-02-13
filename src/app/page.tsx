'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import MessageCard from '@/components/MessageCard'
import { supabase } from '@/lib/supabaseClient'
import { Heart, MailOpen, Sparkles } from 'lucide-react'

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
        let sessionId = localStorage.getItem('valentine_session_id')
        if (!sessionId) {
          sessionId = crypto.randomUUID()
          localStorage.setItem('valentine_session_id', sessionId)
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
            const savedLikes = localStorage.getItem(`valentine_likes_${sessionId}`)
            likedMessageIds = savedLikes ? JSON.parse(savedLikes) : []
          } else {
            likedMessageIds = likesData?.map(like => like.message_id) || []
          }
        } catch (error) {
          console.warn('Failed to fetch likes, using localStorage')
          setLikesTableExists(false)
          const savedLikes = localStorage.getItem(`valentine_likes_${sessionId}`)
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
      localStorage.setItem(`valentine_likes_${sessionId}`, JSON.stringify([...currentUserLikes]))

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
    if (!confirm('Are you sure you want to delete this secret love note?')) return

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
    <div className="min-h-screen relative overflow-hidden bg-rose-50 text-gray-900">
      {/* Background Blobs - Disesuaikan ke Pink/Red lembut */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-40 animate-float-slow"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-30 animate-float-medium"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-200 rounded-full blur-3xl opacity-20 animate-float-fast"></div>
      </div>

      {/* Floating Particles - Disesuaikan ke Pink/Red */}
      {isClient && (
        <div className="fixed inset-0 -z-10 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-pink-400/50 rounded-full shadow-lg animate-float"
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

      <div className="container mx-auto px-4 max-w-7xl">
        <Navbar />
        {/* Asumsi Hero Component juga perlu disesuaikan warnanya ke tema Valentine */}
        <Hero />
        
        {/* Messages Grid - Valentine Theme */}
        <section className="my-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-red-400" />
              <h2 className="font-cinzel text-4xl font-bold text-gray-950 tracking-tight">
                Valentine's Love Notes
              </h2>
            </div>
            
            {/* Sorting Options - Disesuaikan ke Pink/Red */}
            <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-full p-1.5 border border-pink-100 shadow-inner">
              {[
                { value: 'newest' as SortOption, label: 'Newest' },
                { value: 'popular' as SortOption, label: 'Popular' },
                { value: 'oldest' as SortOption, label: 'Oldest' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    sortBy === option.value
                      ? 'bg-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-red-600 hover:bg-pink-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              <p className="mt-4 text-gray-600 font-medium">Opening love letters...</p>
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-pink-100">
              <MailOpen className="w-16 h-16 text-pink-300 mx-auto mb-6" />
              <p className="text-2xl text-gray-700 font-semibold mb-2">
                No love notes yet.
              </p>
              <p className="text-gray-500 mb-8">
                Be the first to share your heart...
              </p>
              <a href="/write" className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
                Write a Note
              </a>
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

        {/* Footer - Valentine Theme */}
        <footer className="text-center py-16 mt-20 border-t border-pink-100 relative">
          <Sparkles className="w-10 h-10 text-red-300 mx-auto mb-4 opacity-50" />
          <p className="text-gray-900 font-bold text-lg">
            Valentine's Secret Box
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Spreading love and hidden messages freely
          </p>
          <p className="text-xs text-gray-400 mt-6">
            &copy; 2025 Aether Inc.
          </p>
        </footer>
      </div>
    </div>
  )
}