'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

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

export default function Sidebar({ onTagSelect, selectedTag }) {
  const [user, setUser] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
    }
    getUser()
  }, [])

  const handleUploadClick = (e) => {
    if (!user) {
      e.preventDefault()
      window.location.href = '/sign-in'
    }
  }

  return (
    <div className="w-64 min-w-[16rem] bg-[#212121] h-screen p-4 flex flex-col">
      {/* Main Navigation */}
      <div className="mb-8">
        <button
          onClick={() => onTagSelect(null)}
          className="w-full flex items-center space-x-2 text-white mb-4 hover:bg-[#2f2f2f] p-2 rounded"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Home</span>
        </button>

        {user && (
          <Link href="/profile" className="flex items-center space-x-2 text-white mb-4 hover:bg-[#2f2f2f] p-2 rounded">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Profile</span>
          </Link>
        )}

        <Link
          href={user ? "/upload" : "/sign-in"}
          onClick={handleUploadClick}
          className="flex items-center space-x-2 text-white hover:bg-[#2f2f2f] p-2 rounded"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Upload</span>
        </Link>

        {!user && (
          <Link href="/sign-in" className="flex items-center space-x-2 text-white mt-4 hover:bg-[#2f2f2f] p-2 rounded">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Sign In</span>
          </Link>
        )}
        {user && (
          <Link href="/recommended" className="flex items-center space-x-2 text-white mt-4 hover:bg-[#2f2f2f] p-2 rounded">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              />
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
            </svg>
            <span>Recommended</span>
          </Link>
        )}
      </div>

      {/* Tags Section */}
      <div>
        <h3 className="text-gray-400 font-medium mb-2 px-2">Tags</h3>
        <div className="space-y-1">
          {AVAILABLE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => onTagSelect(tag)}
              className={`w-full text-left p-2 rounded transition-colors ${selectedTag === tag
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:bg-[#2f2f2f]'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
