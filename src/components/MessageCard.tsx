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
  isProcessing?: boolean  // Pastikan ini ada di interface
}

export default function MessageCard({ 
  message, 
  currentSessionId, 
  onLike, 
  onDelete, 
  isLiked,
  isProcessing = false  // Terima prop isProcessing dan beri default value
}: MessageCardProps) {
  const isOwner = message.session_id === currentSessionId
  const [showSpotifyPlayer, setShowSpotifyPlayer] = useState(false)
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    
    return date.toLocaleDateString()
  }

  const handleDeleteClick = () => {
    onDelete(message.id)
  }

  const timeAgo = formatDate(message.created_at)
  const hasSpotify = message.spotify_data

  return (
    <div className="group cursor-pointer">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:bg-white hover:shadow-2xl hover:border-[var(--accent-blue)]/30 hover:scale-[1.02] transition-all duration-200 relative">
        
        {/* Top accent line */}
        <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl ${
          message.likes >= 5 
            ? 'bg-gradient-to-r from-yellow-400 to-orange-400' 
            : 'bg-gradient-to-r from-[var(--primary-blue)] via-[var(--accent-blue)] to-[var(--primary-blue)]'
        } opacity-70`}></div>
        
        {/* Popular badge */}
        {message.likes >= 3 && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold">
            🔥 {message.likes} likes
          </div>
        )}
        
        <div className="absolute top-4 right-4 text-[var(--accent-blue)] opacity-70">
          {hasSpotify ? <Music className="w-5 h-5" /> : '✦'}
        </div>
      
        {/* Badge */}
        {message.to_name && (
          <div className="bg-gradient-to-r from-[var(--light-blue)] to-[#d4e7ff] rounded-xl px-3 py-1 inline-block mb-4 text-sm font-semibold font-cinzel border border-[#8bc5e8]/30 shadow-sm">
            To: {message.to_name}
          </div>
        )}
      
        {/* Message Content */}
        <div className="text-xl italic text-center my-6 text-[var(--text-dark)] leading-relaxed relative px-2">
          <span className="absolute -top-3 -left-2 text-3xl text-[var(--accent-blue)] opacity-30">&ldquo;</span>
          {message.message}
          <span className="absolute -bottom-4 -right-2 text-3xl text-[var(--accent-blue)] opacity-30">&rdquo;</span>
        </div>

        {/* Spotify Section */}
        {hasSpotify && message.spotify_data && (
          <div className="my-4">
            {/* Song Info */}
            <div 
              className="flex items-center justify-between p-3 bg-gradient-to-r from-[var(--light-blue)]/30 to-blue-50/30 rounded-xl border border-[var(--accent-blue)]/20 cursor-pointer hover:bg-[var(--light-blue)]/50 transition-colors"
              onClick={() => setShowSpotifyPlayer(!showSpotifyPlayer)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--primary-blue)] rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[var(--text-dark)]">
                    {message.spotify_data.track_name}
                  </div>
                  <div className="text-xs text-[var(--text-light)]">
                    {message.spotify_data.artist_name}
                  </div>
                </div>
              </div>
              <div className="text-xs text-[var(--accent-blue)] font-medium">
                {showSpotifyPlayer ? 'Hide' : 'Play'} 🎵
              </div>
            </div>

            {/* Spotify Embed Player */}
            {showSpotifyPlayer && (
              <div className="mt-3 animate-fadeIn">
                <iframe
                  src={`https://open.spotify.com/embed/track/${message.spotify_data.track_id}`}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="encrypted-media"
                  className="rounded-lg shadow-sm"
                />
                {message.spotify_data.is_auto_refren && (
                  <div className="text-xs text-[var(--accent-blue)] text-center mt-2">
                    ✨ Auto-refren section
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      
        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-dashed border-[#8bc5e8]/30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onLike(message.id)}
              disabled={isProcessing}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                isLiked
                  ? 'bg-red-100 text-red-600 border border-red-200 hover:bg-red-200'
                  : 'bg-[#e8f4ff]/50 hover:bg-[#e8f4ff] hover:shadow-sm text-red-400'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              )}
              <span className={`text-sm font-medium ${isLiked ? 'text-red-600' : ''}`}>
                {message.likes}
              </span>
            </button>
            
            {isOwner && (
              <button
                onClick={handleDeleteClick}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all duration-300"
                title="Delete message"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm text-[var(--text-light)] bg-[#e8f4ff]/50 px-3 py-1 rounded-lg">
              From: {message.from_name || 'Anonymous'}
            </div>
            <div className="text-xs text-[var(--text-light)] mt-1">{timeAgo}</div>
          </div>
        </div>
      </div>
    </div>
  )
}