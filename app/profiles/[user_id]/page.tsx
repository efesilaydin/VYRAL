'use client'

import { createClient } from '../../../utils/supabase/client'
import { useState, useEffect, use } from 'react'
import Videocart from '../../../components/videocart'

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

interface User {
  user_id: string
  user_name: string
  user_bio: string
  subscribers: number
  total_likes: number
  subscriber_id: string[]
  user_avatar?: string
}

export default function UserProfilePage({ params }: { params: Promise<{ user_id: string }> }) {
  const { user_id } = use(params)
  const [profileData, setProfileData] = useState<User | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const supabase = createClient()

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        // Get user profile data
        const { data: userData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', user_id)
          .single()

        if (profileError) throw profileError
        setProfileData(userData)

        // Check if current user is subscribed
        if (currentUser && userData.subscriber_id) {
          setIsSubscribed(userData.subscriber_id.includes(currentUser.id))
        }

        // Fetch user's videos
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .eq('uploader_id', user_id)
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

    fetchData()
  }, [user_id, currentUser])

  const handleSubscribe = async () => {
    if (!currentUser) {
      window.location.href = '/sign-in'
      return
    }

    if (currentUser.id === user_id) {
      return // Can't subscribe to own profile
    }

    setIsSubscribing(true)

    try {
      const newSubscriberIds = isSubscribed 
        ? (profileData?.subscriber_id || []).filter(id => id !== currentUser.id)
        : [...(profileData?.subscriber_id || []), currentUser.id]

      const newSubscriberCount = isSubscribed
        ? (profileData?.subscribers || 0) - 1
        : (profileData?.subscribers || 0) + 1

      const { error } = await supabase
        .from('users')
        .update({
          subscriber_id: newSubscriberIds,
          subscribers: newSubscriberCount
        })
        .eq('user_id', user_id)

      if (error) throw error

      // Update local state
      setProfileData(prev => prev ? {
        ...prev,
        subscriber_id: newSubscriberIds,
        subscribers: newSubscriberCount
      } : null)
      setIsSubscribed(!isSubscribed)

    } catch (err) {
      console.error('Error updating subscription:', err)
    } finally {
      setIsSubscribing(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center text-white">Loading...</div>
  if (error) return <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center text-red-500">{error}</div>
  if (!profileData) return <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center text-white">User not found</div>

  return (
    <div className="min-h-screen bg-[#2b2b2b] text-white">
      <div className="w-full">
        {/* Profile Section */}
        <div className="bg-[#212121] p-8">
          <div className="max-w-[2000px] mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 mb-8">
              <div className="flex-1">
                {/* Avatar and Name Section */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700">
                    {profileData?.user_avatar ? (
                      <img
                        src={profileData.user_avatar}
                        alt={`${profileData.user_name}'s Avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{profileData.user_name}'s Profile</h1>
                    {currentUser && currentUser.id !== user_id && (
                      <button
                        onClick={handleSubscribe}
                        disabled={isSubscribing}
                        className={`mt-2 px-6 py-2 rounded-lg transition-colors ${
                          isSubscribed
                            ? 'bg-gray-600 hover:bg-gray-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isSubscribing
                          ? 'Processing...'
                          : isSubscribed
                          ? 'Unsubscribe'
                          : 'Subscribe'}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-300 text-lg">{profileData.user_bio || 'No bio yet'}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-12 md:justify-end">
                <div className="text-center">
                  <div className="text-3xl font-bold">{profileData.subscribers || 0}</div>
                  <div className="text-gray-400">Subscribers</div>
                </div>
                <div className="text-center">
                  {/* <div className="text-3xl font-bold">{profileData.total_likes || 0}</div>
                  <div className="text-gray-400">Total Likes</div> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="p-8 w-screen">
          <div className="max-w-[2000px] mx-auto">
            <h2 className="text-3xl font-bold mb-8">Videos</h2>
            
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
                      user_name: profileData.user_name,
                      uploader_avatar: profileData.user_avatar,
                      view_count: video.view_count
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#212121] rounded-lg w-screen">
                <h2 className="text-2xl text-gray-400">No videos uploaded yet</h2>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 