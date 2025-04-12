"use client";

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const AVAILABLE_TAGS = [
  'Gaming',
  'Music',
  'Education',
  'Sports',
  'Technology',
  'Entertainment',
  'News',
  'Cooking',
  'Travel',
  'Fitness'
]

function generateSlug(title) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
  
  return `${baseSlug}-${Date.now()}`
}

export default function UploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag)
      } else {
        // Limit to 3 tags maximum
        if (prev.length >= 3) {
          return prev
        }
        return [...prev, tag]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setError(null)

    try {
      if (!videoFile) {
        throw new Error('Please select a video file')
      }
      if (!thumbnailFile) {
        throw new Error('Please select a thumbnail image')
      }
      if (selectedTags.length === 0) {
        throw new Error('Please select at least one tag')
      }

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      // Get user's name from users table
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('user_name, user_avatar')
        .eq('user_id', user.id)
        .single()

      if (userDataError) throw userDataError

      

      // Generate unique filenames with timestamp
      const timestamp = Date.now()
      const videoFileName = `${timestamp}-${videoFile.name}`
      const thumbnailFileName = `thumbnails/${timestamp}-${thumbnailFile.name}`
      
      // Upload video file to the videos bucket
      const { data: videoData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoFile)

      if (uploadError) throw uploadError

      // Upload thumbnail to the thumbnails folder in videos bucket
      const { data: thumbnailData, error: thumbnailError } = await supabase.storage
        .from('videos')
        .upload(thumbnailFileName, thumbnailFile)

      if (thumbnailError) throw thumbnailError

      // Get the public URLs
      const videoUrl = supabase.storage
        .from('videos')
        .getPublicUrl(videoFileName).data.publicUrl

      const thumbnailUrl = supabase.storage
        .from('videos')
        .getPublicUrl(thumbnailFileName).data.publicUrl

      // Generate a unique slug from the title
      const slug = generateSlug(title)

      // Insert video details into the videos table
      const { error: insertError } = await supabase
        .from('videos')
        .insert({
          video_name: title,
          uploader_avatar:userData.user_avatar,
          video_descb: description,
          uploader_id: user.id,
          user_name: userData.user_name,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          slug: slug,
          tags: selectedTags,
          created_at: new Date().toISOString()
        })

      if (insertError) throw insertError

      // Redirect to the videos page after successful upload
      router.push('/protected')
    } catch (err) {
      setError(err.message)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }

    
  }

  return (
    <div className="min-h-screen bg-[#2b2b2b]">
      <div className="container mx-auto p-4 max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-white">Upload Video</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-1">
              Video Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-[#212121] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-[#212121] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Tags (Select up to 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${selectedTags.includes(tag)
                      ? 'bg-[#d57a43] text-white'
                      : 'bg-[#212121] text-gray-300 hover:bg-[#2f2f2f]'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-400">
              Selected: {selectedTags.length}/3
            </div>
          </div>

          <div>
            <label htmlFor="video" className="block text-sm font-medium text-gray-200 mb-1">
              Video File
            </label>
            <div className="relative">
              <input
                type="file"
                id="video"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="w-full p-2 bg-[#212121] border border-gray-600 rounded-lg text-white flex items-center">
                <span className="inline-flex px-4 py-2 rounded-full bg-[#d57a43] hover:bg-[#c16736] text-white text-sm font-semibold transition-colors">
                  Choose Video
                </span>
                <span className="ml-3 text-gray-400">
                  {videoFile ? videoFile.name : 'No file selected'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-200 mb-1">
              Thumbnail Image
            </label>
            <div className="relative">
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="w-full p-2 bg-[#212121] border border-gray-600 rounded-lg text-white flex items-center">
                <span className="inline-flex px-4 py-2 rounded-full bg-[#d57a43] hover:bg-[#c16736] text-white text-sm font-semibold transition-colors">
                  Choose Image
                </span>
                <span className="ml-3 text-gray-400">
                  {thumbnailFile ? thumbnailFile.name : 'No file selected'}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full px-4 py-2 bg-[#d57a43] text-white rounded-lg hover:bg-[#c16736] transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  )
}
