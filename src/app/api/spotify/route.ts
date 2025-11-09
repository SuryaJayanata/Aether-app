import { NextRequest, NextResponse } from 'next/server'

let accessToken: string | null = null
let tokenExpiry: number = 0

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Spotify auth failed: ${errorData.error_description || response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.access_token) {
      throw new Error('No access token received from Spotify')
    }

    accessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000

    return accessToken

  } catch (error) {
    console.error('Error getting Spotify access token:', error)
    throw error
  }
}

// Function untuk detect bagian reff/chorus otomatis
function findRefrenSection(track: any) {
  const duration = track.duration_ms
  
  // Strategy 1: Ambil bagian tengah lagu (biasanya chorus)
  const middleStart = Math.floor(duration * 0.3) // 30% dari awal
  const middleEnd = Math.floor(duration * 0.7)   // 70% dari awal
  
  // Strategy 2: Untuk lagu pendek (< 2 menit), ambil 15-45 detik
  if (duration < 120000) {
    return {
      startTime: 15000, // 15 detik
      endTime: 45000    // 45 detik
    }
  }
  
  // Strategy 3: Untuk lagu medium (2-4 menit), ambil 25%-65%
  if (duration < 240000) {
    return {
      startTime: Math.floor(duration * 0.25),
      endTime: Math.floor(duration * 0.65)
    }
  }
  
  // Strategy 4: Untuk lagu panjang (>4 menit), ambil 30%-50%
  return {
    startTime: middleStart,
    endTime: middleEnd
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.trim() === '') {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const token = await getAccessToken()

    // Search tracks
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5&market=ID`
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!searchResponse.ok) {
      throw new Error(`Spotify API error: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()

    // Format response dengan auto-refren detection
    const tracks = searchData.tracks?.items.map((track: any) => {
      const refrenSection = findRefrenSection(track)
      
      return {
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist: any) => ({
          name: artist.name,
          id: artist.id
        })),
        album: {
          name: track.album.name,
          images: track.album.images
        },
        preview_url: track.preview_url,
        duration_ms: track.duration_ms,
        refren_section: refrenSection
      }
    }) || []

    return NextResponse.json({ 
      success: true,
      tracks: tracks
    })

  } catch (error) {
    console.error('Spotify API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search tracks'
      },
      { status: 500 }
    )
  }
}