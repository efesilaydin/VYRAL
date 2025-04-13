# Vyral

Vyral is a YouTube-like video-sharing platform designed to empower creators by providing an accessible, user-friendly interface for uploading, watching, filtering, and searching videos. The project aims to foster inclusivity by implementing an algorithm that supports small creators, prioritizing low-view videos in recommendations.

## Features

- **User Registration and Authentication**: Users can sign up, log in, and manage their accounts securely.
- **Video Uploads**: Users can upload videos with titles, descriptions, and tags.
- **Video Playback**: Seamless video playback with a responsive design.
- **Search and Filtering**: Advanced search and filtering options to help users find content easily.
- **Recommendation Algorithm**: Supports small creators by prioritizing videos with fewer views.

## Technologies Used

### Frontend
- **Next.js**: For server-side rendering and optimized performance.
- **React**: For building dynamic and interactive user interfaces.
- **HTML/CSS/JavaScript**: Core web technologies for the structure and interactivity of the platform.
- **Sass**: For managing styles with flexibility and scalability.
- **Tailwind CSS**: For rapid UI design and styling.

### Backend
- **Supabase**: Used as the backend database solution for managing user accounts, video uploads, and metadata.

## Why Vyral?

Vyral was created with the vision of supporting small creators who often struggle to gain visibility in competitive platforms. By prioritizing low-view videos, Vyral offers an inclusive ecosystem where all creators have a fair chance to reach an audience.

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd vyral
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up Supabase:
   - Create a Supabase project.
   - Configure the `.env` file with your Supabase credentials.

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Access the application at `http://localhost:3000`.

## Future Improvements

- Enhance the recommendation algorithm for better personalization.
- Add social features like comments, likes, and sharing.
- Implement monetization options for creators.
- Optimize video compression and streaming quality.

## Contribution

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

---

**Created by:** Deniz Görkem Ater,Acar Efe Sılaydın,Mustafa Ceyhun Şeker, Atilla Çelik
**Purpose:** Graduation Project
