import { createClient } from '../../utils/supabase/client'
import Videocart from '../../components/videocart'

export default async function VideosPage() {
  const supabase = createClient()
  
  const { data: videos, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching videos:', error)
    return <div>Error loading videos</div>
  }

  // Transform the data to match Videocart props
  const transformedVideos = videos.map(video => ({
    name: video.video_name || 'Untitled',
    url: video.video_url,
    thumbnail: video.thumbnail_url || '/placeholder-image.jpg',
    slug: video.slug,
    uploader_id: video.uploader_id
  }))

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {transformedVideos.map((video) => (
          <Videocart key={video.slug} video={video} />
        ))}
      </div>
    </div>
  )
} 