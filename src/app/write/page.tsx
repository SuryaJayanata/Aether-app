'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabaseClient'
import { Search, X, Music, Heart, Send } from 'lucide-react'

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

      const toName = formData.to_name.trim() || 'Someone :3'

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
    <div className="min-h-screen relative overflow-hidden bg-rose-50/50">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-pink-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-red-100 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <Navbar />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-12 md:my-20"
        >
          <div className="text-center mb-12">
            <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-[var(--text-dark)] tracking-tight">
              Create a Note
            </h1>
            <p className="text-gray-600 mt-3 text-lg">Send your heartfelt message with a song to the Aether.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-8">
            
            {/* Left Column: Message Content */}
            <div className="md:col-span-3 space-y-6">
              <div className="bg-white/40 backdrop-blur-lg p-8 rounded-3xl border border-rose-100 shadow-xl shadow-rose-500/10">
                <label className="block text-xl font-semibold mb-4 text-[var(--text-dark)]">
                  Your Message
                </label>
                <textarea
                  required
                  maxLength={200}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full h-48 p-5 border border-rose-200 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-pink-200 transition-all text-gray-700 resize-none"
                  placeholder="Share your feelings, confessions, or romantic quotes..."
                />
                <div className="text-right text-sm text-gray-500 mt-2 font-medium">
                  {formData.message.length}/200
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/40 backdrop-blur-lg p-6 rounded-3xl border border-rose-100 shadow-lg shadow-rose-500/5">
                  <label className="block font-semibold mb-2 text-[var(--text-dark)]">From</label>
                  <input
                    type="text"
                    value={formData.from_name}
                    onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                    className="w-full p-4 border border-rose-100 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                    placeholder="Your Name"
                  />
                  <div className="flex items-center mt-3">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                      className="w-4 h-4 accent-red-500"
                    />
                    <label htmlFor="anonymous" className="ml-2 text-sm text-gray-600">
                      Send Anonymously
                    </label>
                  </div>
                </div>

                <div className="bg-white/40 backdrop-blur-lg p-6 rounded-3xl border border-rose-100 shadow-lg shadow-rose-500/5">
                  <label className="block font-semibold mb-2 text-[var(--text-dark)]">To</label>
                  <input
                    type="text"
                    value={formData.to_name}
                    onChange={(e) => setFormData({ ...formData, to_name: e.target.value })}
                    className="w-full p-4 border border-rose-100 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                    placeholder="Their Name"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Song Selection */}
            <div className="md:col-span-2">
              <div className="bg-white/40 backdrop-blur-lg p-8 rounded-3xl border border-rose-100 shadow-xl shadow-rose-500/10 sticky top-8">
                <label className="block text-xl font-semibold mb-4 text-[var(--text-dark)] flex items-center gap-2">
                  <Music className="w-5 h-5 text-red-500" />
                  Add a Song
                </label>
                
                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setTimeout(() => searchTracks(e.target.value), 300)
                    }}
                    placeholder="Search song or artist..."
                    className="w-full pl-12 pr-10 p-4 border border-rose-200 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-pink-200 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setSearchResults([])
                        setSelectedTrack(null)
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Results & Selection Area */}
                <div className="min-h-[250px]">
                  {isSearching && (
                    <div className="text-center py-10">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    </div>
                  )}

                  {!isSearching && searchResults.length > 0 && !selectedTrack && (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {searchResults.map((track) => (
                        <div
                          key={track.id}
                          onClick={() => handleTrackSelect(track)}
                          className="flex items-center p-3 border border-rose-100 rounded-2xl bg-white/60 cursor-pointer hover:bg-white hover:border-pink-200 transition-all group"
                        >
                          <img
                            src={track.album.images[2]?.url || track.album.images[0]?.url}
                            alt={track.name}
                            className="w-14 h-14 rounded-xl mr-4"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 truncate group-hover:text-red-600">
                              {track.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {track.artists.map(a => a.name).join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected Track Display */}
                  {selectedTrack && (
                    <div className="p-5 border border-pink-200 rounded-2xl bg-rose-50/50 backdrop-blur-sm">
                      <div className="flex items-center space-x-4">
                        <img
                          src={selectedTrack.album.images[1]?.url || selectedTrack.album.images[0]?.url}
                          alt={selectedTrack.name}
                          className="w-20 h-20 rounded-xl shadow-md"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-lg leading-tight">
                            {selectedTrack.name}
                          </div>
                          <div className="text-sm text-pink-700 font-medium">
                            {selectedTrack.artists.map(a => a.name).join(', ')}
                          </div>
                          <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-red-300" /> Attached to note
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isSearching && searchResults.length === 0 && !selectedTrack && (
                    <div className="text-center py-10 text-gray-500 border-2 border-dashed border-rose-100 rounded-2xl">
                      <Music className="w-10 h-10 mx-auto text-pink-300 mb-3" />
                      <p>Search and select a song</p>
                      <p className="text-sm">to make it more personal.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button - Elevated */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isSubmitting || !formData.message.trim()}
                className="w-full mt-8 bg-gradient-to-r from-red-500 to-pink-500 text-white py-5 rounded-full font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-red-500/30 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Your Note
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}