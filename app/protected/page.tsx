'use client'

import { createClient } from '../../utils/supabase/client'
import { useState, useEffect } from 'react'
import Videocart from '../../components/videocart'
import Sidebar from '../../components/side-bar'

interface Video {
  video_name: string
  video_url: string
  video_descb?: string
  thumbnail_url?: string
  slug: string
  uploader_id: string
  created_at: string
  likes: number
  dislikes: number
  liker_id: string[]
  disliker_id: string[]
  view_count: number
  user_name: string
  uploader_avatar?: string
  tags?: string[]
}

export default function ProtectedPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function initializeData() {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (currentUser) {
          // Check if user exists in users table
          const { data: existingUser, error: userCheckError } = await supabase
            .from('users')
            .select('user_id')
            .eq('user_id', currentUser.id)
            .single()

          if (userCheckError && userCheckError.code === 'PGRST116') {
            // User doesn't exist, create new user record
            const { error: createError } = await supabase
              .from('users')
              .insert({
                user_id: currentUser.id,
                user_name: currentUser.user_metadata?.user_name || 'New User',
                user_bio: '',
                subscribers: 0,
                total_likes: 0
              })

            if (createError) throw createError
          } else if (userCheckError) {
            throw userCheckError
          }
        }

        // Fetch videos
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false })

        if (videosError) throw videosError
        setVideos(videosData || [])
      } catch (err: any) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [])

  // Filter videos based on search term and selected tag
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.video_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = selectedTag ? video.tags?.includes(selectedTag) : true
    return matchesSearch && matchesTag
  })

  // Transform the filtered videos
  const transformedVideos = filteredVideos.map(video => ({
    name: video.video_name || 'Untitled',
    url: video.video_url,
    thumbnail: video.thumbnail_url || '/placeholder-image.jpg',
    slug: video.slug,
    uploader_id: video.uploader_id,
    date: video.created_at,
    user_name: video.user_name,
    uploader_avatar: video.uploader_avatar,
    view_count: video.view_count || 0,
    likes: video.likes || 0,
    dislikes: video.dislikes || 0,
    liker_id: video.liker_id || [],
    disliker_id: video.disliker_id || [],
    tags: video.tags || []
  })) 

  if (loading) return <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center text-white">Loading...</div>
  if (error) return <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center text-red-500">{error}</div>

  return (
    <div className="flex min-h-screen bg-[#2b2b2b] w-full">
      <div className="fixed left-0 top-0 h-full">
        <Sidebar onTagSelect={setSelectedTag} selectedTag={selectedTag} />
      </div>
      <main className="flex-1 ml-64">
        <div className="p-4 w-full">
          <div className="flex flex-col gap-6">
            {/* Search Section */}
            <div className="max-w-2xl mx-auto w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full p-4 pl-12 bg-[#212121] text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>

            {/* Title Section */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">
                {selectedTag ? `${selectedTag} Videos` : 'All Videos'}
              </h1>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* Videos Grid */}
            {transformedVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {transformedVideos.map((video) => (
                  <Videocart key={video.slug} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                {searchTerm || selectedTag ? 'No videos found matching your criteria' : 'No videos available'}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
