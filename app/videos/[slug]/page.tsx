'use client'

import { createClient } from '../../../utils/supabase/client'
import { useState, useEffect, use } from 'react'
import Videocart from '../../../components/videocart'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  user_name: string
}

interface Comment {
  id: number
  video_id: string
  commentor_id: string
  comment_text: string
  created_at: string
  user_name?: string
}

export default function VideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [video, setVideo] = useState<Video | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasDisliked, setHasDisliked] = useState(false)
  const [isDislikeProcessing, setIsDislikeProcessing] = useState(false)
  const [viewIncremented, setViewIncremented] = useState(false)

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    fetchCurrentUser()
  }, [])

  // Fetch video and uploader data
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        // Fetch video data
        const { data: videoData, error: videoError } = await supabase
          .from('videos')
          .select('*')
          .eq('slug', slug)
          .single()

        if (videoError) throw videoError
        setVideo(videoData)

        // Fetch uploader data if we have video
        if (videoData?.uploader_id) {
          const { data: uploaderData, error: userError } = await supabase
            .from('users')
            .select('user_name')
            .eq('user_id', videoData.uploader_id)
            .single()

          if (userError) throw userError
          setUserData(uploaderData)
        }
      } catch (err: any) {
        console.error('Error:', err)
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchVideoData()
  }, [slug])

  // Add new useEffect for fetching comments
  useEffect(() => {
    async function fetchComments() {
      if (!video) return

      try {
        // First fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('video_id', video.slug)
          .order('created_at', { ascending: false })

        if (commentsError) throw commentsError

        // Then fetch user data for each comment
        const commentPromises = commentsData.map(async (comment) => {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('user_name')
            .eq('user_id', comment.commentor_id)
            .single()

          if (userError) {
            console.error('Error fetching user data:', userError)
            return {
              ...comment,
              user_name: 'Unknown User'
            }
          }

          return {
            ...comment,
            user_name: userData.user_name
          }
        })

        const transformedComments = await Promise.all(commentPromises)
        setComments(transformedComments)
      } catch (err) {
        console.error('Error fetching comments:', err)
      }
    }

    fetchComments()
  }, [video])

  // Add check for user's like status
  useEffect(() => {
    if (currentUser && video?.liker_id) {
      setHasLiked(video.liker_id.includes(currentUser.id))
    }
  }, [currentUser, video])

  // Add check for user's dislike status
  useEffect(() => {
    if (currentUser && video?.disliker_id) {
      setHasDisliked(video.disliker_id.includes(currentUser.id))
    }
  }, [currentUser, video])

  // Add new useEffect for view count
  useEffect(() => {
    const incrementViewCount = async () => {
      if (video && !viewIncremented) {
        try {
          const { error } = await supabase
            .from('videos')
            .update({
              view_count: (video.view_count || 0) + 1
            })
            .eq('slug', slug)

          if (error) throw error

          // Update local state
          setVideo(prev => prev ? {
            ...prev,
            view_count: (prev.view_count || 0) + 1
          } : null)
          setViewIncremented(true)
        } catch (err) {
          console.error('Error incrementing view count:', err)
        }
      }
    }

    incrementViewCount()
  }, [video, viewIncremented, slug])

  const handleLike = async () => {
    if (!currentUser) {
      router.push('/sign-in')
      return
    }
    
    if (!video || isProcessing) return

    setIsProcessing(true)
    
    try {
      if (hasLiked) {
        // Remove like
        const { error } = await supabase
          .from('videos')
          .update({
            likes: (video.likes || 0) - 1,
            liker_id: (video.liker_id || []).filter(id => id !== currentUser.id)
          })
          .eq('slug', video.slug)

        if (error) throw error

        // Update local state
        setVideo(prev => prev ? {
          ...prev,
          likes: (prev.likes || 0) - 1,
          liker_id: (prev.liker_id || []).filter(id => id !== currentUser.id)
        } : null)
        setHasLiked(false)
      } else {
        // Add like
        const currentLikerIds = video.liker_id || []
        
        const { error } = await supabase
          .from('videos')
          .update({
            likes: (video.likes || 0) + 1,
            liker_id: [...currentLikerIds, currentUser.id]
          })
          .eq('slug', video.slug)

        if (error) throw error

        // Update local state
        setVideo(prev => prev ? {
          ...prev,
          likes: (prev.likes || 0) + 1,
          liker_id: [...(prev.liker_id || []), currentUser.id]
        } : null)
        setHasLiked(true)
      }
    } catch (err) {
      console.error('Error updating likes:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDislike = async () => {
    if (!currentUser) {
      router.push('/sign-in')
      return
    }

    if (!video || isDislikeProcessing) return

    setIsDislikeProcessing(true)

    try {
      if (hasDisliked) {
        // Remove dislike
        const { error } = await supabase
          .from('videos')
          .update({
            dislikes: (video.dislikes || 0) - 1,
            disliker_id: (video.disliker_id || []).filter(id => id !== currentUser.id)
          })
          .eq('slug', video.slug)

        if (error) throw error

        // Update local state
        setVideo(prev => prev ? {
          ...prev,
          dislikes: (prev.dislikes || 0) - 1,
          disliker_id: (prev.disliker_id || []).filter(id => id !== currentUser.id)
        } : null)
        setHasDisliked(false)
      } else {
        // Add dislike
        const currentDislikerIds = video.disliker_id || []
        
        const { error } = await supabase
          .from('videos')
          .update({
            dislikes: (video.dislikes || 0) + 1,
            disliker_id: [...currentDislikerIds, currentUser.id]
          })
          .eq('slug', video.slug)

        if (error) throw error

        // Update local state
        setVideo(prev => prev ? {
          ...prev,
          dislikes: (prev.dislikes || 0) + 1,
          disliker_id: [...(prev.disliker_id || []), currentUser.id]
        } : null)
        setHasDisliked(true)
      }
    } catch (err) {
      console.error('Error updating dislikes:', err)
    } finally {
      setIsDislikeProcessing(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser || !video || !commentText.trim()) return
    
    setIsSubmitting(true)
    
    try {
      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          video_id: video.slug,
          commentor_id: currentUser.id,
          comment_text: commentText.trim()
        })

      if (commentError) throw commentError

      // Fetch updated comments
      const { data: commentsData, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('video_id', video.slug)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Fetch user data for each comment
      const commentPromises = commentsData.map(async (comment) => {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_name')
          .eq('user_id', comment.commentor_id)
          .single()

        if (userError) {
          console.error('Error fetching user data:', userError)
          return {
            ...comment,
            user_name: 'Unknown User'
          }
        }

        return {
          ...comment,
          user_name: userData.user_name
        }
      })

      const transformedComments = await Promise.all(commentPromises)
      setComments(transformedComments)
      setCommentText('')
    } catch (err) {
      console.error('Error posting comment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center text-white">Loading...</div>
  if (error || !video) return <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center text-red-500">{error || 'Video not found'}</div>

  return (
    <div className="min-h-screen bg-[#2b2b2b] w-full">
      <div className="w-full max-w-[1600px] mx-auto">
        <h1 className="text-2xl font-bold p-4 text-white">{video.video_name || 'Untitled'}</h1>
        <div className="relative w-full max-w-[1600px] mx-auto" style={{ paddingTop: '42.5%' }}>
          <iframe
            src={video.video_url}
            className="absolute top-0 left-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
        
        {/* Video Info and Actions */}
        <div className="mt-6 bg-[#212121] rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <Link 
                href={`/profiles/${video.uploader_id}`}
                className="text-gray-300 text-lg hover:text-blue-500 transition-colors"
              >
                Uploaded by: {userData?.user_name || 'Unknown User'}
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <span>
                  {new Date(video.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span>•</span>
                <span>{video.view_count || 0} views</span>
              </div>
            </div>
            
            {/* Like/Dislike Buttons */}
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                disabled={isProcessing}
                className={`flex items-center gap-2 transition-colors ${
                  hasLiked 
                    ? 'text-blue-500' 
                    : 'text-gray-300 hover:text-blue-500'
                }`}
              >
                <svg className="w-7 h-7" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span className="text-lg">{video.likes || 0}</span>
              </button>
              <button
                onClick={handleDislike}
                disabled={isDislikeProcessing}
                className={`flex items-center gap-2 transition-colors ${
                  hasDisliked 
                    ? 'text-red-500' 
                    : 'text-gray-300 hover:text-red-500'
                }`}
              >
                <svg className="w-7 h-7" fill={hasDisliked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5 0v2a2 2 0 01-2 2h-2.5" />
                </svg>
                <span className="text-lg">{video.dislikes || 0}</span>
              </button>
            </div>
          </div>
          
          {/* Description */}
          {video.video_descb && (
            <div className="mt-6 text-gray-300">
              <h3 className="text-white font-medium text-lg mb-2">Description</h3>
              <p className="whitespace-pre-wrap">{video.video_descb}</p>
            </div>
          )}
        </div>
        
        {/* Comments Section */}
        <div className="mt-6 bg-[#212121] rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-6">Comments</h3>
          
          {/* Comment Form */}
          {currentUser ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex flex-col gap-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-3 bg-[#2b2b2b] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white resize-none"
                  rows={3}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 text-center py-4 bg-[#2b2b2b] rounded-lg">
              <Link href="/sign-in" className="text-blue-500 hover:text-blue-400">
                Sign in to comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-700 pb-6 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <Link 
                    href={`/profiles/${comment.commentor_id}`}
                    className="font-medium text-gray-300 hover:text-blue-500 transition-colors"
                  >
                    {comment.user_name}
                  </Link>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{comment.comment_text}</p>
              </div>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 