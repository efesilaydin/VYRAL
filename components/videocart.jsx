"use client";

import * as React from "react";
import Link from "next/link";

export default function Videocart({ video }) {
  return (
    <div className="group cursor-pointer">
      <Link href={`/videos/${video.slug}`} className="block">
        {/* Thumbnail Container */}
        <div className="relative mb-3 rounded-xl overflow-hidden">
          {/* Thumbnail with 16:9 aspect ratio */}
          <div className="relative pt-[56.25%]">
            <img
              src={video.thumbnail || "/placeholder-image.jpg"}
              alt={video.video_name}
              className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 border border-gray-600 rounded-lg"
            />
          </div>
        </div>

        {/* Video Info Container */}
        <div className="flex gap-3">
          {/* Channel Avatar */}
          <div className="flex-shrink-0">
            <img 
              src={video.uploader_avatar || "/default-avatar.png"}
              alt={`${video.user_name}'s avatar`}
              className="w-9 h-9 rounded-full object-cover"
            />
          </div>

          {/* Title and Meta Info */}
          <div className="flex-1 overflow-hidden">
            {/* Video Title - Max 2 lines */}
            <h3 className="text-base font-medium mb-1 overflow-hidden text-ellipsis line-clamp-2 text-white">
              {video.name || 'Untitled'}
            </h3>

            {/* Meta Information */}
            <div className="text-sm text-gray-500 space-y-1">
              {/* Uploader Name */}
              <div className="truncate">
                {video.user_name || 'Unknown Creator'}
              </div>
              
              {/* Video Stats */}
              <div className="flex items-center space-x-2">
                <span>
                  {new Date(video.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <span>•</span>
                <span>{video.view_count || 0} views</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
