import React, { useState, useEffect } from 'react';
import '../css/VideoGrid.css';

const VideoGrid = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Fetch videos from API (simulate fetching from backend or Azure Blob)
  useEffect(() => {
    // Simulate an API call to get video URLs
    const fetchVideos = async () => {
      const videoData = [
        {
          id: 1,
          title: 'Norway',
          thumbnail: 'https://via.placeholder.com/300x200.png?text=Video+1', // Replace with actual thumbnail URL
          url: 'https://sachatapp.blob.core.windows.net/containerchatapp/Norway.mp4?sp=r&st=2024-10-17T12:57:59Z&se=2024-11-17T20:57:59Z&sv=2022-11-02&sr=b&sig=jtNsSqWA0Rxs5c8ci6LUbO5kjJMdcHrNbzYejw4mvV0%3D',
          duration: '1:00:55'
        },
        {
          id: 2,
          title: 'Norway',
          thumbnail: 'https://via.placeholder.com/300x200.png?text=Video+2', // Replace with actual thumbnail URL
          url: 'https://sachatapp.blob.core.windows.net/containerchatapp/Norway.mp4?sp=r&st=2024-10-17T12:57:59Z&se=2024-11-17T20:57:59Z&sv=2022-11-02&sr=b&sig=jtNsSqWA0Rxs5c8ci6LUbO5kjJMdcHrNbzYejw4mvV0%3D',
          duration: '1:00:55'
        },
        {
          id: 3,
          title: 'Norway',
          thumbnail: 'https://via.placeholder.com/300x200.png?text=Video+3', // Replace with actual thumbnail URL
          url: 'https://sachatapp.blob.core.windows.net/containerchatapp/Norway.mp4?sp=r&st=2024-10-17T12:57:59Z&se=2024-11-17T20:57:59Z&sv=2022-11-02&sr=b&sig=jtNsSqWA0Rxs5c8ci6LUbO5kjJMdcHrNbzYejw4mvV0%3D',
          duration: '1:00:55'
        }
      ];
      setVideos(videoData);
    };

    fetchVideos();
  }, []);

  // Function to handle video selection
  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  return (
    <div className="video-grid-container">
      {selectedVideo ? (
        <div className="video-player-container">
          <h3>{selectedVideo.title}</h3>
          <video
            src={selectedVideo.url}
            controls
            autoPlay
            className="video-player"
          ></video>
          <button onClick={() => setSelectedVideo(null)}>Back to Grid</button>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <div key={video.id} className="video-card" onClick={() => handleVideoSelect(video)}>
              <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
              <div className="video-info">
                <p className="video-title">{video.title}</p>
                <p className="video-duration">{video.duration}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
