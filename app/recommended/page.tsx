'use client'

import { createClient } from '../../utils/supabase/client'
import { useState, useEffect } from 'react'
import Videocart from '../../components/videocart'


interface Video {
  video_name: string
  video_url: string
  video_descb?: string
  thumbnail_url?: string
  slug: string
  uploader_id: string
  created_at: string
  view_count: number
  user_name: string
  uploader_avatar?: string
  tags: string[]
}

interface User {
  user_id: string
  user_name: string
  recommendeds: string[]  // User's recommended tags
  user_avatar?: string
}

export default function RecommendedVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRecommendedVideos() {
      try {
        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        if (!currentUser) {
          throw new Error('No authenticated user found')
        }

        // Get user's interests (recommended tags) from users table
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('recommendeds')
          .eq('user_id', currentUser.id)
          .single()

        if (userDataError) throw userDataError

        if (!userData?.recommendeds || userData.recommendeds.length === 0) {
          setVideos([])  // No interests found
          return
        }

        // Fetch all videos that might match user's recommended tags
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .order('view_count', { ascending: true })  // Sorting by view_count from low to high

        if (videosError) throw videosError

        // Filter videos that have matching tags with user's recommended tags
        const filteredVideos = videosData?.filter((video) =>
          video.tags?.some((tag: string) => userData.recommendeds.includes(tag))  // Match tags with recommended tags
        ) || []

        setVideos(filteredVideos)

      } catch (err: any) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendedVideos()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center">
        <div className="text-white">Loading recommended videos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#2b2b2b] p-8">
      
      <div className="max-w-[2000px] mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Recommended Videos</h1>
        
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {videos.map((video) => (
              <Videocart
                key={video.slug}
                video={{
                  name: video.video_name,
                  url: video.video_url,
                  thumbnail: video.thumbnail_url,
                  slug: video.slug,
                  uploader_id: video.uploader_id,
                  date: video.created_at,
                  user_name: video.user_name,
                  uploader_avatar: video.uploader_avatar,
                  view_count: video.view_count
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#212121] rounded-lg">
            <h2 className="text-2xl text-gray-400">No recommended videos found</h2>
            <p className="text-gray-500 mt-2">Try updating your interests in your profile settings</p>
          </div>
        )}
      </div>
    </div>
  )
}
