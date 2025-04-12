"use client";

import { createClient } from "../../utils/supabase/client";
import { useState, useEffect } from "react";
import Videocart from "../../components/videocart";
import { useRouter } from "next/navigation";

const AVAILABLE_TAGS = [
  "Gaming",
  "Music",
  "Education",
  "Sports",
  "Technology",
  "Entertainment",
  "News",
  "Cooking",
  "Travel",
  "Fitness",
];

interface Video {
  video_name: string;
  video_url: string;
  video_descb?: string;
  thumbnail_url?: string;
  slug: string;
  uploader_id: string;
  created_at: string;
  likes: number;
  dislikes: number;
  liker_id: string[];
  disliker_id: string[];
  view_count: number;
  user_name: string;
  uploader_avatar?: string;
  tags?: string[];
}

interface User {
  user_id: string;
  user_name: string;
  user_bio: string;
  subscribers: number;
  total_likes: number;
  subscriber_id: string[];
  user_avatar?: string;
  recommendeds?: string[];
}

export default function ProfilePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [userName, setUserName] = useState("");
  const [userBio, setUserBio] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        // Get current user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!currentUser) {
          router.push("/sign-in");
          return;
        }
        setUser(currentUser);

        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", currentUser.id)
          .single();

        if (profileError) throw profileError;
        setUserData(profileData);
        setUserName(profileData.user_name || "");
        setUserBio(profileData.user_bio || "");

        // Fetch user's videos
        const { data: videosData, error: videosError } = await supabase
          .from("videos")
          .select("*")
          .eq("uploader_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (videosError) throw videosError;
        setVideos(videosData || []);
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      if (!user || !userData) return;

      const { error: updateError } = await supabase
        .from("users")
        .update({
          user_name: userName,
          user_bio: userBio,
          recommendeds: selectedTags,
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setUserData((prev) =>
        prev
          ? {
              ...prev,
              user_name: userName,
              user_bio: userBio,
              recommendeds: selectedTags,
            }
          : null
      );
      setEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message);
    }
  };
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update user profile with avatar URL
      const { error: updateError } = await supabase
        .from("users")
        .update({ user_avatar: publicUrl })
        .eq("user_id", user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  if (!user || !userData) return null;

  return (
    <div className="min-h-screen bg-[#2b2b2b] text-white">
      <div className="w-full">
        {/* Profile Section */}
        <div className="bg-[#212121] p-8">
          <div className="max-w-[2000px] mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 mb-8">
              <div className="flex-1">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700">
                      {userData?.user_avatar ? (
                        <img
                          src={userData.user_avatar}
                          alt="Profile Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-12 h-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <svg
                          className="animate-spin h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </label>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">
                      {userData?.user_name}'s Profile
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                      Click the avatar to upload a new image
                    </p>
                  </div>
                </div>

                {/* Rest of profile content */}
                <div>
                  {editing ? (
                    <div className="space-y-6 max-w-2xl">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full p-3 bg-[#2b2b2b] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={userBio}
                          onChange={(e) => setUserBio(e.target.value)}
                          rows={4}
                          className="w-full p-3 bg-[#2b2b2b] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Interests
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_TAGS.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                selectedTags.includes(tag)
                                  ? "bg-blue-600 text-white"
                                  : "bg-[#2b2b2b] text-gray-300 hover:bg-[#3b3b3b]"
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleUpdateProfile}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
                      >
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-semibold mb-3">
                        {userData.user_name}
                      </h2>
                      <p className="text-gray-300 text-lg mb-4">
                        {userData.user_bio || "No bio yet"}
                      </p>

                      {userData.recommendeds &&
                        userData.recommendeds.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">
                              Interests
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {userData.recommendeds.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-3 py-1 bg-[#3b3b3b] text-gray-300 rounded-full text-sm"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:text-right">
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  {editing ? "Cancel" : "Edit Profile"}
                </button>

                {/* Stats */}
                <div className="flex gap-12 mt-8 md:justify-end">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {userData?.subscribers || 0}
                    </div>
                    <div className="text-gray-400">Subscribers</div>
                  </div>
                  <div className="text-center">
                    {/* <div className="text-3xl font-bold">{userData?.total_likes || 0}</div>
                    <div className="text-gray-400">Total Likes</div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="p-8 w-screen">
          <div className="max-w-[2000px] mx-auto">
            <h2 className="text-3xl font-bold mb-8">My Videos</h2>

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
                      user_name: userData.user_name,
                      uploader_avatar: userData.user_avatar,
                      view_count: video.view_count,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#212121] rounded-lg w-screen">
                <h2 className="text-2xl text-gray-400 mb-6">
                  No videos uploaded yet
                </h2>
                <button
                  onClick={() => router.push("/upload")}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  Upload Your First Video
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
