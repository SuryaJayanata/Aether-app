'use client'

import { useState } from 'react'
import { Heart, Trash2, Music } from 'lucide-react'

interface SpotifyData {
  track_id: string
  track_name: string
  artist_name: string
  start_time: number
  end_time: number
  preview_url: string
  is_auto_refren: boolean
}

interface Message {
  id: string
  message: string
  from_name?: string
  to_name?: string
  spotify_track_id?: string
  spotify_data?: SpotifyData
  likes: number
  session_id: string
  created_at: string
}

interface MessageCardProps {
  message: Message
  currentSessionId: string
  onLike: (messageId: string) => void
  onDelete: (messageId: string) => void
  isLiked: boolean
  isProcessing?: boolean 
}

export default function MessageCard({ 
  message, 
  currentSessionId, 
  onLike, 
  onDelete, 
  isLiked,
  isProcessing = false 
}: MessageCardProps) {
  const isOwner = message.session_id === currentSessionId
  const [showSpotifyPlayer, setShowSpotifyPlayer] = useState(false)
  
  // --- FUNGSI formatDate YANG SUDAH DIPERBARUI ---
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  // ------------------------------------------------

  const handleDeleteClick = () => {
    onDelete(message.id)
  }

  const timeAgo = formatDate(message.created_at)
  const hasSpotify = message.spotify_data

  return (
    <div className="group cursor-pointer">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-pink-100 shadow-lg hover:bg-white hover:shadow-2xl hover:shadow-pink-100 hover:border-pink-200 hover:scale-[1.02] transition-all duration-300 relative">
        

        

        
        <div className="absolute top-4 right-4 text-[var(--accent-pink)] opacity-60">
          {hasSpotify ? <Music className="w-5 h-5" /> : '♥'}
        </div>
      
        {message.to_name && (
          <div className="bg-gradient-to-r from-[var(--light-pink)] to-pink-50 rounded-full px-4 py-1.5 inline-block mb-4 text-sm font-semibold text-pink-900 border border-pink-100 shadow-sm">
            To: {message.to_name}
          </div>
        )}
      
        <div className="text-xl italic text-center my-6 text-[var(--text-dark)] leading-relaxed relative px-4">
          <span className="absolute -top-3 left-1 text-4xl text-pink-300 opacity-50 font-serif">“</span>
          {message.message}
          <span className="absolute -bottom-6 right-1 text-4xl text-pink-300 opacity-50 font-serif">”</span>
        </div>

        {hasSpotify && message.spotify_data && (
          <div className="my-5">
            <div 
              className="flex items-center justify-between p-3 bg-pink-50/50 rounded-2xl border border-pink-100 cursor-pointer hover:bg-pink-100/50 transition-colors"
              onClick={() => setShowSpotifyPlayer(!showSpotifyPlayer)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[var(--text-dark)]">
                    {message.spotify_data.track_name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {message.spotify_data.artist_name}
                  </div>
                </div>
              </div>
              <div className="text-xs text-pink-600 font-medium">
                {showSpotifyPlayer ? 'Hide' : 'Listen'} 🎧
              </div>
            </div>

            {showSpotifyPlayer && (
              <div className="mt-3 animate-fadeIn">
                <iframe
                  src={`https://open.spotify.com/embed/track/${message.spotify_data.track_id}?utm_source=generator`}
                  width="100%"
                  height="100"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  className="rounded-xl shadow-inner"
                />
              </div>
            )}
          </div>
        )}
      
        <div className="flex justify-between items-center pt-4 border-t border-dashed border-pink-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onLike(message.id)}
              disabled={isProcessing}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full transition-all duration-300 ${
                isLiked
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-pink-100 text-pink-600 hover:bg-pink-200 hover:shadow-sm'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
              )}
              <span className={`text-sm font-semibold`}>
                {message.likes}
              </span>
            </button>
            
            {isOwner && (
              <button
                onClick={handleDeleteClick}
                className="p-2.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-all duration-300"
                title="Delete message"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-pink-900 bg-pink-50 px-3 py-1 rounded-full">
              From: {message.from_name || 'Someone'}
            </div>
            {/* Tampilan waktu/tanggal di sini */}
            <div className="text-xs text-gray-500 mt-1">{timeAgo}</div>
          </div>
        </div>
      </div>
    </div>
  )
}