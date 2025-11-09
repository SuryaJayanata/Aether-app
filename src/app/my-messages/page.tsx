'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import MessageCard from '@/components/MessageCard'
import { supabase } from '@/lib/supabaseClient'

interface Message {
  id: string
  message: string
  from_name?: string
  to_name?: string
  spotify_track_id?: string
  likes: number
  session_id: string
  created_at: string
}

export default function MyMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get session ID
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

    const fetchMyMessages = async () => {
      try {
        const sessionId = getSessionId()
        
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', sessionId) // Hanya ambil messages dari session ini
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching my messages:', error)
        } else {
          setMessages(data || [])
        }
      } catch (error) {
        console.error('Error in fetchMyMessages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMyMessages()

    // Subscribe to real-time updates hanya untuk messages user ini
    const subscription = supabase
      .channel('my-messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          fetchMyMessages()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [sessionId])

  const handleLike = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return

    const { error } = await supabase
      .from('messages')
      .update({ likes: message.likes + 1 })
      .eq('id', messageId)

    if (!error) {
      setMessages(messages.map(m => 
        m.id === messageId ? { ...m, likes: m.likes + 1 } : m
      ))
    }
  }

  const handleDelete = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (!error) {
      setMessages(messages.filter(m => m.id !== messageId))
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6ba8d1]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#a8d8f0]/8 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <Navbar />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-16"
        >
          <h1 className="font-cinzel text-4xl font-bold text-center mb-8 text-[var(--text-dark)]">
            My Messages
          </h1>
          <p className="text-xl text-center text-[var(--text-light)] mb-12">
            Messages you've sent to the Aether
          </p>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)]"></div>
              <p className="mt-4 text-[var(--text-light)]">Loading your messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-[var(--text-light)] italic mb-4">
                You haven't sent any messages yet.
              </p>
              <a 
                href="/write" 
                className="inline-block bg-gradient-to-r from-[var(--primary-blue)] to-[var(--secondary-blue)] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Send Your First Message
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {messages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  currentSessionId={sessionId}
                  isLiked={false}
                  onLike={handleLike}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </motion.div>

        <footer className="text-center py-12 mt-20 border-t border-[#6ba8d1]/10 relative">
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--primary-blue)] to-transparent opacity-30"></div>
          <p className="text-[var(--text-light)]">
            Aether &copy; 2025 - Where Secret Words Find Their Voice
          </p>
        </footer>
      </div>
    </div>
  )
}