'use client'

import { createClient } from '../utils/supabase/client'
import { useState, useEffect } from 'react'
import Videocart from '../components/videocart'
import Sidebar from '../components/side-bar'

export default function HomePage() {
  const [videos, setVideos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchVideos() {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setVideos(data || [])
      } catch (err) {
        console.error('Error fetching videos:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
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

  if (loading) return <div className="container mx-auto p-4 text-white">Loading...</div>
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>

  return (
    <div className="flex min-h-screen bg-[#2b2b2b]">
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
                {selectedTag ? `${selectedTag} Videos` : 'Discover Videos'}
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