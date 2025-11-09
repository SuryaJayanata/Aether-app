'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabaseClient'
import { Search, X, Music } from 'lucide-react'

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  preview_url: string
  duration_ms: number
  refren_section: {
    startTime: number
    endTime: number
  }
}

export default function WritePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    message: '',
    from_name: '',
    to_name: '',
    isAnonymous: false,
  })
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null)
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const searchTracks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/spotify?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      setSearchResults(data.tracks || [])
    } catch (error) {
      console.error('Error searching tracks:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleTrackSelect = (track: SpotifyTrack) => {
    setSelectedTrack(track)
    setSearchResults([])
    setSearchQuery(`${track.name} - ${track.artists[0].name}`)
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.message.trim()) return

    setIsSubmitting(true)
    try {
      let sessionId = localStorage.getItem('aether_session_id')
      if (!sessionId) {
        sessionId = crypto.randomUUID()
        localStorage.setItem('aether_session_id', sessionId)
      }

      const toName = formData.to_name.trim() || 'Everyone'

      const spotifyData = selectedTrack ? {
        track_id: selectedTrack.id,
        track_name: selectedTrack.name,
        artist_name: selectedTrack.artists[0].name,
        start_time: selectedTrack.refren_section.startTime,
        end_time: selectedTrack.refren_section.endTime,
        preview_url: selectedTrack.preview_url,
        is_auto_refren: true
      } : null

      const { error } = await supabase
        .from('messages')
        .insert([{
          message: formData.message,
          from_name: formData.isAnonymous ? null : (formData.from_name || null),
          to_name: toName,
          spotify_track_id: selectedTrack?.id || null,
          spotify_data: spotifyData,
          session_id: sessionId,
          likes: 0,
        }])

      if (error) throw error

      router.push('/')
    } catch (error) {
      console.error('Error submitting message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#6ba8d1]/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <Navbar />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto my-16"
        >
          <h1 className="font-cinzel text-4xl font-bold text-center mb-8 text-[var(--text-dark)]">
            Send Your Message
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-[var(--text-dark)]">
                Your Message *
              </label>
              <textarea
                required
                maxLength={200}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full h-32 p-4 border border-[#8bc5e8]/30 rounded-2xl bg-white/50 backdrop-blur-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all"
                placeholder="Share your thoughts, confessions, or messages..."
              />
              <div className="text-right text-sm text-[var(--text-light)] mt-1">
                {formData.message.length}/200
              </div>
            </div>

            {/* From Name */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-[var(--text-dark)]">
                Your Name
              </label>
              <input
                type="text"
                value={formData.from_name}
                onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                className="w-full p-4 border border-[#8bc5e8]/30 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all"
                placeholder="How would you like to be known?"
              />
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="mr-2 w-4 h-4"
                />
                <label htmlFor="anonymous" className="text-sm text-[var(--text-light)]">
                  Post as Anonymous
                </label>
              </div>
            </div>

            {/* To Name */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-[var(--text-dark)]">
                To
              </label>
              <input
                type="text"
                value={formData.to_name}
                onChange={(e) => setFormData({ ...formData, to_name: e.target.value })}
                className="w-full p-4 border border-[#8bc5e8]/30 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all"
                placeholder="Leave empty to send to Everyone"
              />
            </div>

            {/* Spotify Search - SIMPLE VERSION */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-[var(--text-dark)]">
                Add a Song
              </label>
              
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-light)] w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setTimeout(() => searchTracks(e.target.value), 300)
                  }}
                  placeholder="Search for a song on Spotify..."
                  className="w-full pl-10 pr-10 p-4 border border-[#8bc5e8]/30 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-light)] hover:text-[var(--text-dark)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Search Results */}
              {isSearching && (
                <div className="mt-3 text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary-blue)]"></div>
                  <p className="text-sm text-[var(--text-light)] mt-2">Searching songs...</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => handleTrackSelect(track)}
                      className="flex items-center p-3 border border-[#8bc5e8]/20 rounded-xl bg-white/30 backdrop-blur-sm cursor-pointer hover:bg-white/50 transition-all group"
                    >
                      <img
                        src={track.album.images[2]?.url || track.album.images[0]?.url}
                        alt={track.name}
                        className="w-12 h-12 rounded-lg mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate group-hover:text-[var(--primary-blue)]">
                          {track.name}
                        </div>
                        <div className="text-xs text-[var(--text-light)] truncate">
                          {track.artists.map(a => a.name).join(', ')}
                        </div>
                        <div className="text-xs text-[var(--accent-blue)] mt-1">
                          
                        </div>
                      </div>
                      <Music className="w-4 h-4 text-[var(--accent-blue)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Track - SIMPLE DISPLAY */}
              {selectedTrack && (
                <div className="mt-4 p-4 border border-[#8bc5e8]/30 rounded-2xl bg-white/30 backdrop-blur-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedTrack.album.images[2]?.url || selectedTrack.album.images[0]?.url}
                        alt={selectedTrack.name}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div>
                        <div className="font-semibold text-[var(--text-dark)]">
                          {selectedTrack.name}
                        </div>
                        <div className="text-sm text-[var(--text-light)]">
                          {selectedTrack.artists.map(a => a.name).join(', ')}
                        </div>
                        <div className="text-xs text-[var(--accent-blue)] mt-1">
                          ✨ Ready to attach to your message
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTrack(null)
                        setSearchQuery('')
                      }}
                      className="text-red-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || !formData.message.trim()}
              className="w-full bg-gradient-to-r from-[var(--primary-blue)] to-[var(--secondary-blue)] text-white py-4 rounded-2xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Release Your Message to the Aether'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}